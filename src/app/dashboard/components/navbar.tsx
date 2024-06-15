import { Heading } from '@radix-ui/themes';
import { UserSessionPill } from '@/app/dashboard/components/sessionPill';
import { auth } from '@/auth';

export async function NavBar() {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  return (
    <header className="flex flex-row justify-between p-4">
      <Heading>Dashboard</Heading>
      <UserSessionPill user={session.user} />
    </header>
  );
}
