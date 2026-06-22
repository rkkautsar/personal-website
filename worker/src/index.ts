const ALLOWED_ORIGINS = [
  'https://personal-website-7dt.pages.dev',
  'https://rakha.dev',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

interface Env {
  LINKS: KVNamespace;
  API_SECRET: string;
}

interface ShortLinkEntry {
  path: string;
  redirect: string;
  hits?: number;
}

const HITS_KEY = 'hits';
const LINK_LIST_KEY = 'link-list';

function checkAuth(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  return authHeader === `Bearer ${env.API_SECRET}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    const origin = request.headers.get('Origin');

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(origin) });
    }

    // GET /l/:path — redirect shortlink with hit tracking
    const shortLinkMatch = pathname.match(/^\/l\/(.+)$/);
    if (shortLinkMatch) {
      const path = 'link:/' + shortLinkMatch[1];
      const redirect = await env.LINKS.get(path);
      if (redirect) {
        // Hit tracking: increment counter for this path
        const shortPath = '/' + shortLinkMatch[1];
        const hits = (await env.LINKS.get(HITS_KEY, 'json')) as Record<string, number> | null;
        const updatedHits = hits ?? {};
        updatedHits[shortPath] = (updatedHits[shortPath] ?? 0) + 1;
        await env.LINKS.put(HITS_KEY, JSON.stringify(updatedHits));

        return Response.redirect(redirect, 301);
      }
      return new Response('Not found', { status: 404, headers: getCorsHeaders(origin) });
    }

    // GET /api/links — list/search shortlinks with hit counts and ordering
    if (pathname === '/api/links' && method === 'GET') {
      const query = url.searchParams.get('query') || '';
      const result: ShortLinkEntry[] = [];

      const list = await env.LINKS.list({ prefix: 'link:' });
      for (const key of list.keys) {
        const value = await env.LINKS.get(key.name);
        if (value) {
          const path = key.name.slice('link:'.length);
          if (!query || path.includes(query) || value.includes(query)) {
            result.push({ path, redirect: value });
          }
        }
      }

      // Get hit counts
      const hits = (await env.LINKS.get(HITS_KEY, 'json')) as Record<string, number> | null;

      // Attach hit counts to results
      if (hits) {
        for (const entry of result) {
          entry.hits = hits[entry.path] ?? 0;
        }
      }

      // Get ordered link list
      const linkList = (await env.LINKS.get(LINK_LIST_KEY, 'json')) as string[] | null;

      if (linkList) {
        // Sort: links in link-list come first (in that order), then any unlisted links alphabetically
        const listedMap = new Map(linkList.map((p, i) => [p, i]));
        result.sort((a, b) => {
          const aIdx = listedMap.has(a.path) ? listedMap.get(a.path)! : Infinity;
          const bIdx = listedMap.has(b.path) ? listedMap.get(b.path)! : Infinity;
          if (aIdx !== bIdx) return aIdx - bIdx;
          return a.path.localeCompare(b.path);
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    // POST /api/links — add a shortlink (protected)
    if (pathname === '/api/links' && method === 'POST') {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      const body = (await request.json()) as { path: string; link: string };
      if (!body.path || !body.link) {
        return new Response(JSON.stringify({ error: 'path and link required' }), {
          status: 400,
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }
      const key = 'link:' + body.path;
      await env.LINKS.put(key, body.link);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/links/:path — delete a shortlink (protected)
    const deleteMatch = pathname.match(/^\/api\/links\/(.+)$/);
    if (deleteMatch && method === 'DELETE') {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      const path = decodeURIComponent(deleteMatch[1]);
      await env.LINKS.delete('link:' + path);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404, headers: getCorsHeaders(origin) });
  },
};
