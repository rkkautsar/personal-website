import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { workSans } from '@/app/fonts';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Rakha Kanz Kautsasr',
  description: 'Rakha Kanz Kautsar, front-end software engineer @ TikTok',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workSans.className}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "c562bd6846a947bf9731e595b478ad27"}'
      />
    </html>
  );
}
