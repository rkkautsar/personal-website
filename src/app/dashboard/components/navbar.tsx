import { Home } from 'lucide-react';
import { UserSessionPill } from '@/app/dashboard/components/sessionPill';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function NavBar() {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  return (
    <header className="flex flex-row justify-between p-4">
      <div className="flex flex-row items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <Home className="w-4 h-4" />{' '}
          </Link>
        </Button>
        <h3>Dashboard</h3>
      </div>
      <UserSessionPill user={session.user} />
    </header>
  );
}
