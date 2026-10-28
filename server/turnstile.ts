const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const testSecret = '1x0000000000000000000000000000000AA';
export async function verifyTurnstile(secret: string, token: string, request: Request, fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!secret || !token || token.length > 2048) return false;
  const host = new URL(request.url).hostname;
  const isTest = secret === testSecret && (host === 'localhost' || host === '127.0.0.1');
  if (secret === testSecret && !isTest) return false;
  try {
    const response = await fetcher(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: token, remoteip: request.headers.get('CF-Connecting-IP') ?? undefined }), signal: AbortSignal.timeout(8000) });
    if (!response.ok) { console.warn('Turnstile Siteverify returned HTTP', response.status); return false; }
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string; 'error-codes'?: string[] };
    const valid = result.success === true && (isTest || (result.hostname === host && result.action === 'comment'));
    if (!valid) console.warn('Turnstile verification rejected', { codes: result['error-codes'], hostname: result.hostname, action: result.action, test: isTest });
    return valid;
  } catch (error) { console.warn('Turnstile Siteverify unavailable', error instanceof Error ? error.name : 'unknown error'); return false; }
}
