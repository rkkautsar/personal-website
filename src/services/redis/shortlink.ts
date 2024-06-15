'use server';

import { redis } from '@/services/redis/index';

interface Entry {
  redirect: string | null;
  lastFetched: number;
}

const MAX_STALE_TIME_MS = 1000 * 60 * 60 * 3; // 3 hours
const cache = new Map<string, Entry>();

export interface ShortLink {
  path: string;
  redirect: string;
}

export async function addLink(path: string, link: string) {
  return redis.hset('links', { [path]: link });
}

export async function remLink(path: string) {
  return redis.hdel('links', path);
}

export async function findShortLink(
  query: string,
  limit = 10
): Promise<ShortLink[]> {
  let cursor = 0;
  const result: ShortLink[] = [];

  do {
    const [next, res] = await redis.hscan('links', cursor, {
      match: query ? `*${query}*` : '*',
      count: 10,
    });
    for (let i = 0; i < res.length; i += 2) {
      const path = res[i] as string;
      const redirect = res[i + 1] as string;
      result.push({ path, redirect });
    }
    cursor = next;
  } while (cursor !== 0 && result.length < limit);

  return result;
}

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
