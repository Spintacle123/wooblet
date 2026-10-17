import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { LaunchCountdown } from './launch-countdown';
import styles from './launch-page.module.css';

const previews = [
  { name: 'Their little link home', category: 'WOOBLET PET TAGS', image: 'wooblets', color: '#f8dfac', alt: 'Wooblet pet tag concept ad: Little tags, big adventures. Personalized NFC and QR pet tags.' },
  { name: 'A little click of joy', category: 'PLAYFUL CLICKERS', image: 'clickers', color: '#e2d9f3', alt: 'Playful clicker concept ad: Click, click! A little joy. Colorful pocket-sized printed clickers.' },
  { name: 'Your ideas. Made personal.', category: 'CUSTOM 3D PRINTS', image: 'custom-prints', color: '#e2d9f3', alt: 'Custom 3D printing concept ad featuring a personalized trophy, medal, and miniature person figurine.' },
];

export function LaunchPage() {
  return <main className={styles.page}>
    <header className={styles.header}>
      <Image src="/woobleworks-logo.png" alt="WoobleWorks" width={1445} height={1089} className={styles.logo} priority />
      <span className={styles.badge}><span /> A LITTLE SOMETHING IS COMING</span>
    </header>
    <section className={styles.hero} aria-labelledby="coming-soon-heading">
      <div className={styles.eyebrow}><Sparkles size={16} aria-hidden="true" /> SMALL PRINTS. BIG PERSONALITY.</div>
      <h1 id="coming-soon-heading">Good things take<br />a little <em>wooble.</em></h1>
      <p>We’re putting the finishing touches on a world of playful, personalized 3D prints.<br className={styles.desktopBreak} /> For your pets, your space, and your everyday joy.</p>
      <LaunchCountdown fullPage />
    </section>
    <section className={styles.preview} aria-labelledby="preview-heading">
      <div className={styles.previewHeading}><span>A SMALL SNEAK PEEK</span><h2 id="preview-heading">A glimpse of what’s coming.</h2><p>Just a few little things we’ve been working on.</p></div>
      <div className={styles.grid}>{previews.map(preview => <article className={styles.card} key={preview.image}>
        <div className={styles.photo} style={{ backgroundColor: preview.color }}>
          <Image src={`/collections/ads/${preview.image}-ad.png`} alt={preview.alt} width={1024} height={1024} sizes="(max-width: 640px) 90vw, (max-width: 1080px) 33vw, 340px" />
        </div>
        <div className={styles.cardCopy}><small>{preview.category}</small><h3>{preview.name}</h3></div>
      </article>)}</div>
      <p className={styles.note}>Concept previews · Final products may differ. More little surprises at launch.</p>
    </section>
    <footer className={styles.footer}><strong>Made with personality. Made for your world.</strong><span>© 2026 WoobleWorks · Designed in the Philippines</span></footer>
  </main>;
}
