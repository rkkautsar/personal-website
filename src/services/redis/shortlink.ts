'use server';

import { redis } from '@/services/redis/index';
import { LRUCache } from 'lru-cache';

interface Entry {
  redirect: string | null;
  lastFetched: number;
}

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

const cache = new LRUCache<string, string>({
  max: 200,
  ttl: 3 * 60 * 60 * 1000, // 3 hrs
  ttlAutopurge: false,
  allowStale: true,
  fetchMethod: async (path) => {
    const redirect = await redis.hget<string>('links', path);
    return redirect ?? '';
  },
});

export async function getShortLink(path: string): Promise<string | null> {
  const redirect = await cache.fetch(path);
  return redirect ? redirect : null;
}
