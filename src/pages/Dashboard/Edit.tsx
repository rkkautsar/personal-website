import { adminFetch } from './api';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EditLink() {
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const path = data.get('path') as string;
    const link = data.get('link') as string;

    setError('');
    try {
      await adminFetch(`/api/admin/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, link }),
      });

      form.reset();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <p role="alert">{error}</p>}
      <Input name="path" placeholder="Path" />
      <Input name="link" placeholder="Link" />
      <Button type="submit">Add</Button>
    </form>
  );
}
