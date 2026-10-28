import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { verifyAccess } from '../server/access.ts';
import { verifyTurnstile } from '../server/turnstile.ts';
import { onRequest as publicRoute } from '../functions/api/discussion/[slug].ts';
import { onRequest as adminRoute } from '../functions/dashboard/comments.ts';
import { onRequest as dashboardRoute } from '../functions/dashboard/index.ts';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of ['0001_discussion.sql', '0002_discussion_rate_limits.sql', '0003_remove_server_rate_limits.sql']) sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  return { prepare(sql) { const bound = (...args) => { const stmt = sqlite.prepare(sql); return { async run() { return { meta: { changes: Number(stmt.run(...args).changes) } }; }, async first() { return stmt.get(...args) ?? null; }, async all() { return { results: stmt.all(...args) }; } }; }; return { bind: bound, ...bound() }; } };
}
const request = (method, data, ip = '192.0.2.1') => new Request('https://rakha.dev/api/discussion/making-shopping-cart-loads-feel-instant', { method, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, body: JSON.stringify(data) });
const ctx = (db, req) => ({ request: req, env: { DB: db, TURNSTILE_SITE_KEY: 'unit-site', TURNSTILE_SECRET_KEY: 'unit-secret' }, params: { slug: 'making-shopping-cart-loads-feel-instant' } });

test('comment creation is idempotent even after the response is lost', async () => {
 const originalFetch = globalThis.fetch; globalThis.fetch = async () => Response.json({success: true, hostname: 'rakha.dev', action: 'comment'});
 try {
  const db = database(), token = 'ab'.repeat(32), id = crypto.randomUUID();
  const post = () => publicRoute(ctx(db, request('POST', { id, token, author: 'Guest', body: 'hello', challenge: 'valid-proof' })));
  const results = await Promise.all([post(), post()]);
  assert.ok(results.every(r => r.status === 200 || r.status === 201));
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM comments').bind().first()).n, 1);
  assert.equal((await post()).status, 200);
  assert.equal((await publicRoute(ctx(db, request('POST', { id, token: 'cd'.repeat(32), author: 'Guest', body: 'hello', challenge: 'valid-proof' })))).status, 409);
 } finally { globalThis.fetch = originalFetch; }
});
test('Access verifies signature, audience, issuer, expiry, and email', async () => {
 const { publicKey, privateKey } = await generateKeyPair('RS256'); const jwk = await exportJWK(publicKey); jwk.kid = 'test'; const key = createLocalJWKSet({ keys: [jwk] });
 const config = { ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com', ACCESS_AUD: 'audience', ACCESS_ADMIN_EMAIL: 'owner@example.com' };
 const sign = (payload, issuer = config.ACCESS_TEAM_DOMAIN, audience = config.ACCESS_AUD, exp = '5m') => new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuedAt().setIssuer(issuer).setAudience(audience).setExpirationTime(exp).sign(privateKey);
 assert.equal(await verifyAccess(await sign({email: 'owner@example.com'}), config, key), true);
 assert.equal(await verifyAccess(await sign({email: 'other@example.com'}), config, key), false);
 assert.equal(await verifyAccess(await sign({email: 'owner@example.com'}, config.ACCESS_TEAM_DOMAIN, 'other'), config, key), false);
 assert.equal(await verifyAccess(await sign({email: 'owner@example.com'}, 'https://other.cloudflareaccess.com'), config, key), false);
 assert.equal(await verifyAccess(await sign({email: 'owner@example.com'}, config.ACCESS_TEAM_DOMAIN, config.ACCESS_AUD, '-1s'), config, key), false);
 assert.equal(await verifyAccess('not-a-token', config, key), false);
 const res = await adminRoute({ request: new Request('https://example.pages.dev/dashboard/comments', { headers: { 'Cf-Access-Jwt-Assertion': 'forged' } }), env: { DB: database() } });
 assert.equal(res.status, 403);
});

test('Turnstile validates response, action, hostname and fails closed', async () => {
 const req = new Request('https://rakha.dev/api/discussion/x');
 const response = value => async () => Response.json(value);
 assert.equal(await verifyTurnstile('real-secret', 'proof', req, response({success:true, hostname:'rakha.dev', action:'comment'})), true);
 assert.equal(await verifyTurnstile('real-secret', 'proof', req, response({success:true, hostname:'other.dev', action:'comment'})), false);
 assert.equal(await verifyTurnstile('real-secret', 'proof', req, response({success:true, hostname:'rakha.dev', action:'other'})), false);
 assert.equal(await verifyTurnstile('real-secret', 'proof', req, response({success:false})), false);
 assert.equal(await verifyTurnstile('1x0000000000000000000000000000000AA', 'proof', req, response({success:true, hostname:'localhost', action:'test'})), false);
 assert.equal(await verifyTurnstile('real-secret', '', req, response({success:true})), false);
});

test('moderation route requires a verified Access identity and same-origin deletion', async () => {
 const db = database(), pair = await generateKeyPair('RS256'), jwk = await exportJWK(pair.publicKey); jwk.kid = 'admin-test';
 const env = { DB: db, ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com', ACCESS_AUD: 'admin-audience', ACCESS_ADMIN_EMAIL: 'owner@example.com' };
 const signed = await new SignJWT({email:'owner@example.com'}).setProtectedHeader({alg:'RS256',kid:'admin-test'}).setIssuedAt().setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(env.ACCESS_AUD).setExpirationTime('5m').sign(pair.privateKey);
 const originalFetch = globalThis.fetch; globalThis.fetch = async () => Response.json({keys:[jwk]});
 const id = crypto.randomUUID(); await db.prepare('INSERT INTO comments (id, post_slug, author, body, created_at, delete_token_hash) VALUES (?, ?, ?, ?, ?, ?)').bind(id, 'making-shopping-cart-loads-feel-instant', 'Guest', 'A comment', new Date().toISOString(), 'secret-hash').run();
 const req = (method, origin = 'https://rakha.dev') => new Request('https://rakha.dev/dashboard/comments?api=1', {method, headers:{'Cf-Access-Jwt-Assertion':signed, ...(method === 'DELETE' ? {'Content-Type':'application/json', Origin:origin} : {})}, body:method === 'DELETE' ? JSON.stringify({id}) : undefined});
 try {
  const home = await dashboardRoute({request:new Request('https://rakha.dev/dashboard/', {headers:{'Cf-Access-Jwt-Assertion':signed}}),env});
  assert.equal(home.status,200); assert.match(await home.text(), /href="\/dashboard\/comments"/);
  const list = await adminRoute({request:req('GET'),env}); assert.equal(list.status,200); const data = await list.json(); assert.equal(data.comments.length,1); assert.equal(JSON.stringify(data).includes('secret-hash'),false);
  assert.equal((await adminRoute({request:req('DELETE','https://attacker.example'),env})).status,403);
  assert.equal((await adminRoute({request:req('DELETE'),env})).status,200);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM comments').bind().first()).n,0);
 } finally { globalThis.fetch = originalFetch; }
});
