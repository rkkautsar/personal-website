import { auth, signOut } from '@/auth';
import { Button } from '@radix-ui/themes';

export default async function UnauthorizedPage() {
  const session = await auth();
  return (
    <div className="h-[100vh] w-full flex flex-col gap-2 items-center justify-center">
      <p>{session?.user?.email} is not an admin.</p>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
