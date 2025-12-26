import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = 'https://gdpi.app';

export const viewport: Viewport = {
  themeColor: '#0B1220',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GDPI — Garage Door Price Index for HOAs',
    template: '%s — GDPI',
  },
  description:
    'A professional HOA service that helps residents avoid overpriced garage door quotes using Arizona baseline pricing, community history, and practical “before you approve” checklists.',
  applicationName: 'GDPI',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'GDPI — Garage Door Price Index for HOAs',
    description:
      'Help your community spot overpriced quotes and ask better questions—without picking fights. Arizona baselines, community pricing history, and practical checklists.',
    siteName: 'GDPI',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} antialiased bg-slate-950 text-slate-50`}>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:ring-2 focus:ring-cyan-400"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="min-h-[70vh]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
