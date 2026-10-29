import { verifyAccess, type AccessConfig } from '../../server/access.ts';
interface Env extends AccessConfig {
  DB: D1Database;
}
const headers = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers });
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Moderate comments</title><style>
:root{color-scheme:dark}body{max-width:760px;margin:0 auto;padding:3rem 1.5rem;background:#1e2019;color:#fbfaf8;font:16px/1.5 system-ui,sans-serif}a{color:#e7decd}h1{margin:2.5rem 0 .5rem;font-size:2rem}p{color:#c6bfaf}article{padding:1.5rem 0;border-bottom:1px solid #e7decd24}article p{white-space:pre-wrap;overflow-wrap:anywhere;margin:.75rem 0}small{color:#aaa99e}button{color:#e7decd;background:transparent;border:1px solid #e7decd44;border-radius:99px;padding:.45rem .8rem;cursor:pointer}button:hover{border-color:#e7decd}button:disabled{opacity:.5;cursor:wait}#status{margin:1rem 0;color:#d5949d}
</style></head><body><a href="/dashboard/">← Dashboard</a><h1>Comment moderation</h1><p>Recent comments across your articles.</p><div id="status" role="status"></div><div id="comments"></div><button id="more" type="button" hidden>Load more</button><script>
const list=document.querySelector('#comments'),status=document.querySelector('#status'),more=document.querySelector('#more');let cursor='';
async function load(){more.disabled=true;try{const url=new URL(location.href);url.search='';url.searchParams.set('api','1');if(cursor)url.searchParams.set('before',cursor);const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();for(const comment of data.comments){const row=document.createElement('article'),meta=document.createElement('small'),body=document.createElement('p'),button=document.createElement('button');meta.textContent=comment.author+' · '+comment.post_slug+' · '+new Date(comment.created_at).toLocaleString();body.textContent=comment.body;button.textContent='Delete';button.type='button';button.addEventListener('click',async()=>{if(!confirm('Delete this comment?'))return;button.disabled=true;try{const r=await fetch(location.pathname,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:comment.id})});if(!r.ok)throw Error();row.remove();status.textContent='Comment deleted.'}catch{status.textContent='Could not delete the comment. Please try again.';button.disabled=false}});row.append(meta,body,button);list.append(row)}cursor=data.next||'';more.hidden=!cursor;if(!list.children.length)status.textContent='No comments yet.'}catch{status.textContent='Could not load comments. Please try again.'}finally{more.disabled=false}}more.addEventListener('click',load);load();
</script></body></html>`;
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion') ?? '';
  if (!(await verifyAccess(assertion, env)))
    return json({ error: 'Unauthorized' }, 403);
  if (!env.DB) return json({ error: 'Unavailable' }, 503);
  if (request.method === 'GET') {
    const url = new URL(request.url);
    if (url.searchParams.get('api') !== '1')
      return new Response(html, {
        headers: {
          ...headers,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy':
            "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
        },
      });
    const before = url.searchParams.get('before');
    if (
      before &&
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z\|[0-9a-f-]{36}$/.test(before)
    )
      return json({ error: 'Invalid cursor' }, 400);
    const [date, id] = (before ?? '').split('|');
    const result = await env.DB.prepare(
      'SELECT id, post_slug, author, body, created_at FROM comments WHERE (? = ? OR created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC, id DESC LIMIT 51'
    )
      .bind(before ?? '', '', date ?? '', date ?? '', id ?? '')
      .all<{ id: string; created_at: string }>();
    const comments = result.results.slice(0, 50);
    const last = comments[comments.length - 1];
    return json({
      comments,
      next:
        result.results.length > 50 && last
          ? `${last.created_at}|${last.id}`
          : null,
    });
  }
  if (request.method === 'DELETE') {
    if (
      request.headers.get('origin') !== new URL(request.url).origin ||
      !request.headers.get('content-type')?.startsWith('application/json')
    )
      return json({ error: 'Invalid request' }, 403);
    const text = await request.text();
    if (text.length > 1000) return json({ error: 'Invalid request' }, 400);
    let data: { id?: unknown };
    try {
      data = JSON.parse(text);
    } catch {
      return json({ error: 'Invalid request' }, 400);
    }
    if (
      typeof data?.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        data.id
      )
    )
      return json({ error: 'Invalid request' }, 400);
    await env.DB.prepare('DELETE FROM comments WHERE id = ?')
      .bind(data.id)
      .run();
    return json({ deleted: true });
  }
  return json({ error: 'Method not allowed' }, 405);
};
