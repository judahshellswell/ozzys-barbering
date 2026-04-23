import type { Metadata } from 'next/dist/types';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/layout/Providers';
import { businessConfig } from '@/config/business.config';

export const metadata: Metadata = {
  title: businessConfig.seo.title,
  description: businessConfig.seo.description,
  openGraph: {
    title: businessConfig.seo.title,
    description: businessConfig.seo.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
