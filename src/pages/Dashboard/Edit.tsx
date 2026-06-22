import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '';
const API_SECRET = 'bbd4966f7647870920ac3e54662cad1805fb095190b0e447a808825b8995f472';

export function EditLink() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const path = data.get('path') as string;
    const link = data.get('link') as string;

    await fetch(`${WORKER_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify({ path, link }),
    });

    form.reset();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input name="path" placeholder="Path" />
      <Input name="link" placeholder="Link" />
      <Button type="submit">Add</Button>
    </form>
  );
}
