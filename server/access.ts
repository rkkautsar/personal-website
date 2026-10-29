import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AccessConfig {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ACCESS_ADMIN_EMAIL?: string;
}
let cached:
  { domain: string; keys: ReturnType<typeof createRemoteJWKSet> } | undefined;
export async function verifyAccess(
  token: string,
  config: AccessConfig,
  getKey?: JWTVerifyGetKey
): Promise<boolean> {
  const {
    ACCESS_TEAM_DOMAIN: domain,
    ACCESS_AUD: audience,
    ACCESS_ADMIN_EMAIL: email,
  } = config;
  if (
    !domain ||
    !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain) ||
    !audience ||
    !email ||
    !token
  )
    return false;
  try {
    if (!getKey && (!cached || cached.domain !== domain))
      cached = {
        domain,
        keys: createRemoteJWKSet(new URL(`${domain}/cdn-cgi/access/certs`)),
      };
    const { payload } = await jwtVerify(token, getKey ?? cached!.keys, {
      issuer: domain,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'email'],
    });
    return (
      typeof payload.email === 'string' &&
      payload.email.toLowerCase() === email.trim().toLowerCase()
    );
  } catch {
    return false;
  }
}
