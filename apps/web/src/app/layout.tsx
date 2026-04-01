import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KcOidc',
  description: 'Next.js BFF Architecture',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <Header />

        {/* Main Content
          Add pb-20 (padding-bottom: 5rem) so the 
          bottom content is not hidden by the BottomNav!
        */}
        <main className="pb-20">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}