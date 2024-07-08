'use client';

import { useRef } from 'react';
import { addLink } from '@/services/redis/shortlink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EditLink() {
  const formRef = useRef<HTMLFormElement>(null);

  async function formAction(formData: FormData) {
    const path = formData.get('path') as string;
    const link = formData.get('link') as string;
    await addLink(path, link);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Input name="path" placeholder="Path" />
      <Input name="link" placeholder="Link" />
      <Button type="submit">Add</Button>
    </form>
  );
}
