import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppProvider } from '@/lib/store';
import './globals.css';
import './theme.css';
import './hero.css';
import './playful.css';
import './category-store.css';
import './pet-editor.css';
import '@fontsource/chewy/latin-400.css';
const displayFont = localFont({ src: '../../public/fonts/Nunito.ttf', variable: '--font-display', weight: '200 1000', display: 'swap' });
export const metadata: Metadata = {
  title: { default: 'WoobleWorks — The 3D print shop', template: '%s | WoobleWorks' },
  description: 'Explore 3D printed pet tags, clickers, letters, characters, cute animals, and lamps from WoobleWorks.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" className={displayFont.variable}><body><AppProvider>{children}</AppProvider></body></html>;
}
