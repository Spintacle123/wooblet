'use client';

import { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import styles from './facebook-chat.module.css';

function chatDestination() {
  const configured = process.env.NEXT_PUBLIC_MESSENGER_URL || process.env.NEXT_PUBLIC_FACEBOOK_URL;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:') return null;
    if (['m.me', 'messenger.com', 'www.messenger.com'].includes(url.hostname)) return url.href;
    if (!['facebook.com', 'www.facebook.com', 'web.facebook.com', 'm.facebook.com'].includes(url.hostname)) return null;
    const profileId = url.searchParams.get('id');
    if (url.pathname === '/profile.php' && profileId && /^\d+$/.test(profileId)) return `https://m.me/${profileId}`;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length === 1 && /^[a-zA-Z0-9.]+$/.test(parts[0]) && !['share', 'groups', 'watch', 'reel', 'profile.php'].includes(parts[0])) return `https://m.me/${parts[0]}`;
    return url.href;
  } catch {
    return null;
  }
}

export function FacebookChat() {
  const [open, setOpen] = useState(false);
  const destination = chatDestination();
  if (!destination) return null;

  return <aside className={styles.widget} aria-label="Facebook chat">
    {open && <section id="facebook-chat-panel" className={styles.panel} aria-labelledby="facebook-chat-heading">
      <div className={styles.heading}><MessageCircle size={22} aria-hidden="true" /><strong id="facebook-chat-heading">Let’s talk, little dreamer.</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close Facebook chat"><X size={18} /></button></div>
      <div className={styles.body}><p>Have a question about our products or a custom print in mind? Send WoobleWorks a message on Facebook.</p>
        <a href={destination} target="_blank" rel="noopener noreferrer">Message us on Facebook <ExternalLink size={15} aria-hidden="true" /></a>
        <small>Opens Facebook or Messenger in a new tab.</small>
      </div>
    </section>}
    <button type="button" className={styles.bubble} aria-label={open ? 'Close Facebook chat' : 'Chat with us on Facebook'} aria-expanded={open} aria-controls="facebook-chat-panel" onClick={() => setOpen(value => !value)}>
      {open ? <X size={26} aria-hidden="true" /> : <MessageCircle size={28} aria-hidden="true" />}<span>Let’s chat</span>
    </button>
  </aside>;
}
