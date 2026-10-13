import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, createLocalJWKSet, exportJWK } from 'jose';
import { authorizeAdmin } from './auth';
import worker, { type Env } from './index';
const env = { ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com', ACCESS_AUD: 'admin-app', ADMIN_EMAILS: 'admin@example.com', ADMIN_ORIGIN: 'https://rakha.dev' };
const pair = await generateKeyPair('RS256');
const jwk = await exportJWK(pair.publicKey);
const keys = createLocalJWKSet({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] });
async function token(overrides: Record<string, unknown> = {}, key = pair.privateKey) {
  return new SignJWT({ email: 'admin@example.com', ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(env.ACCESS_AUD).setSubject('user').setIssuedAt().setExpirationTime('5m').sign(key);
}
function request(jwt?: string, origin = env.ADMIN_ORIGIN) {
  return new Request('https://rakha.dev/api/admin/links', { method: 'POST', headers: { Origin: origin, ...(jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {}) } });
}
test('signed admin identity is accepted', async () => assert.equal(await authorizeAdmin(request(await token()), env, keys), null));
test('missing identity and old bearer cannot authorize', async () => {
  const req = request(); req.headers.set('Authorization', 'Bearer formerly-exposed-secret');
  assert.equal((await authorizeAdmin(req, env, keys))?.status, 401);
});
test('configuration fails closed', async () => assert.equal((await authorizeAdmin(request(), { ...env, ACCESS_AUD: '' }, keys))?.status, 503));
test('valid non-admin identity is forbidden', async () => assert.equal((await authorizeAdmin(request(await token({ email: 'other@example.com' })), env, keys))?.status, 403));
test('cross-origin and missing-origin writes are forbidden', async () => {
  for (const origin of ['https://evil.example', '']) assert.equal((await authorizeAdmin(request(await token(), origin), env, keys))?.status, 403);
});
test('bad signatures, expired tokens, wrong issuer/audience, missing claims fail', async () => {
  const other = await generateKeyPair('RS256');
  const invalid = [await token({}, other.privateKey), 'not-a-jwt'];
  for (const change of [{ aud: 'other' }, { iss: 'https://evil.example' }, { exp: 1 }, { email: undefined }]) {
    invalid.push(await new SignJWT({ email: 'admin@example.com', aud: env.ACCESS_AUD, iss: env.ACCESS_TEAM_DOMAIN, sub: 'user', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+300, ...change }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(pair.privateKey));
  }
  for (const jwt of invalid) assert.equal((await authorizeAdmin(request(jwt), env, keys))?.status, 401);
});
test('all mutation routes deny before touching KV; public routes stay available', async () => {
  let writes = 0;
  const LINKS = { get: async (key: string) => key === 'link:/hello' ? 'https://example.com' : null, list: async () => ({ keys: [] }), put: async () => { writes++; }, delete: async () => { writes++; } } as unknown as KVNamespace;
  const workerEnv = { ...env, LINKS } as Env;
  for (const path of ['/api/links', '/api/admin/links', '/api/links/%2Fhello', '/api/admin/links/%2Fhello']) {
    for (const method of ['POST', 'DELETE', 'PUT', 'PATCH']) {
      const res = await worker.fetch(new Request(`https://rakha.dev${path}`, { method, headers: { Origin: env.ADMIN_ORIGIN, Authorization: 'Bearer old-secret' } }), workerEnv);
      assert.equal(res.status, 401);
    }
  }
  assert.equal(writes, 0);
  assert.equal((await worker.fetch(new Request('https://rakha.dev/api/links'), workerEnv)).status, 200);
  const redirect = await worker.fetch(new Request('https://rakha.dev/l/hello'), workerEnv);
  assert.equal(redirect.status, 301); assert.equal(redirect.headers.get('Location'), 'https://example.com/');
});

test('verified session can create and delete through the actual Worker', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] }));
  const store = new Map<string, string>();
  const LINKS = { get: async () => null, list: async () => ({ keys: [] }), put: async (key: string, value: string) => { store.set(key, value); }, delete: async (key: string) => { store.delete(key); } } as unknown as KVNamespace;
  const headers = { Origin: env.ADMIN_ORIGIN, 'Cf-Access-Jwt-Assertion': await token(), 'Content-Type': 'application/json' };
  try {
    const created = await worker.fetch(new Request('https://rakha.dev/api/admin/links', { method: 'POST', headers, body: JSON.stringify({ path: '/new', link: 'https://example.com' }) }), { ...env, LINKS });
    assert.equal(created.status, 200); assert.equal(store.get('link:/new'), 'https://example.com');
    const deleted = await worker.fetch(new Request('https://rakha.dev/api/admin/links/%2Fnew', { method: 'DELETE', headers }), { ...env, LINKS });
    assert.equal(deleted.status, 200); assert.equal(store.size, 0);
    const malformed = await worker.fetch(new Request('https://rakha.dev/api/admin/links', { method: 'POST', headers, body: 'not-json' }), { ...env, LINKS });
    assert.equal(malformed.status, 400);
  } finally { fetchMock.mock.restore(); }
});
