import type { Metadata } from 'next';
import { WoobletApp } from '@/components/app';
import { LaunchPage } from '@/components/launch-page';
import { showLaunchPreview } from '@/lib/launch';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ path?: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  if (showLaunchPreview(path)) return { title: 'Launching November 30', description: 'A little joy is on its way. Preview playful, personalized 3D prints from WoobleWorks, launching November 30, 2026.' };
  const privatePage = ['t', 'dashboard', 'admin', 'order', 'checkout', 'cart', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email'].includes(path[0]);
  const titles: Record<string, string> = { 'community-feedback': 'Community Feedback', shop: 'Shop personalized pet tags', dashboard: 'Your little family', admin: 'WoobleWorks studio', t: 'Wooblet pet profile', order: 'Your Wooblet order', cart: 'Your bag', checkout: 'Checkout', login: 'Welcome back', register: 'Join the family', privacy: 'Privacy', terms: 'Terms' };
  return { ...(titles[path[0]] ? { title: titles[path[0]] } : {}), ...(privatePage ? { robots: { index: false, follow: false } } : {}) };
}
export default async function Page({ params }: Props) {
  const { path = [] } = await params;
  if (showLaunchPreview(path)) return <LaunchPage />;
  return <WoobletApp path={path} />;
}
