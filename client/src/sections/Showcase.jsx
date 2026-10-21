import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { FadeUp, EASE } from '../components/Motion.jsx';
import { Wrap, Eyebrow, SectionHead, TITLE } from '../components/Layout.jsx';
import { Split } from '../components/Motion.jsx';
import Img from '../components/Img.jsx';
import { useSite } from '../lib/site.jsx';
import { A } from './Hero.jsx';
import { stars } from '../lib/stars.js';

/** Pinned horizontal scroll on desktop (sticky + transform), native swipe row on mobile / reduced motion. */
export function CategoryShowcase({ d }) {
  const { site } = useSite();
  const cats = site.categories;
  const outer = useRef(null), track = useRef(null);
  const [dist, setDist] = useState(0);
  const [pin, setPin] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const numX = useTransform(scrollYProgress, [0, 1], [0, dist * 0.35]);

  useLayoutEffect(() => {
    const measure = () => {
      const desktop = window.matchMedia('(min-width: 768px)').matches && !reduce;
      setPin(desktop);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 80));
    };
    measure(); window.addEventListener('resize', measure);
    const t = setTimeout(measure, 600);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, [cats.length, reduce]);

  const panel = (c, i) => (
    <li key={c.id} className="relative w-[78vw] shrink-0 snap-start md:w-[min(34vw,520px)]" data-cursor="Explore">
      <Link to={`/menu/${c.slug}`} className="group block">
        <span className="font-display absolute -top-10 left-0 text-[8rem] font-light italic leading-none text-cream/25 md:-top-14 md:text-[11rem]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <div className="relative mt-16 aspect-[4/5] overflow-hidden rounded-[2rem] md:mt-20 md:aspect-[6/5]">
          <Img path={c.image} alt={c.name} w={900} h={1125} sizes="(max-width:768px) 80vw, 34vw" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
          <span className="absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-cream text-2xl text-wine transition-transform duration-500 group-hover:-rotate-45">→</span>
        </div>
        <h3 className="font-display mt-5 text-5xl font-light italic md:text-6xl">{c.name}</h3>
        {c.description && <p className="mt-2 max-w-[34ch] text-cream/70">{c.description}</p>}
      </Link>
    </li>
  );

  return (
    <div ref={outer} style={pin ? { height: `calc(100vh + ${dist}px)` } : undefined} className="relative">
      <div className={pin ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden' : 'relative py-24'}>
        <Wrap className="w-full">
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <Split text={d.title} className={TITLE} />
        </Wrap>
        {pin ? (
          <motion.ul ref={track} style={{ x }} className="flex w-max gap-10 px-10 pt-2">{cats.map(panel)}</motion.ul>
        ) : (
          <ul ref={track} className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6">{cats.map(panel)}</ul>
        )}
        {pin && <motion.p style={{ x: numX }} aria-hidden="true" className="font-display outline-text pointer-events-none absolute bottom-4 left-0 select-none whitespace-nowrap text-[14vw] font-semibold italic leading-none opacity-20">Breakfast · Sandwiches · Salads · Coffee</motion.p>}
      </div>
    </div>
  );
}

/** Review deck: the current review sits on top of a fanned stack; arrows, dots, swipe and arrow keys move through them. */
export function Testimonials({ d }) {
  const { site } = useSite();
  const rows = site.testimonials;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = rows.length;
  const go = (k) => setI(((k % n) + n) % n);
  useEffect(() => {
    if (paused || reduce || n < 2) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % n), 7000);
    return () => clearInterval(t);
  }, [paused, reduce, n]);
  if (!n) return null;
  const avg = rows.reduce((a, r) => a + (+r.rating || 0), 0) / n;

  return (
    <div className="relative overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      role="region" aria-roledescription="carousel" aria-label="Testimonials" tabIndex={-1}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}>
      <span aria-hidden="true" className="ghost-text absolute -left-[3vw] -top-[4vw] text-[34vw] text-cream/[0.06]">“</span>
      <Wrap pad className="relative grid items-center gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div>
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <Split text={d.title} className={TITLE} />
          <FadeUp delay={0.1} className="mt-10 flex items-end gap-6">
            <p className="font-display text-[clamp(3.74rem,7.49vw,6.66rem)] font-light italic leading-[0.8]">{avg.toFixed(1)}</p>
            <div className="pb-1">
              <p className="text-xl tracking-[0.25em]" aria-label={`${avg.toFixed(1)} out of 5 stars`}>{stars(Math.round(avg))}</p>
              <p className="mt-1 text-sm opacity-70">from {n} guest {n === 1 ? 'review' : 'reviews'}</p>
            </div>
          </FadeUp>
          {n > 1 && (
            <FadeUp delay={0.2} className="mt-10 flex items-center gap-4">
              <button type="button" onClick={() => go(i - 1)} aria-label="Previous review" className="grid h-14 w-14 place-items-center rounded-full border border-current/40 text-xl transition-colors hover:bg-cream hover:text-wine">←</button>
              <button type="button" onClick={() => go(i + 1)} aria-label="Next review" className="grid h-14 w-14 place-items-center rounded-full bg-cream text-xl text-wine transition-transform hover:scale-105">→</button>
              <span className="font-display ml-2 text-2xl tabular-nums opacity-80">{String(i + 1).padStart(2, '0')} <span className="opacity-40">/ {String(n).padStart(2, '0')}</span></span>
            </FadeUp>
          )}
        </div>

        <div className="relative mx-auto h-[26rem] w-full max-w-[560px] md:h-[28rem]" aria-live="polite">
          {rows.map((t, k) => {
            const pos = (k - i + n) % n;                 // 0 = front
            if (pos > 2) return null;
            return (
              <motion.figure key={t.id} drag={pos === 0 && n > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
                onDragEnd={(_, info) => { if (info.offset.x < -80) go(i + 1); else if (info.offset.x > 80) go(i - 1); }}
                className="absolute inset-0 flex cursor-grab flex-col justify-between rounded-[2rem] bg-cream p-8 text-ink shadow-2xl active:cursor-grabbing md:p-10"
                initial={false} animate={{ y: pos * 22, scale: 1 - pos * 0.06, rotate: pos === 0 ? 0 : pos % 2 ? 3 : -3, opacity: 1 - pos * 0.25, zIndex: 10 - pos }}
                transition={{ duration: 0.7, ease: EASE }} aria-hidden={pos !== 0}>
                <div>
                  <span className="font-display block text-7xl italic leading-[0.6] text-wine" aria-hidden="true">“</span>
                  <blockquote className="font-display mt-4 text-[clamp(1.17rem,2vw,1.66rem)] font-light italic leading-[1.25]">{t.text}</blockquote>
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-ink/10 pt-5">
                  <span className="flex items-center gap-3">
                    <span className="font-display grid h-12 w-12 place-items-center rounded-full bg-wine text-xl italic text-cream" aria-hidden="true">{(t.name || '?')[0]}</span>
                    <span><span className="block font-medium">{t.name}</span><span className="eyebrow text-[0.62rem] opacity-55">Guest</span></span>
                  </span>
                  <span className="text-lg tracking-[0.2em] text-wine" aria-label={`${t.rating} out of 5 stars`}>{stars(t.rating)}</span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </Wrap>
      {n > 1 && (
        <div className="relative pb-10 text-center" role="tablist" aria-label="Choose review">
          <div className="inline-flex gap-3">
            {rows.map((r, k) => <button key={r.id} role="tab" aria-selected={k === i} aria-label={`Review ${k + 1}`} onClick={() => go(k)} className={`h-2.5 rounded-full border border-current transition-all duration-500 ${k === i ? 'w-10 bg-current' : 'w-2.5'}`} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/** Two image rows drifting in opposite directions as you scroll. */
export function GalleryStrip({ d }) {
  const { site } = useSite();
  const rows = site.gallery.slice(0, Math.max(2, +d.limit || 8));
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const xa = useTransform(scrollYProgress, [0, 1], ['4%', reduce ? '4%' : '-18%']);
  const xb = useTransform(scrollYProgress, [0, 1], ['-18%', reduce ? '-18%' : '4%']);
  if (!rows.length) return null;
  const half = Math.ceil(rows.length / 2);
  const tile = (g, k) => (
    <li key={g.id} className={`shrink-0 overflow-hidden rounded-[1.6rem] ${k % 2 ? 'h-[34vw] w-[26vw] md:h-[22vw] md:w-[18vw]' : 'h-[34vw] w-[42vw] md:h-[22vw] md:w-[28vw]'}`} data-cursor="View">
      <Link to="/gallery" aria-label={g.caption || 'Open gallery'}><Img path={g.path} alt={g.alt || g.caption} w={800} h={600} sizes="40vw" className="h-full w-full object-cover transition-transform duration-1000 hover:scale-110" /></Link>
    </li>
  );
  return (
    <div ref={ref} className="overflow-hidden py-24 md:py-36">
      <Wrap><SectionHead eyebrow={d.eyebrow} title={d.title} action={d.btn_text && <A href={d.btn_url} className="btn btn-outline">{d.btn_text} <span aria-hidden="true">→</span></A>} /></Wrap>
      <motion.ul style={{ x: xa }} className="flex w-max gap-4 pl-4">{rows.slice(0, half).map(tile)}</motion.ul>
      <motion.ul style={{ x: xb }} className="mt-4 flex w-max gap-4 pl-4">{rows.slice(half).concat(rows.slice(0, 1)).map((g, k) => tile({ ...g, id: g.id + '-b' }, k + 1))}</motion.ul>
    </div>
  );
}
