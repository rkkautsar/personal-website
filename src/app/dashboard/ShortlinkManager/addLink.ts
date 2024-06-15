'use server';

import { addLink } from '@/services/redis/shortlink';

export async function addLinkAction(formData: FormData) {
  const path = formData.get('path') as string;
  const link = formData.get('link') as string;
  console.log({ path, link });
  // await addLink(path, link);
}
