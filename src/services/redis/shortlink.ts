import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.SHORTLINK_REDIS_URL,
  token: process.env.SHORTLINK_REDIS_TOKEN,
});

interface Entry {
  redirect: string | null;
  lastFetched: number;
}

const MAX_STALE_TIME_MS = 1000 * 60 * 60 * 3; // 3 hours
const cache = new Map<string, Entry>();

export async function getShortLink(path: string): Promise<string | null> {
  const entry = cache.get(path);
  if (entry && Date.now() - entry.lastFetched < MAX_STALE_TIME_MS) {
    return Promise.resolve(entry.redirect);
  }
  const link = await _getShortLink(path);
  cache.set(path, {
    redirect: link,
    lastFetched: Date.now(),
  });
  return link;
}

function _getShortLink(path: string): Promise<string | null> {
  return redis.hget('links', path);
}
