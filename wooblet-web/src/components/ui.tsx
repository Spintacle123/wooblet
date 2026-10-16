'use client';
import Link from 'next/link';
import { PawPrint, ArrowUpRight, ShoppingBag, Menu, X, LoaderCircle, AlertCircle, CheckCircle2, SmartphoneNfc, QrCode } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector, money, errorMessage, useResourceQuery } from '@/lib/store';
export const COLORS: Record<string, string> = {
  // Signature colors sampled from the product artwork.
  Sunshine: '#ffb62b', Royal: '#1f62dd', 'Deep Blue': '#1546ad', Vanilla: '#fbe3a6', Cocoa: '#6a3417', Bubblegum: '#f9748f', Rose: '#e14f70', White: '#fffdf8',
  Sage: '#89a78f', Cream: '#e9dcca', Terracotta: '#ce806b', Lilac: '#b3a1ce', Ocean: '#81a9bd', Charcoal: '#464d48',
};
/** Tag lettering fonts; the same files are extruded by the 3D preview (public/fonts/tag). */
export const FONT_FAMILIES: Record<string, string> = { Rounded: "'Wooblet Rounded', Arial, sans-serif", Classic: "'Wooblet Classic', Georgia, serif", Playful: "'Wooblet Playful', 'Trebuchet MS', sans-serif" };
/** Each design's look from its product artwork: default colors and sample name. */
export const DESIGN_STYLES: Record<string, { tag: string; rim: string; lettering: string; sample: string }> = {
  bone: { tag: 'Sunshine', rim: 'Royal', lettering: 'White', sample: 'Max' },
  paw: { tag: 'Vanilla', rim: 'Cocoa', lettering: 'Cocoa', sample: 'Pudding' },
  round: { tag: 'Royal', rim: 'Deep Blue', lettering: 'White', sample: 'Charlie' },
  heart: { tag: 'Bubblegum', rim: 'Rose', lettering: 'White', sample: 'Lily' },
  cat: { tag: 'Sunshine', rim: 'Cocoa', lettering: 'White', sample: 'Mochi' },
};
export const designStyle = (design: string) => DESIGN_STYLES[design] ?? DESIGN_STYLES.round;
/** "Sunshine tag · Royal rim · White lettering"; orders from before the rim picker have no rim. */
export function describeColors(c: { primaryColor: string; secondaryColor: string; rimColor?: string }) { return [`${c.primaryColor} tag`, c.rimColor && `${c.rimColor} rim`, `${c.secondaryColor} lettering`].filter(Boolean).join(' · '); }
function luminance(hex: string) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0); }
/** WCAG contrast ratio between two named tag colors. */
export function contrast(a: string, b: string) { const [hi, lo] = [luminance(COLORS[a] ?? a), luminance(COLORS[b] ?? b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); }
/** Engraved lettering below this ratio blends into the tag (e.g. Sage on Ocean). */
export const MIN_LETTERING_CONTRAST = 1.5;
export function Brand({ small = false, wooblet = false }: { small?: boolean; wooblet?: boolean }) { if (wooblet) return <Link href="/shop/wooblets" aria-label="Wooblet home" className="brand wooblet-page-brand"><img src="/wooblet-wordmark.webp" alt="Wooblet" width={720} height={216} /></Link>; return <Link href="/" aria-label="WoobleWorks home" className={`brand maker-brand artwork-brand ${small ? 'small' : ''}`}><img src="/woobleworks-logo.png" alt="WoobleWorks" width={1445} height={1089} /></Link>; }
export function Header({ admin = false, wooblet = false }: { admin?: boolean; wooblet?: boolean }) {
  const items = useAppSelector(s => s.cart.items); const [open, setOpen] = useState(false); const { data: user } = useResourceQuery('auth/me');
  if (admin) return <header className="site-header admin-header"><div className="container header-inner"><Brand small /><span className="admin-header-label">Admin studio</span><div className="header-actions"><Link className="account-link" href="/">View store</Link><Link className="account-link" href="/dashboard">My account</Link></div></div></header>;
  return <><div className="announcement">3D PRINTED LITTLE THINGS <span>MADE FOR YOUR WORLD</span></div><header className="site-header"><div className="container header-inner"><Brand wooblet={wooblet} /><nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Main navigation"><Link href="/shop" onClick={() => setOpen(false)}>Shop all</Link><Link href="/shop/wooblets" onClick={() => setOpen(false)}>Wooblet tags</Link><Link href="/#collections" onClick={() => setOpen(false)}>Collections</Link><Link href="/wooblet#faq" onClick={() => setOpen(false)}>FAQs</Link><Link href="/community-feedback" onClick={() => setOpen(false)}>Community Feedback</Link></nav><div className="header-actions">{user && <Link className="account-link" href="/dashboard">My account</Link>}<Link href="/cart" className="bag-link" aria-label={`Shopping bag, ${items.reduce((n, i) => n + i.quantity, 0)} items`}><ShoppingBag size={21} />{items.length > 0 && <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>}</Link><button className="icon-btn mobile-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div></header></>;
}
export function Footer() { return <footer className="site-footer"><div className="container footer-top"><div><Brand /><p>3D printed products for your pets,<br />your space, and your everyday.</p><span className="footer-signoff">LITTLE THINGS. LOTS OF PERSONALITY.</span></div><div><strong>Explore WoobleWorks</strong><Link href="/community-feedback">Community Feedback</Link><Link href="/shop">All collections</Link><Link href="/shop/wooblets">Wooblet pet tags</Link><Link href="/shop/clickers">Clickers</Link><Link href="/shop/letters">Letters</Link><Link href="/shop/characters">Characters</Link><Link href="/shop/cute-animals">Cute animals</Link><Link href="/shop/lamps">Lamps</Link><Link href="/wooblet#how-it-works">How it works</Link><Link href="/wooblet#faq">Frequently asked questions</Link></div><div><strong>Your world</strong><Link href="/dashboard">My account</Link><Link href="/dashboard/wooblets">My Wooblets</Link><Link href="/dashboard/orders">My orders</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} WoobleWorks. Designed in the Philippines.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>; }
/** Tag outlines in the TagArt viewBox (-10 20 290 290); shared by the SVG art and the 3D preview. */
export const TAG_PATHS: Record<string, string> = {
  paw: 'M95 94 C65 87 50 105 55 132 C28 125 12 148 25 174 C3 190 11 218 38 221 C35 251 65 273 91 257 C108 286 142 286 161 262 C187 281 219 264 215 235 C244 235 263 206 245 184 C265 160 247 129 217 134 C222 102 194 84 169 99 C153 75 119 71 95 94Z',
  bone: 'M61 98 C21 61 0 105 23 133 C-3 164 23 195 58 173 L193 173 C225 200 253 172 233 142 C259 112 230 78 199 103 Z',
  heart: 'M130 250 C100 223 20 165 22 116 C24 61 95 54 130 96 C164 54 238 61 238 116 C240 165 162 222 130 250Z',
  round: 'M130 72 A94 94 0 1 0 130 260 A94 94 0 1 0 130 72Z',
  cat: 'M51 137 L41 66 L97 99 Q130 84 165 99 L219 66 L211 141 Q235 205 195 236 Q131 275 65 236 Q25 201 51 137Z',
};
/** Ring hole and lettering positions for each design, in the same viewBox units. */
export function tagLayout(design: string) {
  const bone = design === 'bone';
  return { holeY: bone ? 113 : 111, ringY: bone ? 75 : 73, nameY: bone ? 151 : 184, brandY: bone ? null : 211 };
}
export function TagArt({ design = 'paw', color = 'Sage', secondary = 'Cream', rim, name = 'COOPER', font = 'Rounded', className = '' }: { design?: string; color?: string; secondary?: string; rim?: string; name?: string; font?: string; className?: string }) {
  const fill = COLORS[color] ?? color; const text = COLORS[secondary] ?? secondary; const paths = TAG_PATHS; const edge = rim ? COLORS[rim] ?? rim : undefined;
  return <svg className={`tag-art ${className}`} viewBox="-10 20 290 290" role="img" aria-label={`${color} ${design} tag personalized with ${name}`}><defs><filter id={`shadow-${design}-${color}`} x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="13" stdDeviation="8" floodColor="#283f32" floodOpacity=".16" /></filter></defs><path d={paths[design] ?? paths.round} fill={fill} stroke={edge ?? 'rgba(0,0,0,.12)'} strokeWidth={edge ? 14 : 3} strokeLinejoin="round" filter={`url(#shadow-${design}-${color})`} />{!edge && <path d={paths[design] ?? paths.round} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="3" transform="translate(4 7) scale(.97)" />}<circle cx="130" cy={design === 'bone' ? 113 : 111} r="8" fill="#faf7ef" stroke="rgba(0,0,0,.12)" strokeWidth="3" /><ellipse cx="130" cy={design === 'bone' ? 75 : 73} rx="25" ry="40" fill="none" stroke="#b8bcb8" strokeWidth="7" /><ellipse cx="130" cy={design === 'bone' ? 75 : 73} rx="25" ry="40" fill="none" stroke="#e0e3dd" strokeWidth="3" /><text x="130" y={design === 'bone' ? 151 : 184} textAnchor="middle" fill={text} fontFamily={FONT_FAMILIES[font] ?? FONT_FAMILIES.Rounded} fontWeight="800" fontSize={name.length > 10 ? 18 : 26} letterSpacing="1">{name}</text>{design !== 'bone' && <text x="130" y="211" textAnchor="middle" fill={text} opacity=".8" fontSize="10" letterSpacing="2">wooblet</text>}</svg>;
}
const DESIGN_IMAGES: Record<string, string> = { paw: '/cloud.png', bone: '/bone.png', heart: '/heart.png', round: '/circle.png' };
export function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const colors = ['Cream', 'Terracotta', 'Sage', 'Ocean', 'Lilac'];
  const color = colors[index % colors.length];
  const image = product.images?.[0] ?? DESIGN_IMAGES[product.design];
  return <Link className="product-card" href={`/shop/${product.slug}`}><div className={`product-image tone-${index % 5}`}><div className="product-topline"><span className="product-label product-tech-icons" role="img" aria-label="NFC and QR enabled" title="NFC + QR"><SmartphoneNfc aria-hidden="true" /><QrCode aria-hidden="true" /></span><span className="product-series">{String(index + 1).padStart(2, '0')} / WOOBLET</span></div>{image ? <img className="product-photo" src={image} alt={product.name} /> : <TagArt design={product.design} color={color} secondary={color === 'Charcoal' ? 'Cream' : 'Charcoal'} name={['COOPER', 'MILO', 'LUNA', 'BUDDY', 'MOCHI'][index % 5]} />}<div className="product-bottomline"><span className="product-open"><ArrowUpRight size={19} /></span></div></div><div className="product-info"><div><h3>{product.name}</h3><span>Personalized smart pet tag</span></div><strong>{money(product.basePrice)}</strong></div><div className="product-card-bottom"><div className="mini-swatches">{(product.availableColors ?? []).slice(0, 6).map((c: string) => <span key={c} style={{ background: COLORS[c] }} />)}<small>{product.availableColors?.length} colors</small></div><span className="product-card-cta">Customize <ArrowUpRight size={13} /></span></div></Link>;
}
export function Loading() { return <div className="loading" role="status"><LoaderCircle className="spin" size={24} /> Loading…</div>; }
export function ErrorBox({ error }: { error: any }) { return <div className="notice error" role="alert"><AlertCircle size={19} />{errorMessage(error)}</div>; }
export function Notice({ children }: { children: React.ReactNode }) { return <div className="notice success" role="status"><CheckCircle2 size={19} />{children}</div>; }
export function Empty({ title, children, href, action }: { title: string; children: React.ReactNode; href?: string; action?: string }) { return <div className="empty"><span className="empty-icon"><PawPrint size={30} /></span><h2>{title}</h2><p>{children}</p>{href && <Link className="btn" href={href}>{action}</Link>}</div>; }
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>; }
export function Badge({ status }: { status: string }) { return <span className={`badge ${['ACTIVE', 'PAID', 'COMPLETED'].includes(status) ? 'green' : ['DISABLED', 'PAYMENT_ISSUE', 'CANCELLED', 'REPLACED'].includes(status) ? 'red' : ''}`}>{status?.replaceAll('_', ' ').toLowerCase()}</span>; }
