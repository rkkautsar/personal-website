import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AdminEnv {
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_EMAILS: string;
  ADMIN_ORIGIN: string;
}
const keySets = new Map<string, JWTVerifyGetKey>();

// The injectable key resolver lets tests use real signatures without network access.
export async function authorizeAdmin(request: Request, env: AdminEnv, keys?: JWTVerifyGetKey): Promise<Response | null> {
  const deny = (status: number, error: string) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!env.ACCESS_TEAM_DOMAIN || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN) || !env.ACCESS_AUD || !env.ADMIN_EMAILS || !env.ADMIN_ORIGIN) {
    return deny(503, 'Admin authentication is not configured');
  }
  if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') !== env.ADMIN_ORIGIN) {
    return deny(403, 'Invalid request origin');
  }
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return deny(401, 'Sign in through Cloudflare Access');
  try {
    if (!keys) {
      keys = keySets.get(env.ACCESS_TEAM_DOMAIN);
      if (!keys) {
        keys = createRemoteJWKSet(new URL(`${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`));
        keySets.set(env.ACCESS_TEAM_DOMAIN, keys);
      }
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD, algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'sub', 'email'],
    });
    const admins = env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
    if (typeof payload.email !== 'string' || !admins.includes(payload.email.toLowerCase())) return deny(403, 'Admin access required');
    return null;
  } catch {
    return deny(401, 'Invalid or expired Access session');
  }
}
