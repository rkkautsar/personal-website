'use server';

import { redis } from '@/services/redis/index';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 15 * 60 * 1000, // 15 mins
  ttlAutopurge: false,
  fetchMethod: async (key) => {
    return (await redis.sismember('admins', key)) == 1;
  },
});

export async function isAuthorized(email?: string | null) {
  if (!email) {
    return false;
  }
  return cache.fetch(email);
}
