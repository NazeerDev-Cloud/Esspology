import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSeo, useSite, useTone } from '../lib/site.jsx';
import { FadeUp, Split, Magnetic, EASE } from '../components/Motion.jsx';
import Img from '../components/Img.jsx';
import { openStatus } from '../lib/utils.js';

/**
 * Hero for every inner page. Wine background with a glow and dot grid, a breadcrumb pill, a giant title
 * with an outlined echo behind it, optional lead + children (chips/actions), and a layered photo collage
 * (arch with offset frame, circle on a dashed orbit, floating rating card). Info strip along the bottom.
 */
export function PageHero({ eyebrow, title, lead, image, image2, crumbs = [], children, kicker }) {
  const { s, site } = useSite();
  const { setTone } = useTone();
  const status = openStatus(s.hours);
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((s.address || '') + ' ' + (s.city || ''));
  const photo = image || site.gallery[0]?.path;
  const photo2 = image2 || site.gallery.find((g) => g.path !== photo)?.path;
  useEffect(() => { setTone('dark'); return () => setTone('light'); }, [setTone]);
  const trail = crumbs.length ? crumbs : [[eyebrow]];

  return (
    <header className="on-dark relative overflow-hidden bg-wine text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(120,190,178,0.28),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(0,0,0,0.45),transparent_60%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(251,248,239,0.16)_1.2px,transparent_1.2px)] [background-size:28px_28px] [mask-image:linear-gradient(110deg,transparent_30%,black_100%)]" />
      <span aria-hidden="true" className="ghost-text absolute -bottom-[3vw] left-[-1vw] text-[22vw] text-cream/[0.07]">{title}</span>

      <div className="relative mx-auto grid max-w-[1500px] items-center gap-10 px-5 pb-24 pt-36 md:grid-cols-[1.25fr_1fr] md:px-10 md:pb-32 md:pt-44">
        <div>
          <FadeUp gate>
            <nav aria-label="Breadcrumb" className="inline-flex flex-wrap items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-2 text-xs backdrop-blur">
              <Link to="/" className="link-u">Home</Link>
              {trail.map(([label, to], i) => (
                <span key={label} className="flex items-center gap-2"><span aria-hidden="true" className="opacity-50">/</span>
                  {to ? <Link to={to} className="link-u">{label}</Link> : <span aria-current={i === trail.length - 1 ? 'page' : undefined} className="font-semibold">{label}</span>}</span>
              ))}
            </nav>
          </FadeUp>
          {kicker && <FadeUp gate delay={0.1}><p className="eyebrow mt-8 flex items-center gap-3 text-cream/70">{kicker}</p></FadeUp>}
          <Split as="h1" gate text={title} className="font-display mt-6 text-[clamp(3.6rem,10.5vw,10.5rem)] leading-[0.92]" />
          {lead && <FadeUp gate delay={0.4}><p className="mt-8 max-w-[48ch] text-lg text-cream/80 md:text-xl">{lead}</p></FadeUp>}
          {children && <FadeUp gate delay={0.55} className="mt-8">{children}</FadeUp>}
        </div>

        <div className="relative mx-auto hidden aspect-[5/6] w-full max-w-[470px] md:block md:justify-self-end">
          <div aria-hidden="true" className="absolute right-[8%] top-[4%] h-[84%] w-[68%] translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-[2rem] border-2 border-cream/60" />
          <motion.div initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(-90px -90px -90px -90px)' }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            className="absolute right-[8%] top-[4%] h-[84%] w-[68%] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-black/20 shadow-2xl">
            <Img path={photo} alt="" eager w={760} h={950} sizes="30vw" className="h-full w-full object-cover" />
          </motion.div>
          {photo2 && (
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.9 }}
              className="absolute bottom-[4%] left-0 aspect-square w-[34%] overflow-hidden rounded-full border-[6px] border-wine shadow-2xl">
              <Img path={photo2} alt="" w={360} h={360} sizes="15vw" className="h-full w-full object-cover" />
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
            className="absolute right-0 top-[58%] rounded-2xl border border-cream/25 bg-wine/70 px-4 py-3 text-sm shadow-2xl backdrop-blur-xl">
            <span className="tracking-widest">★★★★★</span><span className="mt-0.5 block text-cream/80">Loved by locals</span>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-cream/15 bg-black/20 backdrop-blur">
        <div className="mx-auto grid max-w-[1500px] gap-px px-5 md:grid-cols-3 md:px-10">
          <p className="flex items-center gap-3 py-4 text-sm"><span className={'pulse-dot ' + (status.open ? 'text-[#5be08a]' : 'text-cream/50')} />{status.text}</p>
          <a href={maps} target="_blank" rel="noopener" className="link-u py-4 text-sm md:justify-self-center">{s.address}{s.city ? ', ' + s.city : ''} ↗</a>
          {phone && <a href={'tel:' + phone} className="link-u py-4 text-sm md:justify-self-end">{s.phone}</a>}
        </div>
      </div>
    </header>
  );
}

/** Tells the header to switch to light text when a page starts with a dark hero section. */
export function useFirstTone(page) {
  const { setTone } = useTone();
  const first = page?.sections?.[0];
  const dark = first && ['wine', 'black'].includes(first.bg) && first.type === 'hero';
  useEffect(() => { if (!page) return undefined; setTone(dark ? 'dark' : 'light'); return () => setTone('light'); }, [page, dark, setTone]);
}

export function NotFound() {
  useSeo({ title: 'Page not found' });
  return (
    <section className="grid min-h-[100svh] place-items-center bg-cream px-5 text-center">
      <div>
        <p className="font-display text-[clamp(6.66rem,23.3vw,19.97rem)] font-light italic leading-[0.8] text-wine">404</p>
        <FadeUp gate><h1 className="font-display mt-6 text-4xl md:text-6xl">This page went cold.</h1></FadeUp>
        <FadeUp gate delay={0.15}><p className="mx-auto mt-4 max-w-[40ch] opacity-70">We could not find what you were looking for. Let us pour you something else.</p></FadeUp>
        <FadeUp gate delay={0.3} className="mt-8 flex justify-center gap-3"><Magnetic><Link to="/" className="btn btn-primary">Back home</Link></Magnetic><Link to="/menu" className="btn btn-outline">See the menu</Link></FadeUp>
      </div>
    </section>
  );
}
