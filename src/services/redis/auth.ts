'use server';

import { redis } from '@/services/redis/index';

export async function isAuthorized(email?: string | null) {
  if (!email) {
    return false;
  }
  const isAdmin = await redis.sismember('admins', email);
  return isAdmin === 1;
}
