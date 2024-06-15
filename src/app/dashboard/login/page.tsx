import { signIn } from '@/auth';
import { Button } from '@radix-ui/themes';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  return (
    <div className="h-[100vh] w-full flex items-center justify-center">
      <form
        action={async () => {
          'use server';
          await signIn('github');
          redirect('/dashboard');
        }}
      >
        <Button type="submit">Sign in with GitHub</Button>
      </form>
    </div>
  );
}
