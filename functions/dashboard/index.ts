import { verifyAccess, type AccessConfig } from '../../server/access.ts';

const headers = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export const onRequest: PagesFunction<AccessConfig> = async ({
  request,
  env,
}) => {
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion') ?? '';
  if (!(await verifyAccess(assertion, env)))
    return Response.json({ error: 'Unauthorized' }, { status: 403, headers });
  if (request.method !== 'GET')
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers }
    );
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Dashboard</title><style>:root{color-scheme:dark}body{max-width:760px;margin:0 auto;padding:3rem 1.5rem;background:#1e2019;color:#fbfaf8;font:16px/1.5 system-ui,sans-serif}a{color:#e7decd}h1{margin:2.5rem 0 1.5rem;font-size:2rem}.item{display:block;padding:1.25rem 0;border-top:1px solid #e7decd24;border-bottom:1px solid #e7decd24;text-decoration:none}.item:hover{text-decoration:underline;text-underline-offset:.2em}.description{display:block;margin-top:.4rem;color:#aaa99e;font-size:.9rem}</style></head><body><a href="/">← Home</a><main><h1>Dashboard</h1><a class="item" href="/dashboard/comments">Comments <span aria-hidden="true">↗</span><span class="description">Review and remove comments from your articles.</span></a></main></body></html>`;
  return new Response(html, {
    headers: {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
};
