import type { Metadata } from 'next';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { NavBar } from '@/app/dashboard/components/navbar';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Theme
      accentColor="iris"
      grayColor="slate"
      appearance="dark"
      panelBackground="solid"
      scaling="100%"
    >
      <NavBar />
      {children}
    </Theme>
  );
}
