import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useSeo, useSite, useTone, useIntro } from '../lib/site.jsx';
import { money, openStatus, paras } from '../lib/utils.js';
import { stars } from '../lib/stars.js';
import Img from '../components/Img.jsx';
import { EASE } from '../components/Motion.jsx';
import { Badge } from '../sections/Hero.jsx';

/* ---------- tiny building blocks ---------- */
const Rise = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const M = motion[Tag] || motion.div;
  return <M className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.8, ease: EASE, delay }}>{children}</M>;
};
const Title = ({ kicker, children, link, to }) => (
  <div className="mb-5 flex items-end justify-between gap-4 px-5">
    <div>
      {kicker && <p className="eyebrow mb-2 text-[0.68rem] text-wine/80">{kicker}</p>}
      <h2 className="font-display text-[1.85rem] leading-[1.12] text-ink">{children}</h2>
    </div>
    {link && <Link to={to} className="mb-1 shrink-0 rounded-full border border-wine/30 px-4 py-2 text-[0.8rem] font-medium text-wine active:scale-95">{link}</Link>}
  </div>
);
const Icon = ({ d, className = 'h-6 w-6' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const ICONS = {
  menu: 'M4 6h16M4 12h16M4 18h10',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Zm0-8.500a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chat: 'M21 12a8 8 0 0 1-11.800 7L3 21l2-5.500A8 8 0 1 1 21 12Z',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
};

/* ---------- sections ---------- */
function MHero({ d }) {
  const { s, site } = useSite();
  const { ready } = useIntro();
  const status = openStatus(s.hours);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yA = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const yB = useTransform(scrollYProgress, [0, 1], ['0%', '-16%']);
  const yC = useTransform(scrollYProgress, [0, 1], ['0%', '-26%']);
  const coffeeId = site.categories.find((c) => /coffee/i.test(c.slug))?.id;
  const pour = site.items.find((i) => i.category_id === coffeeId && i.is_featured) || site.items[0];
  const words = String(d.title || '').replace(/[*]/g, '').split(' ');
  const up = (delay) => ({ initial: { opacity: 0, y: 22 }, animate: ready ? { opacity: 1, y: 0 } : undefined, transition: { duration: 0.8, ease: EASE, delay } });
  const clip = (delay) => ({ initial: { clipPath: 'inset(100% 0 0 0)' }, animate: ready ? { clipPath: 'inset(-90px -90px -90px -90px)' } : undefined, transition: { duration: 1.2, ease: EASE, delay } });
  return (
    <section ref={ref} className="on-dark relative isolate overflow-hidden rounded-b-[2.4rem] bg-wine pb-12 text-cream">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_12%,rgba(120,190,178,0.38),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(0,0,0,0.5),transparent_60%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgba(251,248,239,0.15)_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:linear-gradient(180deg,black,transparent_85%)]" />

      <div className="px-5 pt-[5.6rem]">
        <motion.div {...up(0)} className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-black/20 px-3.5 py-1.5 text-[0.72rem] backdrop-blur-md"><span className={`pulse-dot ${status.open ? 'text-[#5be08a]' : 'text-cream/60'}`} />{status.text}</span>
        </motion.div>
        {d.eyebrow && <motion.p {...up(0.05)} className="eyebrow mb-3 text-[0.68rem] text-cream/70">{d.eyebrow}</motion.p>}

        <h1 className="font-display text-[2.7rem] leading-[1.08]" aria-label={String(d.title || '').replace(/[*]/g, '')}>
          {words.map((w, i) => (
            <span key={i} aria-hidden="true" className="mr-[0.2em] inline-block overflow-hidden align-top pb-[0.08em]">
              <motion.span className="inline-block" initial={{ y: '115%' }} animate={ready ? { y: 0 } : undefined} transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.06 }}>{w}</motion.span>
            </span>
          ))}
        </h1>
        {d.subtitle && <motion.p {...up(0.55)} className="mt-4 max-w-[34ch] text-[0.93rem] leading-[1.65] text-cream/80">{d.subtitle}</motion.p>}

        <motion.div {...up(0.7)} className="mt-6 grid grid-cols-[1fr_auto] gap-3">
          <Link to={d.btn1_url || '/menu'} className="flex items-center justify-center gap-2 rounded-full bg-cream py-[0.95rem] text-[0.92rem] font-semibold text-wine shadow-xl active:scale-95">{d.btn1_text || 'View the menu'} <Icon d={ICONS.arrow} className="h-4 w-4" /></Link>
          <Link to={d.btn2_url || '/contact'} className="flex items-center justify-center rounded-full border border-cream/45 px-6 py-[0.95rem] text-[0.92rem] font-medium active:scale-95">{d.btn2_text || 'Find us'}</Link>
        </motion.div>
      </div>

      {/* photo collage */}
      <div className="relative mx-5 mt-10 h-[23.5rem]">
        <motion.div style={{ y: yA }} className="absolute right-0 top-0 h-[21rem] w-[72%]">
          <div aria-hidden="true" className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-t-[999px] rounded-b-[1.6rem] border-2 border-cream/55" />
          <motion.div {...clip(0.3)} className="relative h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[1.6rem] bg-black/20 shadow-2xl">
            <Img path={d.image} alt="" eager w={700} h={1000} sizes="75vw" className="h-full w-full object-cover" />
          </motion.div>
        </motion.div>

        <motion.div style={{ y: yB }} className="absolute bottom-3 left-0 h-[10.5rem] w-[34%]">
          <motion.div {...clip(0.55)} className="h-full w-full -rotate-6 overflow-hidden rounded-full border-[5px] border-wine bg-black/20 shadow-2xl">
            <Img path={d.image2} alt="" eager w={300} h={520} sizes="34vw" className="h-full w-full object-cover" />
          </motion.div>
        </motion.div>

        {d.badge && (
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={ready ? { scale: 1, rotate: 0 } : undefined} transition={{ duration: 1, ease: EASE, delay: 1 }} className="absolute left-[4%] top-1">
            <Badge text={d.badge} className="!h-[5.6rem] !w-[5.6rem] !bg-cream !text-wine" />
          </motion.div>
        )}

        {pour && (
          <motion.div style={{ y: yC }} className="absolute -bottom-3 right-0 w-[70%]">
            <motion.div {...up(1.1)}>
              <Link to={'/menu/item/' + pour.slug} className="flex items-center gap-2.5 rounded-2xl border border-white/50 bg-cream/90 p-2 pr-3 text-ink shadow-2xl backdrop-blur-xl active:scale-[0.97]">
                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl"><Img path={pour.image} alt="" w={120} h={120} sizes="44px" className="h-full w-full object-cover" /></span>
                <span className="min-w-0 flex-1 leading-tight"><span className="eyebrow block whitespace-nowrap text-[0.55rem] text-wine">Today’s pour</span><span className="font-display block truncate text-[1rem]">{pour.name}</span></span>
                <span className="text-[0.72rem] font-semibold text-wine">{money(pour.sale_price || pour.price, s.currency || 'PKR')}</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function QuickActions() {
  const { s } = useSite();
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const wa = (s.whatsapp || '').replace(/\D+/g, '');
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((s.address || '') + ' ' + (s.city || ''));
  const items = [
    { label: 'Menu', icon: ICONS.menu, to: '/menu' },
    phone && { label: 'Call', icon: ICONS.phone, href: 'tel:' + phone },
    { label: 'Directions', icon: ICONS.pin, href: maps },
    wa && { label: 'WhatsApp', icon: ICONS.chat, href: 'https://wa.me/' + wa },
  ].filter(Boolean);
  const cls = 'flex flex-col items-center gap-2 text-[0.72rem] font-medium text-ink/80 active:scale-95';
  const dot = 'grid h-[3.4rem] w-[3.4rem] place-items-center rounded-[1.1rem] bg-wine/10 text-wine shadow-[0_8px_20px_-12px_rgba(47,82,77,0.6)]';
  return (
    <Rise className="grid grid-cols-4 gap-2 px-5 pt-7">
      {items.map((a) => (a.to
        ? <Link key={a.label} to={a.to} className={cls}><span className={dot}><Icon d={a.icon} /></span>{a.label}</Link>
        : <a key={a.label} href={a.href} target={a.href.startsWith('http') ? '_blank' : undefined} rel="noopener" className={cls}><span className={dot}><Icon d={a.icon} /></span>{a.label}</a>))}
    </Rise>
  );
}

function Facts({ o = {} }) {
  const { site } = useSite();
  const custom = (o.items || []).filter((r) => r.number || r.label).slice(0, 3).map((r) => [r.number, r.label]);
  const rows = custom.length ? custom : [[site.items.length, 'Dishes'], [site.categories.length, 'Collections'], [site.testimonials.length ? '5.0' : '7', site.testimonials.length ? 'Guest rating' : 'Days a week']];
  return (
    <Rise className="mx-5 mt-7 grid grid-cols-3 divide-x divide-wine/15 rounded-2xl bg-wine/[0.07] py-4 text-center">
      {rows.map(([n, l]) => (<div key={l}><p className="font-display text-[1.7rem] leading-none text-wine">{n}</p><p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink/60">{l}</p></div>))}
    </Rise>
  );
}

function Categories({ o = {} }) {
  const { site } = useSite();
  return (
    <section className="pt-12">
      <Title kicker={o.eyebrow || 'Explore'} link="All" to="/menu">{o.title || 'What are you craving?'}</Title>
      <ul className="no-scrollbar flex snap-x scroll-pl-5 gap-4 overflow-x-auto px-5 pb-3 pt-3">
        {site.categories.map((c, i) => (
          <motion.li key={c.id} className="w-[5.6rem] shrink-0 snap-start text-center" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}>
            <Link to={'/menu/' + c.slug} className="group block active:scale-95">
              <span className="relative mx-auto block h-[5.6rem] w-[5.6rem] overflow-hidden rounded-full p-[3px] ring-2 ring-wine/70 ring-offset-2 ring-offset-cream">
                <Img path={c.image} alt="" w={220} h={220} sizes="90px" className="h-full w-full rounded-full object-cover" />
              </span>
              <span className="mt-2.5 block text-[0.82rem] font-medium">{c.name}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Signature({ o = {} }) {
  const { site, currency } = useSite();
  const [mode, setMode] = useState('all');
  const coffee = site.categories.find((c) => /coffee/i.test(c.slug));
  const all = site.items.filter((i) => i.category_id === coffee?.id).slice(0, Math.max(1, +o.limit || 12));
  const pick = { hot: (t) => /hot/i.test(t.name), cold: (t) => /ice|cold/i.test(t.name) };
  const list = mode === 'all' ? all : all.filter((i) => (i.temps || []).some(pick[mode]));
  if (!all.length) return null;
  return (
    <section className="pt-14">
      <Title kicker={o.eyebrow || 'Signature coffee'} link="See all" to="/menu/coffee">{o.title || 'Brewed to be remembered'}</Title>
      <div role="tablist" aria-label="Hot or cold" className="mx-5 mb-5 inline-flex gap-1 rounded-full bg-wine/10 p-1">
        {[['all', 'All'], ['hot', 'Hot'], ['cold', 'Cold']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={'relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ' + (mode === k ? 'text-cream' : 'text-wine')}>
            {mode === k && <motion.span layoutId="m-temp" className="absolute inset-0 rounded-full bg-wine" transition={{ duration: 0.4, ease: EASE }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((it) => {
            const t = mode === 'all' ? null : (it.temps || []).find(pick[mode]);
            const price = t && t.price !== '' && t.price != null ? t.price : it.price;
            return (
              <motion.li layout key={it.id + mode} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease: EASE }} className="w-[72vw] max-w-[19rem] shrink-0 snap-start">
                <Link to={'/menu/item/' + it.slug + (t ? '?temp=' + encodeURIComponent(t.name) : '')} className="block overflow-hidden rounded-[1.8rem] bg-white shadow-[0_18px_40px_-24px_rgba(47,82,77,0.55)] active:scale-[0.98]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-dim">
                    <Img path={t?.image || it.image} alt={it.name} w={560} h={700} sizes="70vw" className="h-full w-full object-cover" />
                    {it.tags[0] && <span className="eyebrow absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[0.6rem] text-wine">{it.tags[0]}</span>}
                    <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-wine text-cream shadow-lg"><Icon d={ICONS.arrow} className="h-5 w-5" /></span>
                  </div>
                  <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-3.5">
                    <h3 className="font-display text-[1.2rem] leading-[1.2]">{it.name}</h3>
                    <span className="shrink-0 pt-0.5 text-[0.9rem] font-semibold text-wine">{money(price, currency)}</span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}

function Kitchen({ d, o = {} }) {
  const { site, currency } = useSite();
  const coffee = site.categories.find((c) => /coffee/i.test(c.slug))?.id;
  const items = site.items.filter((i) => i.category_id !== coffee).slice(0, Math.max(2, +o.limit || 6));
  if (!items.length) return null;
  return (
    <section className="pt-14">
      <Title kicker={o.eyebrow || d?.eyebrow || 'Fresh from the kitchen'} link="Menu" to="/menu">{o.title || d?.title || 'Guest favourites'}</Title>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-5">
        {items.map((it, i) => (
          <Rise key={it.id} delay={(i % 2) * 0.08}>
            <Link to={'/menu/item/' + it.slug} className="group block active:scale-[0.97]">
              <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-dim"><Img path={it.image} alt={it.name} w={400} h={400} sizes="45vw" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-wine">{money(it.sale_price || it.price, currency)}</span></div>
              <h3 className="font-display mt-3 line-clamp-2 min-h-[2.7rem] text-[1.05rem] leading-[1.3]">{it.name}</h3>
              <p className="mt-1 line-clamp-1 text-[0.75rem] text-ink/60">{it.short_desc}</p>
            </Link>
          </Rise>
        ))}
      </div>
    </section>
  );
}

function Story({ d }) {
  if (!d) return null;
  return (
    <Rise className="mx-5 mt-14 overflow-hidden rounded-[1.8rem] bg-wine text-cream">
      <div className="relative aspect-[5/4]"><Img path={d.image} alt={d.title} w={800} h={640} sizes="100vw" className="h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-wine via-wine/10 to-transparent" /></div>
      <div className="on-dark -mt-10 px-6 pb-7 relative">
        <p className="eyebrow mb-2 text-cream/70">{d.eyebrow || 'Our story'}</p>
        <h2 className="font-display text-[1.85rem] leading-[1.15]">{d.title}</h2>
        {paras(d.body)[0] && <p className="mt-3 text-[0.92rem] leading-[1.65] text-cream/80">{paras(d.body)[0]}</p>}
        <Link to={d.btn_url || '/about'} className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-wine active:scale-95">{d.btn_text || 'Read our story'} <Icon d={ICONS.arrow} className="h-4 w-4" /></Link>
      </div>
    </Rise>
  );
}

function Reviews({ o = {} }) {
  const { site } = useSite();
  const rows = site.testimonials;
  if (!rows.length) return null;
  const avg = rows.reduce((a, r) => a + (+r.rating || 0), 0) / rows.length;
  return (
    <section className="pt-14">
      <Title kicker={o.eyebrow || 'Kind words'}>{o.title || 'Loved by locals'}</Title>
      <Rise className="mx-5 mb-4 flex items-center gap-4 rounded-2xl bg-wine/10 px-5 py-4">
        <span className="font-display text-5xl leading-none text-wine">{avg.toFixed(1)}</span>
        <span><span className="block tracking-[0.2em] text-wine">{stars(Math.round(avg))}</span><span className="text-sm text-ink/65">from {rows.length} guest reviews</span></span>
      </Rise>
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
        {rows.map((t) => (
          <li key={t.id} className="w-[82vw] shrink-0 snap-center rounded-[1.6rem] bg-white p-6 shadow-[0_14px_34px_-22px_rgba(47,82,77,0.55)]">
            <span className="font-display block text-5xl leading-[0.5] text-wine/70" aria-hidden="true">“</span>
            <p className="font-display mt-3 text-[1.18rem] leading-[1.4]">{t.text}</p>
            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4"><span className="flex items-center gap-3"><span className="font-display grid h-10 w-10 place-items-center rounded-full bg-wine text-lg text-cream">{(t.name || '?')[0]}</span><span className="text-sm font-medium">{t.name}</span></span><span className="text-sm tracking-widest text-wine">{stars(t.rating)}</span></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Moments({ o = {} }) {
  const { site } = useSite();
  const g = site.gallery.slice(0, Math.min(6, Math.max(1, +o.limit || 6)));
  if (!g.length) return null;
  return (
    <section className="pt-14">
      <Title kicker={o.eyebrow || 'Gallery'} link="More" to="/gallery">{o.title || 'A peek inside'}</Title>
      <div className="grid grid-cols-3 gap-2 px-5">
        {g.map((p, i) => (
          <Rise key={p.id} delay={(i % 3) * 0.06} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
            <Link to="/gallery" aria-label={p.caption || 'Open gallery'} className={'block overflow-hidden rounded-2xl active:scale-95 ' + (i === 0 ? 'aspect-square' : 'aspect-square')}><Img path={p.path} alt={p.alt || p.caption} w={500} h={500} sizes="60vw" className="h-full w-full object-cover" /></Link>
          </Rise>
        ))}
      </div>
    </section>
  );
}

function Visit({ o = {} }) {
  const { s } = useSite();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const status = openStatus(s.hours);
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((s.address || '') + ' ' + (s.city || ''));
  return (
    <Rise className="mx-5 mt-14 rounded-[1.8rem] bg-white p-6 shadow-[0_18px_40px_-26px_rgba(47,82,77,0.6)]">
      <p className="eyebrow mb-2 text-wine/80">{o.eyebrow || 'Visit us'}</p>
      <h2 className="font-display text-[1.85rem] leading-[1.15]">{o.title || 'Find us in Kohsar Market'}</h2>
      <p className="mt-4 flex items-center gap-2.5 text-sm font-medium"><span className={`pulse-dot ${status.open ? 'text-[#1f7a3d]' : 'text-ink/40'}`} />{status.text}</p>
      <dl className="mt-4 divide-y divide-ink/10 text-[0.95rem]">
        <div className="flex justify-between py-3"><dt className="text-ink/60">Today · {today}</dt><dd className="font-semibold">{s.hours?.[today] ? s.hours[today].replace('-', ' – ') : 'Closed'}</dd></div>
        <div className="py-3"><dt className="text-ink/60">Address</dt><dd className="mt-0.5">{s.address}, {s.city}</dd></div>
      </dl>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <a href={maps} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full bg-wine py-3.5 text-sm font-semibold text-cream active:scale-95"><Icon d={ICONS.pin} className="h-4 w-4" />Directions</a>
        {phone && <a href={'tel:' + phone} className="flex items-center justify-center gap-2 rounded-full border border-wine/40 py-3.5 text-sm font-semibold text-wine active:scale-95"><Icon d={ICONS.phone} className="h-4 w-4" />Call</a>}
      </div>
    </Rise>
  );
}

function Closing({ d }) {
  if (!d) return null;
  return (
    <Rise className="on-dark mx-5 mb-14 mt-14 overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-wine to-[#1f3a36] px-6 py-10 text-center text-cream">
      <h2 className="font-display text-[2.2rem] leading-[1.1]">{d.title}</h2>
      {d.subtitle && <p className="mx-auto mt-3 max-w-[30ch] text-cream/80">{d.subtitle}</p>}
      <Link to={d.btn_url || '/contact'} className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-4 text-sm font-semibold text-wine active:scale-95">{d.btn_text || 'Visit us'} <Icon d={ICONS.arrow} className="h-4 w-4" /></Link>
    </Rise>
  );
}

/** Phone-only home page: an app-style layout built from the same content the admin edits. */
export default function MobileHome({ page }) {
  const { setTone } = useTone();
  useSeo({ title: page?.seo_title || page?.title, description: page?.seo_description, image: page?.og_image });
  useEffect(() => { setTone('dark'); return () => setTone('light'); }, [setTone]);
  const { site } = useSite();
  const get = useMemo(() => (type, n = 0) => page?.sections.filter((x) => x.type === type)[n]?.data, [page]);
  const cfg = site.mobile || {};
  const data = cfg.data || {};
  // Admin overrides win; empty override fields fall back to the matching desktop home section.
  const merge = (base, over) => { const out = { ...(base || {}) }; for (const [k, v] of Object.entries(over || {})) if (v !== '' && v != null) out[k] = v; return Object.keys(out).length ? out : null; };
  const hidden = new Set(cfg.hidden || []);
  const order = cfg.order && cfg.order.length ? cfg.order : ['hero', 'actions', 'facts', 'categories', 'signature', 'favourites', 'story', 'reviews', 'gallery', 'visit', 'closing'];
  const BLOCKS = {
    hero: () => <MHero key="hero" d={merge(get('hero'), data.hero) || {}} />,
    actions: () => <QuickActions key="actions" />,
    facts: () => <Facts key="facts" o={data.facts} />,
    categories: () => <Categories key="categories" o={data.categories} />,
    signature: () => <Signature key="signature" o={data.signature} />,
    favourites: () => <Kitchen key="favourites" d={get('featured_items')} o={data.favourites} />,
    story: () => <Story key="story" d={merge(get('text_image'), data.story)} />,
    reviews: () => <Reviews key="reviews" o={data.reviews} />,
    gallery: () => <Moments key="gallery" o={data.gallery} />,
    visit: () => <Visit key="visit" o={data.visit} />,
    closing: () => <Closing key="closing" d={merge(get('cta_banner'), data.closing)} />,
  };
  const keys = [...order.filter((k) => BLOCKS[k]), ...Object.keys(BLOCKS).filter((k) => !order.includes(k))].filter((k) => !hidden.has(k));
  return <div className="bg-cream pb-6">{keys.map((k) => BLOCKS[k]())}</div>;
}
