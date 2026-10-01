import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppProvider } from '@/lib/store';
import './globals.css';
import './theme.css';
import './hero.css';
const displayFont = localFont({ src: '../../public/fonts/Nunito.ttf', variable: '--font-display', weight: '200 1000', display: 'swap' });
export const metadata: Metadata = {
  title: { default: 'Wooblet — Your pet’s little link home', template: '%s | Wooblet' },
  description: 'Personalized NFC + QR pet tags. A little tag that keeps your best friend connected to home.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" className={displayFont.variable}><body><AppProvider>{children}</AppProvider></body></html>;
}
