import { signOut } from '@/auth';
import { Avatar, Button, DropdownMenu } from '@radix-ui/themes';
import { Session } from 'next-auth';

export function UserSessionPill({ user }: { user: Session['user'] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft" radius="full">
          <Avatar size="1" src={user?.image!} fallback={user?.name?.[0]!} />
          <span>{user?.name}</span>
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <Button type="submit" variant="ghost">
              Sign Out
            </Button>
          </form>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
