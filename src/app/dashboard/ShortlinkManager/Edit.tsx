'use client';

import { Button, TextField } from '@radix-ui/themes';
import { useRef } from 'react';
import { addLink } from '@/services/redis/shortlink';

export function EditLink() {
  const formRef = useRef<HTMLFormElement>(null);

  async function formAction(formData: FormData) {
    const path = formData.get('path') as string;
    const link = formData.get('link') as string;
    await addLink(path, link);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <TextField.Root name="path" variant="surface" placeholder="Path" />
      <TextField.Root name="link" variant="surface" placeholder="Link" />
      <Button type="submit">Add</Button>
    </form>
  );
}
