import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useSite, useTone } from '../lib/site.jsx';
import { isExternal, openStatus } from '../lib/utils.js';
import logoDark from '../assets/logo/logo.png';
import logoLight from '../assets/logo/site-logo-light.png';
import { lenis } from './SmoothScroll.jsx';
import { EASE, Magnetic } from './Motion.jsx';

export function NavItem({ l, className = '', onClick, children }) {
  if (isExternal(l.href) || l.new_tab) return <a href={l.href} target={l.new_tab ? '_blank' : undefined} rel="noopener" className={className} onClick={onClick}>{children ?? l.label}</a>;
  return <NavLink to={l.href} end={l.href === '/'} className={className} onClick={onClick}>{children ?? l.label}</NavLink>;
}

export default function Header() {
  const { site, s } = useSite();
  const { tone } = useTone();
  const { pathname } = useLocation();
  const { scrollY, scrollYProgress } = useScroll();
  const [solid, setSolid] = useState(false), [hidden, setHidden] = useState(false), [open, setOpen] = useState(false);
  const last = useRef(0);
  const openRef = useRef(false);
  const burger = useRef(null);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setSolid(y > 80);
    setHidden(y > last.current && y > 260 && !openRef.current);
    last.current = y;
  });
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    openRef.current = open;
    if (open) setHidden(false);
    lenis()?.[open ? 'stop' : 'start']();
    if (!open) return undefined;
    const esc = (e) => { if (e.key === 'Escape') { setOpen(false); burger.current?.focus(); } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const nav = site.nav.header;
  const status = openStatus(s.hours);
  const socials = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].filter(([k]) => s[k]);
  const light = tone === 'dark' && !solid && !open;
  const phone = (s.phone || '').replace(/[^\d+]/g, '');

  return (
    <>
      <motion.header className={`fixed inset-x-0 top-0 z-[80] transition-colors duration-500 ${solid && !open ? 'bg-cream/80 backdrop-blur-xl' : ''} ${light ? 'on-dark text-cream' : 'text-ink'}`}
        animate={{ y: hidden ? '-100%' : '0%' }} transition={{ duration: 0.5, ease: EASE }}>
        <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-wine" style={{ scaleX: scrollYProgress }} />
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="relative block" aria-label={`${s.cafe_name} — home`}>
            <img src={s.logo ? '/' + s.logo : (open || light ? logoLight : logoDark)} alt={s.cafe_name || 'Esspology'} width="581" height="125" className="h-9 w-auto md:h-11" />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
            {nav.map((l) => <NavItem key={l.id} l={l} className="link-u py-1 text-[0.95rem] font-medium" />)}
            {phone && <Magnetic><a href={`tel:${phone}`} className={`btn !px-5 !py-2.5 ${light ? 'btn-light' : 'btn-primary'}`}>Order / Call</a></Magnetic>}
          </nav>
          <button ref={burger} type="button" className="relative grid h-12 w-12 place-items-center rounded-full bg-wine text-cream md:hidden"
            aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all duration-300 ${open ? 'top-1 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all duration-300 ${open ? 'top-1 -rotate-45' : 'top-2.5'}`} />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="on-dark fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-wine text-cream md:hidden" role="dialog" aria-modal="true" aria-label="Menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.2rem) 2.2rem)' }} animate={{ clipPath: 'circle(150% at calc(100% - 2.2rem) 2.2rem)' }} exit={{ clipPath: 'circle(0% at calc(100% - 2.2rem) 2.2rem)', transition: { duration: 0.5, ease: EASE } }} transition={{ duration: 0.75, ease: EASE }}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(120,190,178,0.3),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(0,0,0,0.5),transparent_60%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(251,248,239,0.14)_1.2px,transparent_1.2px)] [background-size:26px_26px] [mask-image:linear-gradient(160deg,black,transparent_70%)]" />

            <div className="relative flex h-[76px] shrink-0 items-center justify-between px-5">
              <img src={logoLight} alt={s.cafe_name || 'Esspology'} width="581" height="125" className="h-9 w-auto" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-12 w-12 place-items-center rounded-full bg-cream text-wine active:scale-90">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="relative flex-1 px-5 pt-6">
              <p className="eyebrow mb-3 text-[0.68rem] text-cream/55">Menu</p>
              <ul>
                {nav.map((l, i) => {
                  const on = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
                  return (
                    <li key={l.id} className="overflow-hidden border-b border-cream/12">
                      <motion.div initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%', transition: { duration: 0.25 } }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.06 }}>
                        <NavItem l={l} onClick={() => setOpen(false)} className="group flex items-center gap-4 py-4 active:opacity-70">
                          <span className="eyebrow w-7 text-[0.7rem] text-cream/45">{String(i + 1).padStart(2, '0')}</span>
                          <span className={'font-display flex-1 text-[2.35rem] leading-none ' + (on ? 'text-cream' : 'text-cream/80')}>{l.label}</span>
                          {on ? <span className="h-2.5 w-2.5 rounded-full bg-[#5be08a]" aria-label="Current page" /> : <svg viewBox="0 0 24 24" className="h-5 w-5 text-cream/50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>}
                        </NavItem>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.7, ease: EASE, delay: 0.55 }} className="relative px-5 pb-8 pt-8">
              <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-black/20 px-4 py-2 text-xs"><span className={'pulse-dot ' + (status.open ? 'text-[#5be08a]' : 'text-cream/50')} />{status.text}</div>
              <div className="grid grid-cols-2 gap-3">
                {phone && <a href={'tel:' + phone} className="flex items-center justify-center gap-2 rounded-full bg-cream py-3.5 text-sm font-semibold text-wine active:scale-95"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>Call us</a>}
                <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((s.address || '') + ' ' + (s.city || ''))} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full border border-cream/40 py-3.5 text-sm font-semibold active:scale-95"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21Zm0-8.500a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>Directions</a>
              </div>
              <p className="mt-5 text-[0.8rem] leading-relaxed text-cream/65">{s.address}{s.city ? ', ' + s.city : ''}</p>
              {socials.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{socials.map(([k, label]) => <li key={k}><a href={s[k]} target="_blank" rel="noopener" className="inline-block rounded-full border border-cream/25 px-4 py-1.5 text-xs">{label}</a></li>)}</ul>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
