'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LAUNCH_AT } from '@/lib/launch';
import styles from './launch-countdown.module.css';

export function LaunchCountdown({ fullPage = false }: { fullPage?: boolean }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Math.ceil((LAUNCH_AT - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const seconds = remaining ?? 0;
  const units = [
    ['Days', Math.floor(seconds / 86400)],
    ['Hours', Math.floor(seconds / 3600) % 24],
    ['Minutes', Math.floor(seconds / 60) % 60],
    ['Seconds', seconds % 60],
  ] as const;
  const launched = remaining === 0;
  useEffect(() => {
    if (fullPage && launched) router.refresh();
  }, [fullPage, launched, router]);

  return <section className={`${styles.banner} ${fullPage ? styles.fullPage : ''}`} aria-label={fullPage ? 'Launch countdown' : undefined} aria-labelledby={fullPage ? undefined : 'launch-title'}>
    <div className={`container ${styles.inner}`}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}><Sparkles size={16} aria-hidden="true" /> THE COUNTDOWN IS ON</span>
        <h2 id="launch-title">{launched ? 'We’re live. Let the joy begin!' : 'A little joy is on its way.'}</h2>
        <p>Launching <time dateTime="2026-11-30T00:00:00+08:00">November 30, 2026</time> · 12:00 AM Philippine time</p>
      </div>
      {!launched && <div className={styles.clock} role="timer" aria-live="off" aria-label="Time until launch">
        {units.map(([label, value]) => <div className={styles.unit} key={label}>
          <strong>{remaining === null ? '–' : String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>)}
      </div>}
    </div>
  </section>;
}
