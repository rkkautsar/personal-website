import { verifyTurnstile } from '../../../server/turnstile.ts';
import { posts } from '../../../src/blog/metadata.ts';
interface Env { DB: D1Database; TURNSTILE_SITE_KEY?: string; TURNSTILE_SECRET_KEY?: string }
type CommentRow = { id: string; author: string; body: string; created_at: string };
const slugs = new Set(posts.map(({ slug }) => slug));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tokenPattern = /^[0-9a-f]{64}$/;
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
async function digest(token: string) {
  const data = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(data), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function body(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null;
  const text = await request.text();
  if (text.length > 5000) return null;
  try { const value: unknown = JSON.parse(text); return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; } catch { return null; }
}
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = typeof params.slug === 'string' ? params.slug : '';
  if (!slugs.has(slug)) return json({ error: 'Not found' }, 404);
  if (!env.DB) return json({ error: 'Discussion is unavailable.' }, 503);
  try {
    if (request.method === 'GET') {
      const [comments, total] = await Promise.all([
        env.DB.prepare('SELECT id, author, body, created_at FROM comments WHERE post_slug = ? ORDER BY created_at, id').bind(slug).all<CommentRow>(),
        env.DB.prepare('SELECT COALESCE(SUM(count), 0) AS total FROM likes WHERE post_slug = ?').bind(slug).first<{ total: number }>(),
      ]);
      return json({ comments: comments.results, likes: total?.total ?? 0, turnstileSiteKey: env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY ? env.TURNSTILE_SITE_KEY : null });
    }
    if (!['POST', 'PUT', 'DELETE'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403);
    const data = await body(request);
    if (!data) return json({ error: 'Invalid request' }, 400);
    if (request.method === 'PUT') {
      if (typeof data.token !== 'string' || !tokenPattern.test(data.token) || typeof data.count !== 'number' || !Number.isInteger(data.count) || data.count < 0 || data.count > 10) return json({ error: 'Invalid like' }, 400);
      const hash = await digest(data.token);
      await env.DB.prepare('INSERT INTO likes (post_slug, voter_hash, count) VALUES (?, ?, ?) ON CONFLICT(post_slug, voter_hash) DO UPDATE SET count = excluded.count').bind(slug, hash, data.count).run();
      const total = await env.DB.prepare('SELECT COALESCE(SUM(count), 0) AS total FROM likes WHERE post_slug = ?').bind(slug).first<{ total: number }>();
      return json({ likes: total?.total ?? 0 });
    }
    if (typeof data.id !== 'string' || !uuid.test(data.id) || typeof data.token !== 'string' || !tokenPattern.test(data.token)) return json({ error: 'Invalid comment' }, 400);
    const hash = await digest(data.token);
    if (request.method === 'DELETE') {
      const result = await env.DB.prepare('DELETE FROM comments WHERE id = ? AND post_slug = ? AND delete_token_hash = ?').bind(data.id, slug, hash).run();
      if (result.meta.changes) return json({ deleted: true });
      const exists = await env.DB.prepare('SELECT id FROM comments WHERE id = ? AND post_slug = ?').bind(data.id, slug).first<{ id: string }>();
      return exists ? json({ error: 'Comment not found or token invalid' }, 404) : json({ deleted: true });
    }
    if (typeof data.author !== 'string' || typeof data.body !== 'string') return json({ error: 'Invalid comment' }, 400);
    const author = data.author.trim() || 'Guest'; const content = data.body.trim();
    if (author.length > 80 || content.length < 1 || content.length > 1000) return json({ error: 'Invalid comment' }, 400);
    const existing = await env.DB.prepare('SELECT id, author, body, created_at FROM comments WHERE id = ? AND post_slug = ? AND delete_token_hash = ?').bind(data.id, slug, hash).first<CommentRow>();
    if (existing) return json({ comment: existing }, 200);
    if (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY) return json({ error: 'Comment verification unavailable.' }, 503);
    if (typeof data.challenge !== 'string' || !await verifyTurnstile(env.TURNSTILE_SECRET_KEY, data.challenge, request)) return json({ error: 'Verification failed. Please try again.' }, 403);
    const date = new Date().toISOString();
    await env.DB.prepare('INSERT INTO comments (id, post_slug, author, body, created_at, delete_token_hash) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(data.id, slug, author, content, date, hash).run();
    const saved = await env.DB.prepare('SELECT id, author, body, created_at FROM comments WHERE id = ? AND post_slug = ? AND delete_token_hash = ?').bind(data.id, slug, hash).first<CommentRow>();
    return saved ? json({ comment: saved }, 201) : json({ error: 'Comment ID already exists' }, 409);
  } catch (error) { console.error('Discussion database error', error); return json({ error: 'Discussion is unavailable.' }, 503); }
};
