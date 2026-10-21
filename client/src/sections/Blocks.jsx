import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Split, FadeUp, Magnetic, Counter, Parallax, EASE } from '../components/Motion.jsx';
import { Wrap, Eyebrow, SectionHead, TITLE } from '../components/Layout.jsx';
import Img from '../components/Img.jsx';
import ItemCard from '../components/ItemCard.jsx';
import Marquee from '../components/Marquee.jsx';
import { fmtHours } from '../components/Footer.jsx';
import { useSite } from '../lib/site.jsx';
import { lines, paras, openStatus } from '../lib/utils.js';
import { A, Badge } from './Hero.jsx';

const Arrow = () => <span aria-hidden="true">→</span>;

export function MarqueeSection({ d }) {
  return <Marquee items={lines(d.items)} />;
}

export function TextImage({ d }) {
  const { site } = useSite();
  const left = d.side === 'left';
  const second = site.gallery[1]?.path || site.gallery[0]?.path;
  const facts = [[site.items.length, 'dishes on the menu'], [site.categories.length, 'collections'], [7, 'days a week']];
  return (
    <Wrap pad className="grid items-center gap-16 md:grid-cols-[1fr_1.05fr] md:gap-24">
      <div className={left ? 'md:order-2' : ''}>
        <Eyebrow>{d.eyebrow}</Eyebrow>
        <Split text={d.title} className={TITLE} />
        <div className="mt-8 space-y-5 text-lg leading-relaxed opacity-75">
          {paras(d.body).map((p, i) => <FadeUp key={i} delay={i * 0.1}><p className="max-w-[48ch]">{p}</p></FadeUp>)}
        </div>
        <FadeUp delay={0.15} className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-current/15 pt-8">
          {facts.map(([n, l]) => (
            <div key={l}><p className="font-display text-4xl font-light italic text-wine md:text-5xl"><Counter to={n} /></p><p className="mt-1 text-xs leading-tight opacity-65">{l}</p></div>
          ))}
        </FadeUp>
        {d.btn_text && <FadeUp className="mt-10"><Magnetic><A href={d.btn_url} className="btn btn-primary">{d.btn_text} <Arrow /></A></Magnetic></FadeUp>}
      </div>
      <div className={`relative mx-auto w-full max-w-[560px] md:max-w-none ${left ? 'md:order-1' : ''}`}>
        <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-[2rem] border-2 border-wine/70 md:translate-x-6 md:translate-y-6" />
        <Parallax className="relative aspect-[4/5] rounded-t-[999px] rounded-b-[2rem] shadow-2xl" amount={9}>
          <Img path={d.image} alt={d.title} w={1000} h={1250} className="h-full w-full object-cover" />
        </Parallax>
        <FadeUp delay={0.2} className="absolute -bottom-8 -left-4 aspect-square w-[34%] overflow-hidden rounded-full border-[7px] border-cream shadow-2xl md:-left-12">
          <Img path={second} alt="" w={400} h={400} sizes="20vw" className="h-full w-full object-cover" />
        </FadeUp>
        <div className="absolute -right-3 -top-6 scale-75 md:-right-10 md:-top-8 md:scale-100"><Badge text="Made with care" /></div>
      </div>
    </Wrap>
  );
}

export function FeatureList({ d }) {
  return (
    <Wrap pad>
      <SectionHead eyebrow={d.eyebrow} title={d.title} sub={d.subtitle} />
      <ul className="border-t border-current/20">
        {(d.items || []).map((f, i) => (
          <FadeUp as="li" key={i} delay={i * 0.06} className="group grid items-baseline gap-4 border-b border-current/20 py-9 md:grid-cols-[11rem_1fr_1.2fr] md:gap-10">
            <span className="font-display text-5xl font-light italic opacity-50 transition-all duration-500 group-hover:translate-x-3 group-hover:opacity-100 md:text-6xl">{f.icon}</span>
            <h3 className="font-display text-3xl font-medium md:text-4xl">{f.title}</h3>
            <p className="max-w-[44ch] text-lg opacity-70">{f.text}</p>
          </FadeUp>
        ))}
      </ul>
    </Wrap>
  );
}

export function FeaturedItems({ d }) {
  const { site } = useSite();
  const items = site.items.filter((i) => i.is_featured).slice(0, Math.max(1, +d.limit || 4));
  return (
    <Wrap pad>
      <SectionHead eyebrow={d.eyebrow} title={d.title} sub={d.subtitle}
        action={d.btn_text && <A href={d.btn_url} className="btn btn-outline">{d.btn_text} <Arrow /></A>} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-14 lg:grid-cols-4 lg:[&>*:nth-child(even)]:translate-y-14">
        {items.map((it, i) => <ItemCard key={it.id} item={it} index={i} />)}
      </div>
      {!items.length && <p className="py-10 text-center opacity-60">Mark menu items as “featured” in the admin to show them here.</p>}
    </Wrap>
  );
}

export function Stats({ d }) {
  return (
    <Wrap className="py-20 md:py-32">
      <ul className="grid gap-12 text-center sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-current/15">
        {(d.items || []).map((it, i) => (
          <FadeUp as="li" key={i} delay={i * 0.1} className="px-4">
            <span className="font-display block text-[clamp(3.33rem,7.49vw,7.07rem)] font-light leading-none tabular-nums"><Counter to={+it.number} /><span className="ml-1 text-[0.5em] italic text-wine">{it.suffix}</span></span>
            <span className="eyebrow mt-4 block opacity-70">{it.label}</span>
          </FadeUp>
        ))}
      </ul>
    </Wrap>
  );
}

/** Closing call-to-action: a fan of guest photos, a giant headline that scales in, two actions and a live status line. */
export function CtaBanner({ d }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { s, site } = useSite();
  const status = openStatus(s.hours);
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const photos = site.gallery.slice(0, 5);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [reduce ? 1 : 0.2, 1]);
  const rot = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 18, 0]);
  return (
    <div ref={ref} className="relative overflow-hidden py-28 text-center md:py-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,190,178,0.22),transparent_60%)]" />
      <p aria-hidden="true" className="ghost-text absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-[30vw] opacity-[0.08]">Hello</p>
      <Wrap className="relative">
        {photos.length > 0 && (
          <motion.ul style={{ rotate: rot }} className="mb-10 flex justify-center" aria-hidden="true">
            {photos.map((p, k) => (
              <li key={p.id} className="-ml-5 first:ml-0 transition-transform duration-500 hover:-translate-y-3" style={{ transform: `rotate(${(k - 2) * 5}deg) translateY(${Math.abs(k - 2) * 6}px)` }}>
                <span className="block h-16 w-16 overflow-hidden rounded-full border-4 border-current shadow-xl md:h-24 md:w-24"><Img path={p.path} alt="" w={200} h={200} sizes="100px" className="h-full w-full object-cover" /></span>
              </li>
            ))}
            <li className="-ml-5 grid h-16 w-16 place-items-center rounded-full border-4 border-current bg-cream text-xl text-wine md:h-24 md:w-24 md:text-3xl">+</li>
          </motion.ul>
        )}
        <FadeUp><span className="chip !border-current/30 !bg-white/10"><span className={`pulse-dot ${status.open ? 'text-[#5be08a]' : 'opacity-50'}`} />{status.text}</span></FadeUp>
        <motion.h2 style={{ scale, opacity }} className="font-display mx-auto mt-8 max-w-[14ch] text-[clamp(2.67rem,7.9vw,7.9rem)] font-medium italic leading-[0.9]">{d.title}</motion.h2>
        {d.subtitle && <FadeUp delay={0.1}><p className="mx-auto mt-8 max-w-[46ch] text-lg opacity-80 md:text-xl">{d.subtitle}</p></FadeUp>}
        <FadeUp delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {d.btn_text && <Magnetic><A href={d.btn_url} className="btn btn-light !px-9 !py-5 text-base">{d.btn_text} <Arrow /></A></Magnetic>}
          {phone && <a href={`tel:${phone}`} className="btn btn-outline !px-8 !py-5 text-base">Call {s.phone}</a>}
        </FadeUp>
      </Wrap>
    </div>
  );
}

export function MapHours({ d }) {
  const { s, site } = useSite();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const fallback = site.gallery[0]?.path;
  return (
    <Wrap pad className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:gap-24">
      <div>
        <SectionHead eyebrow={d.eyebrow} title={d.title} sub={d.subtitle} className="!mb-8" />
        <FadeUp><address className="mb-6 text-lg not-italic">{s.address}{s.city ? `, ${s.city}` : ''}</address></FadeUp>
        <FadeUp as="dl">
          {Object.entries(s.hours || {}).map(([day, v]) => (
            <div key={day} className={`flex justify-between border-b border-current/15 py-2.5 ${day === today ? 'font-semibold text-wine' : ''}`}>
              <dt>{day}{day === today && <span className="eyebrow ml-3 rounded-full bg-wine px-2 py-0.5 text-[0.6rem] text-cream">Today</span>}</dt>
              <dd className="tabular-nums">{fmtHours(v)}</dd>
            </div>
          ))}
        </FadeUp>
      </div>
      <Parallax className="min-h-[360px] rounded-[2rem] bg-dim shadow-2xl md:min-h-[520px]" amount={0} clip>
        {s.map_embed
          ? <iframe src={s.map_embed} title={`Map to ${s.cafe_name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[360px] w-full border-0 md:min-h-[520px]" />
          : <Img path={fallback} alt="" w={1000} h={800} className="h-full w-full object-cover" />}
      </Parallax>
    </Wrap>
  );
}

export function RichText({ d }) {
  return (
    <Wrap narrow pad>
      {d.title && <Split text={d.title} className="font-display mb-8 text-[clamp(1.83rem,3.82vw,3.33rem)] font-medium leading-tight" />}
      <div className="space-y-5 text-lg leading-relaxed opacity-80">{paras(d.body).map((p, i) => <FadeUp key={i}><p>{p}</p></FadeUp>)}</div>
    </Wrap>
  );
}

export function Faq({ d }) {
  const [open, setOpen] = useState(0);
  return (
    <Wrap narrow pad>
      {d.title && <Split text={d.title} className="font-display mb-10 text-[clamp(1.83rem,3.82vw,3.33rem)] font-medium leading-tight" />}
      <div className="border-t border-current/20">
        {(d.items || []).map((f, i) => (
          <div key={i} className="border-b border-current/20">
            <h3><button type="button" className="font-display flex w-full items-center justify-between gap-6 py-6 text-left text-2xl md:text-3xl" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              {f.q}<motion.span aria-hidden="true" animate={{ rotate: open === i ? 45 : 0 }} className="text-4xl font-light">+</motion.span></button></h3>
            <AnimatePresence initial={false}>
              {open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden"><p className="max-w-[60ch] pb-7 text-lg opacity-75">{f.a}</p></motion.div>}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

export function Team({ d }) {
  const { site } = useSite();
  return (
    <Wrap pad>
      <SectionHead eyebrow={d.eyebrow} title={d.title} />
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {site.team.map((m, i) => (
          <FadeUp as="li" key={m.id} delay={i * 0.1} data-cursor="Hi">
            <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[2rem] bg-wine text-cream">
              {m.photo ? <Img path={m.photo} alt={m.name} w={800} h={1000} className="h-full w-full object-cover" /> : <span className="font-display text-[8rem] font-light italic opacity-90">{m.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>}
            </div>
            <h3 className="font-display mt-5 text-3xl">{m.name}</h3>
            <p className="eyebrow mt-1 text-wine">{m.role}</p>
            {m.bio && <p className="mt-3 max-w-[38ch] opacity-70">{m.bio}</p>}
          </FadeUp>
        ))}
      </ul>
    </Wrap>
  );
}
