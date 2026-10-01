'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, ShieldCheck, SmartphoneNfc, QrCode, Sparkles, MapPin, Check, PawPrint } from 'lucide-react';
import { useResourceQuery } from '@/lib/store';
import { Header, Footer, TagArt, ProductCard, Loading, ErrorBox, Empty } from './ui';
import { AuthPage } from './auth';
import { ProductPage, CartPage, CheckoutPage, OrderPage } from './shop';
import { Dashboard } from './dashboard';
import { FinderPage } from './finder';
import { Admin } from './admin';
function BrandRibbon() {
  return <div className="brand-ribbon" aria-hidden="true"><div className="ribbon-back">{Array.from({ length: 8 }, (_, i) => <span key={i}>WOOBLET <b>✦</b> ALWAYS CONNECTED <b>✦</b></span>)}</div><div className="ribbon-front">{Array.from({ length: 8 }, (_, i) => <span key={i}>WOOBLET <b>✦</b> A LITTLE LINK HOME <b>✦</b></span>)}</div></div>;
}
function Home() {
  const { data: products, isLoading, error } = useResourceQuery('products');
  return <main className="storefront">
    <section className="hero pet-hero" aria-labelledby="hero-heading">
      <div className="container pet-hero-inner">
        <div className="pet-hero-copy">
          <div className="eyebrow"><span /> PERSONALIZED NFC + QR PET TAGS</div>
          <h1 id="hero-heading">Big adventures.<br /><em>Little paws.</em></h1>
          <p className="pet-hero-lead">Their personality.<br /><strong>A little link home.</strong></p>
          <p className="pet-hero-description">A tag with their name on it and a profile behind it. Anyone who finds your pet can tap or scan the tag to see their details and reach you.</p>
          <div className="pet-hero-buttons"><Link className="btn" href="/shop">Find your Wooblet <ArrowRight size={18} /></Link><Link className="btn outline" href="#how-it-works">See how it works <ArrowRight size={18} /></Link></div>
          <div className="pet-hero-trust"><span><Check size={15} /> No app needed</span><span><Check size={15} /> No subscription</span><span><Check size={15} /> Made for your pet</span></div>
        </div>
        <div className="pet-hero-visual">
          <div className="pet-hero-photo">
            <Image src="/wooblet-pets.png" alt="Max the golden retriever and Mochi the cat wearing their colorful personalized pet tags" width={1254} height={1254} sizes="(max-width: 760px) 90vw, (max-width: 1100px) 48vw, 640px" preload />
          </div>
          <div className="pet-hero-note"><Heart size={15} /> PERSONALIZED WITH THEIR NAME</div>
          <span className="pet-hero-sparkle" aria-hidden="true">✦</span>
          <Link className="pet-hero-connect" href="#how-it-works"><span className="pet-hero-connect-icon"><SmartphoneNfc size={25} /></span><span><small>HOW IT WORKS</small><strong>Tap or scan to open their profile</strong></span><ArrowRight size={20} /></Link>
        </div>
      </div>
      
    </section>
    <div className="benefit-strip"><div className="container"><span><SmartphoneNfc size={20} /> One tap to their profile</span><span><ShieldCheck size={20} /> You control what’s shared</span><span><PawPrint size={20} /> Personalized for your pet</span><span><QrCode size={20} /> QR backup included</span></div></div>
    <section className="section container collection-section">
      <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2><span className="heading-slash" aria-hidden="true" />Meet the Wooblets.</h2><p>Five shapes, six colors, and their name on every tag.</p></div><Link href="/shop" className="text-link">Shop all tags <ArrowUp /></Link></div>
      {isLoading ? <Loading /> : error ? <ErrorBox error={error} /> : products?.length ? <div className="product-grid">{products.slice(0, 4).map((p: any, i: number) => <ProductCard key={p._id} product={p} index={i} />)}</div> : <Empty title="Our tags are on their way.">Check back soon for our first collection.</Empty>}
      
    </section>
    <BrandRibbon />
    <section id="how-it-works" className="how-section"><div className="container"><div className="center-heading"><div className="eyebrow">HOW IT WORKS</div><h2><span className="heading-slash" aria-hidden="true" />Three easy steps.</h2><p>No app to install, for you or for whoever finds your pet.</p></div><div className="steps"><article><div className="step-icon"><Sparkles size={30} /><span>01</span></div><h3>Customize their tag.</h3><p>Pick a shape, choose the colors, and add their name. We make the tag and ship it to you.</p></article><article><div className="step-icon"><PawPrint size={30} /><span>02</span></div><h3>Activate their profile.</h3><p>Tap your tag, activate it, and add your pet’s details. Update their information whenever life changes.</p></article><article><div className="step-icon"><SmartphoneNfc size={30} /><span>03</span></div><h3>Anyone can tap or scan.</h3><p>A tap or scan gives a finder a way to reach your family. No app download. No account required.</p></article></div></div></section>
    <section className="section container feature-section"><div className="profile-illustration"><div className="profile-grid" aria-hidden="true" /><span className="profile-overline">WHAT A FINDER SEES</span><div className="demo-profile"><div className="demo-profile-top"><span>LIVE PET PROFILE</span><QrCode size={15} /></div><div className="demo-photo"><PawPrint size={48} /></div><span className="demo-lost"><span /> I’m lost — help me get home</span><h3>Hi, I’m Cooper.</h3><p>Golden Retriever · Always up for an adventure</p><div className="demo-button"><Heart size={17} /> Contact my family</div><div className="demo-outline"><MapPin size={17} /> Share where you found me</div><small>WOOBLET PET PROFILE</small></div><span className="illustration-note"><ShieldCheck size={18} /> YOU CONTROL WHAT’S SHARED.</span></div><div className="feature-copy"><div className="eyebrow">THE PET PROFILE</div><h2>Update their profile.<br /><em>Keep the same tag.</em></h2><p>Change your phone number, add an allergy, or turn on Lost Mode from your account. Every tap or scan shows the latest details.</p><ul className="feature-list"><li><ShieldCheck /><div><strong>Privacy on your terms</strong><p>Choose exactly which details a finder can see.</p></div></li><li><Heart /><div><strong>Care that goes with them</strong><p>Share allergies, medications, and care instructions.</p></div></li><li><MapPin /><div><strong>A way back home</strong><p>A finder can choose to share where they found your pet.</p></div></li></ul><Link href="/shop" className="btn">Shop tags <ArrowRight size={17} /></Link></div></section>
    <section className="faq-section section container" id="faq"><div><div className="eyebrow">FAQ</div><h2>Common questions</h2><p>How Wooblet works, what finders see, and how to pay.</p></div><div className="faq-list">{[
      ['Does my pet need an app?', 'No. A compatible phone can tap the NFC tag or scan its QR code to open a web page. Finders don’t need an app or a Wooblet account.'],
      ['Is Wooblet a GPS tracker?', 'Wooblet is a smart identification tag. It does not continuously track your pet. Someone who finds them can voluntarily share their current location with you.'],
      ['Can I change my phone number later?', 'Yes. Edit your pet’s online profile anytime. The same physical NFC tag and QR code will open the updated information.'],
      ['How do I pay for my Wooblet?', 'Place your order, pay the exact total using our official QR Ph code, then send your Wooblet order number and payment screenshot to our official Facebook page. We verify payment before production.'],
      ['Can my pet have more than one Wooblet?', 'Absolutely. Link several tags to the same pet profile for different collars or a harness. Replacement tags can use the same profile too.'],
    ].map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="cta-section"><div className="container cta-inner"><div className="cta-art" aria-hidden="true"><div className="cta-tag-one"><TagArt design="bone" color="Cream" secondary="Charcoal" name="BUDDY" /></div><div className="cta-tag-two"><TagArt design="cat" color="Terracotta" secondary="Charcoal" name="MOCHI" /></div><span className="hero-star">✦</span></div><div className="cta-copy"><div className="eyebrow">READY TO ORDER?</div><h2>Design a tag<br /><em>with their name.</em></h2><Link className="btn" href="/shop">Shop tags <ArrowRight size={18} /></Link></div></div></section>
  </main>;
}
function ArrowUp() { return <ArrowRight size={17} style={{ transform: 'rotate(-35deg)' }} />; }
function Shop() { const { data, isLoading, error } = useResourceQuery('products'); return <main className="container section catalog-page"><div className="center-heading"><div className="eyebrow">SHOP</div><h1>Choose their<br /><em>shape.</em></h1><p>Every tag includes NFC, a QR code backup, and an editable pet profile.</p></div>{isLoading ? <Loading /> : error ? <ErrorBox error={error} /> : data?.length ? <div className="product-grid shop-grid">{data.map((p: any, i: number) => <ProductCard key={p._id} product={p} index={i} />)}</div> : <Empty title="The collection is coming soon.">Check back soon for our first tags.</Empty>}</main>; }
function Policy({ type }: { type: string }) { return <main className="narrow section prose"><div className="eyebrow">WOOBLET BY WOOBLEWORKS</div><h1>{type === 'privacy' ? 'Your privacy matters.' : 'A few shared expectations.'}</h1><div className="notice">These draft policies need business review before the store opens to customers.</div>{type === 'privacy' ? <><h2>Information we collect</h2><p>Wooblet stores account details, pet profiles, orders, and shipping information to provide pet identification and fulfill purchases. Public profile views are counted without recording a precise location.</p><h2>What a finder can see</h2><p>You choose which contact and care details appear on your pet’s public profile. Your order’s shipping address is never part of that public profile.</p><h2>Voluntary location sharing</h2><p>A finder’s precise location is collected only after they choose to share it and allow browser location access. It is available to the pet’s owner and authorized administrators.</p><h2>Your choices</h2><p>You can edit profiles, change privacy settings, or remove an unlinked pet from your account. Contact WoobleWorks through its official page for account deletion or other data requests.</p></> : <><h2>What Wooblet provides</h2><p>Wooblet is a customizable identification tag connected to an online pet profile. NFC and QR access require a compatible device and internet connection. It does not guarantee recovery or provide continuous tracking.</p><h2>Orders and payment</h2><p>Prices are shown in Philippine pesos. Production begins after payment is manually verified. Confirm customization and delivery details before submitting an order.</p><h2>Responsible use</h2><p>Keep your activation code private, provide accurate information, and only share information you are authorized to publish. Do not submit abusive or misleading finder reports.</p><h2>Business policies</h2><p>Delivery estimates, returns, cancellations, and support details must be finalized by WoobleWorks before accepting live orders.</p></>}</main>; }
export function WoobletApp({ path }: { path: string[] }) {
  const [first, second, third] = path;
  if (first === 't' && second && path.length === 2) return <FinderPage token={second} />;
  let content: React.ReactNode;
  if (!first) content = <Home />;
  else if (first === 'shop' && path.length <= 2) content = second ? <ProductPage slug={second} /> : <Shop />;
  else if (first === 'cart') content = <CartPage />;
  else if (first === 'checkout') content = <CheckoutPage />;
  else if (first === 'order' && second) content = <OrderPage number={second} />;
  else if (['login', 'register', 'forgot-password', 'reset-password', 'verify-email'].includes(first)) content = <AuthPage mode={first} />;
  else if (first === 'dashboard') content = <Dashboard section={second} id={third} />;
  else if (first === 'admin') content = <Admin section={second} id={third} />;
  else if (first === 'privacy' || first === 'terms') content = <Policy type={first} />;
  else content = <main className="container section"><Empty title="Page not found." href="/" action="Back to home">We couldn’t find that page.</Empty></main>;
  if (first === 'admin') return <><Header admin />{content}</>;
  return <><Header />{content}<Footer /></>;
}
