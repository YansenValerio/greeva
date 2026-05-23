import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/feedback/Toaster';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Greeva — Brand Hijau Lokal Indonesia',
    template: '%s | Greeva',
  },
  description:
    'Greeva mengkurasi dan memasarkan brand lokal Indonesia yang berkomitmen pada keberlanjutan. Belanja produk ramah lingkungan pilihan.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Greeva',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
        <ConfirmDialog />
      </body>
    </html>
  );
}
