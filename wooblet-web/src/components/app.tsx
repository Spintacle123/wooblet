'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, ShieldCheck, SmartphoneNfc, QrCode, Sparkles, MapPin, Check, PawPrint } from 'lucide-react';
import { money, useResourceQuery } from '@/lib/store';
import { Header, Footer, TagArt, ProductCard, Loading, ErrorBox, Empty } from './ui';
import { AuthPage } from './auth';
import { ProductPage, CartPage, CheckoutPage, OrderPage } from './shop';
import { Dashboard } from './dashboard';
import { FinderPage } from './finder';
import { Admin } from './admin';
function BrandRibbon() {
  return <div className="brand-ribbon" aria-hidden="true"><div className="ribbon-back">{Array.from({ length: 8 }, (_, i) => <span key={i}>WOOBLET <b>✦</b> ALWAYS CONNECTED <b>✦</b></span>)}</div><div className="ribbon-front">{Array.from({ length: 8 }, (_, i) => <span key={i}>WOOBLET <b>✦</b> A LITTLE LINK HOME <b>✦</b></span>)}</div></div>;
}
function WoobletCollection() {
  const { data: products, isLoading, error } = useResourceQuery('products');
  return <main className="storefront wooblet-storefront">
    <section className="hero pet-hero" aria-labelledby="hero-heading">
      <div className="container pet-hero-inner">
        <div className="pet-hero-copy"><Image className="wooblet-landing-logo" src="/wooblet-wordmark.webp" alt="Wooblet" width={720} height={216} sizes="240px" />
          <div className="eyebrow"><span /> PERSONALIZED NFC + QR PET TAGS</div>
          <h1 id="hero-heading">Big adventures.<br /><em>Little paws.</em></h1>
          <p className="pet-hero-lead"><strong>A little link home, wherever they roam.</strong></p>
          <p className="pet-hero-description">A tag with their name on it and a profile behind it. Anyone who finds your pet can tap or scan the tag to see their details and reach you.</p>
          <div className="pet-hero-buttons"><Link className="btn" href="#wooblet-products">Find your Wooblet <ArrowRight size={18} /></Link><Link className="btn outline" href="#how-it-works">See how it works <ArrowRight size={18} /></Link></div>
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
      <svg className="wooblet-hero-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30Q180 0 360 30T720 30T1080 30T1440 30V60H0Z" /></svg>
    </section>
    <nav className="container wooblet-page-nav" aria-label="On this Wooblet page"><Link href="#wooblet-products">Find their tag</Link><Link href="#how-it-works">How it works</Link><Link href="#pet-profile">Their pet profile</Link><Link href="#faq">Questions?</Link></nav>
    <div className="benefit-strip"><div className="container"><span><SmartphoneNfc size={20} /> One tap to their profile</span><span><ShieldCheck size={20} /> You control what’s shared</span><span><PawPrint size={20} /> Personalized for your pet</span><span><QrCode size={20} /> QR backup included</span></div></div>
    <section className="section container collection-section" id="wooblet-products">
      <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2><span className="heading-slash" aria-hidden="true" />Meet the Wooblets.</h2><p>Pick their shape, mix their colors, and make it theirs.</p></div><span className="wooblet-collection-note"><SmartphoneNfc size={17} /> NFC + QR in every tag</span></div>
      {isLoading ? <Loading /> : error ? <ErrorBox error={error} /> : products?.length ? <div className="product-grid">{products.filter((p: any) => !p.category || p.category === 'wooblets').map((p: any, i: number) => <ProductCard key={p._id} product={p} index={i} />)}</div> : <Empty title="Our tags are on their way.">Check back soon for our first collection.</Empty>}
      
    </section>

    <section id="how-it-works" className="how-section"><div className="container"><div className="center-heading"><div className="eyebrow">HOW IT WORKS</div><h2><span className="heading-slash" aria-hidden="true" />Three easy steps.</h2><p>No app to install, for you or for whoever finds your pet.</p></div><div className="steps"><article><div className="step-icon"><Sparkles size={30} /><span>01</span></div><h3>Customize their tag.</h3><p>Pick a shape, choose the colors, and add their name. We make the tag and ship it to you.</p></article><article><div className="step-icon"><PawPrint size={30} /><span>02</span></div><h3>Activate their profile.</h3><p>Tap your tag, activate it, and add your pet’s details. Update their information whenever life changes.</p></article><article><div className="step-icon"><SmartphoneNfc size={30} /><span>03</span></div><h3>Anyone can tap or scan.</h3><p>A tap or scan gives a finder a way to reach your family. No app download. No account required.</p></article></div></div></section>
    <section className="section container feature-section" id="pet-profile"><div className="profile-illustration"><div className="profile-grid" aria-hidden="true" /><span className="profile-overline">WHAT A FINDER SEES</span><div className="demo-profile"><div className="demo-profile-top"><span>LIVE PET PROFILE</span><QrCode size={15} /></div><div className="demo-photo"><PawPrint size={48} /></div><span className="demo-lost"><span /> I’m lost — help me get home</span><h3>Hi, I’m Cooper.</h3><p>Golden Retriever · Always up for an adventure</p><div className="demo-button"><Heart size={17} /> Contact my family</div><div className="demo-outline"><MapPin size={17} /> Share where you found me</div><small>WOOBLET PET PROFILE</small></div><span className="illustration-note"><ShieldCheck size={18} /> YOU CONTROL WHAT’S SHARED.</span></div><div className="feature-copy"><div className="eyebrow">THE PET PROFILE</div><h2>Update their profile.<br /><em>Keep the same tag.</em></h2><p>Change your phone number, add an allergy, or turn on Lost Mode from your account. Every tap or scan shows the latest details.</p><ul className="feature-list"><li><ShieldCheck /><div><strong>Privacy on your terms</strong><p>Choose exactly which details a finder can see.</p></div></li><li><Heart /><div><strong>Care that goes with them</strong><p>Share allergies, medications, and care instructions.</p></div></li><li><MapPin /><div><strong>A way back home</strong><p>A finder can choose to share where they found your pet.</p></div></li></ul><Link href="#wooblet-products" className="btn">Shop tags <ArrowRight size={17} /></Link></div></section>
    <section className="faq-section section container" id="faq"><div><div className="eyebrow">FAQ</div><h2>Common questions</h2><p>How Wooblet works, what finders see, and how to pay.</p></div><div className="faq-list">{[
      ['Does my pet need an app?', 'No. A compatible phone can tap the NFC tag or scan its QR code to open a web page. Finders don’t need an app or a Wooblet account.'],
      ['Is Wooblet a GPS tracker?', 'Wooblet is a smart identification tag. It does not continuously track your pet. Someone who finds them can voluntarily share their current location with you.'],
      ['Can I change my phone number later?', 'Yes. Edit your pet’s online profile anytime. The same physical NFC tag and QR code will open the updated information.'],
      ['How do I pay for my Wooblet?', 'Place your order, pay the exact total using our official QR Ph code, then send your Wooblet order number and payment screenshot to our official Facebook page. We verify payment before production.'],
      ['Can my pet have more than one Wooblet?', 'Absolutely. Link several tags to the same pet profile for different collars or a harness. Replacement tags can use the same profile too.'],
    ].map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="cta-section"><div className="container cta-inner"><div className="cta-art" aria-hidden="true"><div className="cta-tag-one"><TagArt design="bone" color="Cream" secondary="Charcoal" name="BUDDY" /></div><div className="cta-tag-two"><TagArt design="cat" color="Terracotta" secondary="Charcoal" name="MOCHI" /></div><span className="hero-star">✦</span></div><div className="cta-copy"><div className="eyebrow">READY TO ORDER?</div><h2>Design a tag<br /><em>with their name.</em></h2><Link className="btn" href="#wooblet-products">Shop tags <ArrowRight size={18} /></Link></div></div></section>
  </main>;
}
function ArrowUp() { return <ArrowRight size={17} style={{ transform: 'rotate(-35deg)' }} />; }
const COLLECTIONS = [
  { slug: 'wooblets', image: '/collections/wooblets-sample.webp', imageAlt: 'Sample yellow bone, cream paw, and pink heart pet tags with raised names', name: 'Wooblet pet tags', symbol: '♡', description: 'Personalized NFC + QR tags with an editable pet profile.', color: '#f8dfac' },
  { slug: 'clickers', image: '/collections/clickers-sample.webp', imageAlt: 'Sample lavender flower, blush keycap, and sage paw 3D printed clickers', name: 'Clickers', symbol: '✳', description: 'A little click, a little joy. Explore playful printed clickers.', color: '#e2d9f3' },
  { slug: 'letters', image: '/collections/letters-sample.webp', imageAlt: 'Sample freestanding peach A, lavender B, and yellow C printed letters', name: 'Letters', symbol: 'Aa', description: 'Make it personal with 3D printed letters and lettering.', color: '#f5d1c9' },
  { slug: 'characters', image: '/collections/characters-sample.webp', imageAlt: 'Sample lavender monster, peach star, and cream robot printed characters', name: 'Characters', symbol: '★', description: 'Small characters with big personality for your shelf or desk.', color: '#d5e4f3' },
  { slug: 'cute-animals', image: '/collections/cute-animals-sample.webp', imageAlt: 'Sample peach cat, sage frog, and yellow bear printed animal figurines', name: 'Cute animals', symbol: 'ʕ•ᴥ•ʔ', description: 'Meet a collection of cute 3D printed animal companions.', color: '#dde8d0' },
  { slug: 'lamps', image: '/collections/lamps-sample.webp', imageAlt: 'Sample cream mushroom lamp and peach ribbed lamp with a warm glow', name: 'Lamps', symbol: '☼', description: 'Explore sculptural lamps and playful lighting for your space.', color: '#f4e4bd' },
];
function CollectionNavigation({ selected }: { selected?: string }) {
  return <nav className="collection-navigation" aria-label="Product collections"><Link href="/shop" aria-current={!selected ? 'page' : undefined}>All collections</Link>{COLLECTIONS.map(c => <Link key={c.slug} href={`/shop/${c.slug}`} aria-current={selected === c.slug ? 'page' : undefined}>{c.name}</Link>)}</nav>;
}
function CollectionCards() {
  return <div className="collection-grid">{COLLECTIONS.map(c => {
    const comingSoon = c.slug !== 'wooblets';
    const content = <><div className="collection-art" style={{ background: c.color }}><Image src={c.image} alt={c.imageAlt} width={1536} height={1024} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span className="collection-image-label">Sample concept</span></div><div className="collection-card-copy"><small>{comingSoon ? 'COMING SOON' : 'SHOP THE COLLECTION'}</small><h3>{c.name}{!comingSoon && <ArrowRight size={20} />}</h3><p>{c.description}</p></div></>;
    return comingSoon ? <div className="collection-card coming-soon-card" aria-disabled="true" key={c.slug}>{content}</div> : <Link className="collection-card" href={c.slug === 'wooblets' ? '/wooblet' : `/shop/${c.slug}`} key={c.slug}>{content}</Link>;
  })}</div>;
}
const CATEGORY_DETAILS: Record<string, { headline: string; tagline: string; samples: string[] }> = {
  wooblets: { headline: 'Small tags. Big adventures.', tagline: 'Their name, their personality, their little link home.', samples: ['Bone pet tag', 'Paw pet tag', 'Heart pet tag'] },
  clickers: { headline: 'A little click. A little happy.', tagline: 'Playful shapes for your everyday desk break.', samples: ['Flower clicker', 'Keycap clicker', 'Paw clicker'] },
  letters: { headline: 'Make your space say you.', tagline: 'Big personality, one little letter at a time.', samples: ['Peach letter A', 'Lavender letter B', 'Sunshine letter C'] },
  characters: { headline: 'Meet your new desk buddies.', tagline: 'Tiny characters. A whole lot of personality.', samples: ['Little monster', 'Happy star', 'Pocket robot'] },
  'cute-animals': { headline: 'Small friends. Big smiles.', tagline: 'Cute companions for shelves, desks, and little corners.', samples: ['Chubby cat', 'Little frog', 'Sitting bear'] },
  lamps: { headline: 'A little glow for your world.', tagline: 'Sculptural shapes that bring personality to your space.', samples: ['Mushroom lamp', 'Ribbed dome lamp'] },
};
function CollectionHero({ collection }: { collection: typeof COLLECTIONS[number] }) {
  const details = CATEGORY_DETAILS[collection.slug];
  const index = COLLECTIONS.findIndex(c => c.slug === collection.slug);
  return <section className="category-banner" style={{ background: collection.color }} aria-labelledby="collection-title"><div className="container category-banner-inner"><div className="category-banner-copy">{collection.slug === 'wooblets' && <Image className="category-wooblet-logo" src="/wooblet-wordmark.webp" alt="Wooblet" width={720} height={216} sizes="(max-width: 760px) 180px, 240px" />}<div className="eyebrow">THE {collection.name.toUpperCase()} COLLECTION</div><h1 id="collection-title">{details.headline}</h1><p>{details.tagline}</p><Link href="#category-products" className="btn">{collection.slug === 'wooblets' ? 'Shop pet tags' : 'Explore the preview'} <ArrowRight size={17} /></Link></div><figure className="category-banner-photo"><Image src={collection.image} alt={collection.imageAlt} width={1536} height={1024} sizes="(max-width: 760px) 100vw, 65vw" preload /><figcaption>Sample concept · Final products may differ</figcaption></figure><span className="category-banner-stamp"><Sparkles size={22} />3D printed<br />personality</span></div><Link href={`/shop/${COLLECTIONS[(index + COLLECTIONS.length - 1) % COLLECTIONS.length].slug}`} className="category-slide previous" aria-label="Previous collection">‹</Link><Link href={`/shop/${COLLECTIONS[(index + 1) % COLLECTIONS.length].slug}`} className="category-slide next" aria-label="Next collection">›</Link><svg className="category-banner-wave" viewBox="0 0 1440 45" preserveAspectRatio="none" aria-hidden="true"><path d="M0 25Q120 5 240 25T480 25T720 25T960 25T1200 25T1440 25V45H0Z" /></svg></section>;
}
function SampleProducts({ collection, compact = false }: { collection: typeof COLLECTIONS[number]; compact?: boolean }) {
  const samples = CATEGORY_DETAILS[collection.slug].samples;
  return <div className={compact ? 'category-featured-row' : 'category-sample-grid'}>{samples.map((name, i) => <article key={name} className={compact ? 'category-mini-product' : 'category-sample-card'}><div className="category-sample-image"><Image src={collection.image} alt={`${name} sample concept in the ${collection.name.toLowerCase()} collection`} width={1536} height={1024} sizes={compact ? '120px' : '(max-width: 600px) 90vw, 33vw'} style={{ objectPosition: `${samples.length === 2 ? i * 100 : i * 50}% center` }} /></div><div><span className="category-preview-label">CONCEPT PREVIEW</span><h3>{name}</h3><p>Coming soon</p></div></article>)}</div>;
}
function CategoryPromos({ collection }: { collection: typeof COLLECTIONS[number] }) {
  const others = COLLECTIONS.filter(c => c.slug !== collection.slug);
  return <div className="category-promo-grid">{others.map((c, i) => {
    const comingSoon = c.slug !== 'wooblets';
    const className = `category-promo category-promo-${i}${comingSoon ? ' coming-soon-card' : ''}`;
    const content = <><div><span className="eyebrow">{comingSoon ? 'COMING SOON' : 'MAKE IT PERSONAL'}</span><h3>{c.name}</h3><p>{CATEGORY_DETAILS[c.slug].tagline}</p><span className="category-promo-link">{comingSoon ? 'Coming soon' : <>Explore collection <ArrowRight size={15} /></>}</span></div><Image src={c.image} alt={c.imageAlt} width={1536} height={1024} sizes="(max-width: 760px) 50vw, 25vw" /></>;
    return comingSoon ? <div className={className} style={{ background: c.color }} aria-disabled="true" key={c.slug}>{content}</div> : <Link href={c.slug === 'wooblets' ? '/wooblet' : `/shop/${c.slug}`} className={className} style={{ background: c.color }} key={c.slug}>{content}</Link>;
  })}</div>;
}
function Home() {
  return <main className="storefront playful-storefront">
    <section className="wonder-hero" aria-labelledby="wonder-title"><div className="container wonder-hero-inner"><div className="wonder-copy"><div className="eyebrow">SMALL PRINTS. BIG PERSONALITY.</div><h1 id="wonder-title">A little<br /><em>wooble.</em><br />A lot of joy.</h1><h2>Playful things for<br />your everyday world.</h2><p>From cute desk companions to your pet’s little link home. Explore a whole world of 3D printed possibilities.</p><Link href="#collections" className="btn wonder-button">Find your favorite <span><ArrowRight size={17} /></span></Link><div className="wonder-mini-note"><Sparkles size={19} /><span>Six collections.<br /><strong>So many little possibilities.</strong></span></div></div><div className="wonder-visual"><span className="wonder-orbit" aria-hidden="true" /><span className="wonder-spark wonder-spark-one" aria-hidden="true">✦</span><span className="wonder-spark wonder-spark-two" aria-hidden="true">✳</span><figure><Image src="/collections/woobleworks-hero-child.webp" alt="Smiling child holding a pink printed cat with sample WoobleWorks pet tag, clicker, letter, animal figures, and lamp displayed on a table" width={1536} height={1024} sizes="(max-width: 760px) 100vw, 60vw" preload /><figcaption>Sample concepts. A little inspiration for what’s next.</figcaption></figure><div className="wonder-badge"><Sparkles size={22} /><span>Big on<br /><strong>personality</strong></span></div><div className="wonder-badge wonder-badge-second"><Heart size={22} /><span>Made for<br /><strong>your world</strong></span></div></div></div><svg className="wonder-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 45C140 0 220 90 380 50S610 0 770 40S990 90 1150 45S1340 0 1440 35V80H0Z" /></svg></section>
    <section className="section container" id="collections"><div className="section-heading"><div><div className="eyebrow">PICK YOUR KIND OF HAPPY</div><h2>Our little<br /><em>collections.</em></h2><p>For your pets, your desk, your space, and your playful side.</p></div><Link href="/shop" className="text-link">Explore all <ArrowRight size={18} /></Link></div><CollectionCards /></section>
    <section className="wonder-promo container"><div><div className="eyebrow">SAY HELLO TO WOOBLET</div><h2>A little tag.<br />A little link home.</h2><p>Give their adventures a personal touch. Custom pet tags with NFC, QR, and a profile that grows with them.</p><Link href="/shop/wooblets" className="btn">Make it theirs <ArrowRight size={18} /></Link></div><figure><Image src="/collections/wooblets-sample.webp" alt="Sample personalized bone, paw, and heart pet tags" width={1536} height={1024} sizes="(max-width: 760px) 100vw, 50vw" /><figcaption>Sample concept · Explore the collection to customize.</figcaption></figure><span className="promo-spark" aria-hidden="true">✦</span></section>
    <section className="wonder-values"><div className="container"><div className="center-heading"><div className="eyebrow">A WORLD OF LITTLE DETAILS</div><h2>Find your kind of joy.</h2></div><div className="wonder-value-grid"><article><PawPrint /><h3>For your pets</h3><p>A personal touch with a little link home.</p></article><article><Sparkles /><h3>For your playful side</h3><p>Clickers, characters, and cute companions.</p></article><article><Heart /><h3>For your space</h3><p>Letters and lamps with personality.</p></article><article><Check /><h3>One place to explore</h3><p>Six collections, each with its own little world.</p></article></div></div></section>
    <section className="wonder-last container"><div className="eyebrow">WHAT WILL YOU PICK?</div><h2>Your next favorite<br /><em>little thing.</em></h2><Link href="/shop" className="btn">Explore WoobleWorks <ArrowRight size={18} /></Link></section>
  </main>;
}
function Shop({ category }: { category?: string }) {
  const { data, isLoading, error } = useResourceQuery('products');
  const collection = COLLECTIONS.find(c => c.slug === category);
  if (!collection) return <main className="container section catalog-page"><div className="center-heading"><div className="eyebrow">THE 3D PRINT SHOP</div><h1>Find your<br /><em>favorite thing.</em></h1><p>Browse pet tags, clickers, letters, characters, cute animals, and lamps.</p></div><CollectionNavigation /><CollectionCards /></main>;
  const products = category === 'wooblets' ? data?.filter((p: any) => !p.category || p.category === 'wooblets') : [];
  return <main className="category-store"><div className="container category-store-top"><div className="category-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{collection.name}</span></div><CollectionNavigation selected={category} /></div><CollectionHero collection={collection} /><div className="container"><section className="category-featured"><h2 className="category-ribbon">{products?.length ? 'Featured products' : 'Collection preview'} <Sparkles size={18} /></h2>{category === 'wooblets' && isLoading ? <Loading /> : category === 'wooblets' && error ? <ErrorBox error={error} /> : products?.length ? <div className="category-featured-row">{products.slice(0, 4).map((p: any) => <Link className="category-mini-product" href={`/shop/${p.slug}`} key={p._id}><div className="category-mini-art"><TagArt design={p.design} /></div><div><h3>{p.name}</h3><strong>{money(p.basePrice)}</strong><p>Personalized pet tag</p></div></Link>)}</div> : <SampleProducts collection={collection} compact />}</section><section id="category-products" className="category-products"><div className="section-heading"><div><div className="eyebrow">YOUR NEXT LITTLE FAVORITE</div><h2>{collection.name} collection</h2><p>{collection.description}</p></div><Link href="/shop" className="text-link">All collections <ArrowRight size={17} /></Link></div>{category === 'wooblets' ? isLoading ? <Loading /> : error ? <ErrorBox error={error} /> : products?.length ? <div className="product-grid shop-grid">{products.map((p: any, i: number) => <ProductCard key={p._id} product={p} index={i} />)}</div> : <Empty title="The collection is coming soon.">Check back soon for our first tags.</Empty> : <><p className="category-preview-note">A preview of what’s taking shape. These sample concepts aren’t available to order yet.</p><SampleProducts collection={collection} /></>}</section><section aria-label="Explore more collections"><CategoryPromos collection={collection} /></section>{category === 'wooblets' && <div className="category-profile-link"><SmartphoneNfc size={26} /><div><h3>A little link home, with every tag.</h3><p>Learn about NFC, QR, and your pet’s editable profile.</p></div><Link href="/wooblet#how-it-works" className="btn outline">How it works <ArrowRight size={17} /></Link></div>}</div></main>;
}
function CommunityFeedback() {
  return <main className="container section community-feedback-page"><div className="center-heading"><div className="eyebrow">THE WOOBLEWORKS COMMUNITY</div><h1>Community Feedback</h1><p>A place for your experiences, ideas, and little things you’d love to see next.</p></div><div className="narrow"><Empty title="Our community space is coming soon." href="/shop" action="Explore the collections">Customer stories and product feedback will appear here when this space opens.</Empty></div></main>;
}
function Policy({ type }: { type: string }) { return <main className="narrow section prose"><div className="eyebrow">WOOBLET BY WOOBLEWORKS</div><h1>{type === 'privacy' ? 'Your privacy matters.' : 'A few shared expectations.'}</h1><div className="notice">These draft policies need business review before the store opens to customers.</div>{type === 'privacy' ? <><h2>Information we collect</h2><p>Wooblet stores account details, pet profiles, orders, and shipping information to provide pet identification and fulfill purchases. Public profile views are counted without recording a precise location.</p><h2>What a finder can see</h2><p>You choose which contact and care details appear on your pet’s public profile. Your order’s shipping address is never part of that public profile.</p><h2>Voluntary location sharing</h2><p>A finder’s precise location is collected only after they choose to share it and allow browser location access. It is available to the pet’s owner and authorized administrators.</p><h2>Your choices</h2><p>You can edit profiles, change privacy settings, or remove an unlinked pet from your account. Contact WoobleWorks through its official page for account deletion or other data requests.</p></> : <><h2>What Wooblet provides</h2><p>Wooblet is a customizable identification tag connected to an online pet profile. NFC and QR access require a compatible device and internet connection. It does not guarantee recovery or provide continuous tracking.</p><h2>Orders and payment</h2><p>Prices are shown in Philippine pesos. Production begins after payment is manually verified. Confirm customization and delivery details before submitting an order.</p><h2>Responsible use</h2><p>Keep your activation code private, provide accurate information, and only share information you are authorized to publish. Do not submit abusive or misleading finder reports.</p><h2>Business policies</h2><p>Delivery estimates, returns, cancellations, and support details must be finalized by WoobleWorks before accepting live orders.</p></>}</main>; }
export function WoobletApp({ path }: { path: string[] }) {
  const [first, second, third] = path;
  if (first === 't' && second && path.length === 2) return <FinderPage token={second} />;
  let content: React.ReactNode;
  if (!first) content = <Home />;
  else if (first === 'wooblet' && path.length === 1) content = <WoobletCollection />;
  else if (first === 'shop' && path.length <= 2) content = second ? COLLECTIONS.some(c => c.slug === second) ? <Shop category={second} /> : <ProductPage slug={second} /> : <Shop />;
  else if (first === 'cart') content = <CartPage />;
  else if (first === 'checkout') content = <CheckoutPage />;
  else if (first === 'order' && second) content = <OrderPage number={second} />;
  else if (['login', 'register', 'forgot-password', 'reset-password', 'verify-email'].includes(first)) content = <AuthPage mode={first} />;
  else if (first === 'dashboard') content = <Dashboard section={second} id={third} />;
  else if (first === 'admin') content = <Admin section={second} id={third} />;
  else if (first === 'community-feedback' && path.length === 1) content = <CommunityFeedback />;
  else if (first === 'privacy' || first === 'terms') content = <Policy type={first} />;
  else content = <main className="container section"><Empty title="Page not found." href="/" action="Back to home">We couldn’t find that page.</Empty></main>;
  if (first === 'admin') return <><Header admin />{content}</>;
  return <><Header />{content}<Footer /></>;
}
