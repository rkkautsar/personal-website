import type { Metadata } from 'next';
import { NavBar } from '@/app/dashboard/components/navbar';
import { TooltipProvider } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <NavBar />
      {children}
    </TooltipProvider>
  );
}
