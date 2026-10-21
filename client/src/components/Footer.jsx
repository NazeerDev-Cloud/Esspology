import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../lib/site.jsx';
import { api } from '../lib/api.js';
import { openStatus } from '../lib/utils.js';
import { FadeUp, Magnetic } from './Motion.jsx';
import { NavItem } from './Header.jsx';
import Img from './Img.jsx';
import logoLight from '../assets/logo/site-logo-light.png';
import Marquee from './Marquee.jsx';
import { lenis } from './SmoothScroll.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const fmtHours = (v) => (v ? v.replace('-', ' – ') : 'Closed');

const Col = ({ title, children, className = '' }) => (
  <div className={className}>
    <h2 className="eyebrow mb-5 flex items-center gap-3 text-cream/55">{title}</h2>
    {children}
  </div>
);

/**
 * Footer: wine marquee band, a large lead-in with the café name and newsletter, then four columns
 * (visit / explore / hours / follow) with a photo strip and a closing wordmark.
 * App pins it under the page on desktop so it is uncovered as you reach the bottom.
 */
export default function Footer() {
  const { site, s } = useSite();
  const [email, setEmail] = useState(''), [state, setState] = useState('idle'), [hp, setHp] = useState('');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const status = openStatus(s.hours);
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.address || ''} ${s.city || ''}`)}`;
  const join = async (e) => {
    e.preventDefault(); setState('busy');
    try {
      await api('/contact', { method: 'POST', body: { name: 'Newsletter subscriber', email, subject: 'Newsletter sign-up', message: 'Please add me to the newsletter.', website: hp } });
      setState('done'); setEmail('');
    } catch (err) { setState(err.data?.errors?.email || err.message || 'error'); }
  };
  const top = () => (lenis() ? lenis().scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: 'smooth' }));
  const socials = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].filter(([k]) => s[k]);
  const photos = site.gallery.slice(0, 4);
  const name = s.cafe_name || 'Esspology';

  return (
    <footer className="on-dark relative overflow-hidden bg-black text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(47,82,77,0.85),transparent_50%),radial-gradient(ellipse_at_0%_100%,rgba(47,82,77,0.5),transparent_55%)]" />

      <div className="relative border-y border-cream/10 bg-wine text-cream">
        <Marquee items={['Freshly brewed', 'Made to order', 'Come hungry', 'Stay awhile', 'Specialty coffee']} base={-1.2} />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 pt-16 md:px-10 md:pt-20">
        {/* lead-in */}
        <div className="grid items-end gap-10 border-b border-cream/15 pb-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <FadeUp><Link to="/" aria-label="Home"><img src={logoLight} alt={name} width="581" height="125" className="mb-8 h-12 w-auto md:h-14" /></Link></FadeUp>
            <FadeUp><p className="eyebrow mb-5 flex items-center gap-3 text-cream/60">Join the table</p></FadeUp>
            <FadeUp delay={0.05}><p className="font-display text-[clamp(2.6rem,6.2vw,6rem)] leading-[1] tracking-tight">Good coffee,<br />good company.</p></FadeUp>
          </div>
          <FadeUp delay={0.12}>
            <form onSubmit={join} aria-label="Newsletter">
              <label htmlFor="nl" className="mb-3 block text-cream/70">Seasonal menus and the occasional pastry drop. No spam, ever.</label>
              <div className="flex rounded-full border border-cream/30 bg-cream/[0.06] p-1.5 backdrop-blur transition-colors focus-within:border-cream">
                <input id="nl" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" autoComplete="email" className="min-w-0 flex-1 bg-transparent px-5 text-sm placeholder:text-cream/45 focus:outline-none" />
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" value={hp} onChange={(e) => setHp(e.target.value)} />
                <button className="btn btn-light !px-6 !py-3 text-sm" disabled={state === 'busy'}>Subscribe <span aria-hidden="true">→</span></button>
              </div>
              {state === 'done' && <p className="mt-3 pl-3 text-sm text-cream/85" role="status">Thank you — you’re on the list.</p>}
              {!['idle', 'busy', 'done'].includes(state) && <p className="mt-3 pl-3 text-sm text-cream/85" role="alert">{state}</p>}
            </form>
          </FadeUp>
        </div>

        {/* columns */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1fr_1fr]">
          <Col title="Visit">
            <p className="mb-4 inline-flex items-center gap-3 rounded-full border border-cream/20 px-4 py-1.5 text-sm"><span className={`pulse-dot ${status.open ? 'text-[#5be08a]' : 'text-cream/50'}`} />{status.text}</p>
            <address className="font-display text-[1.7rem] not-italic leading-tight">{s.address}<br /><span className="text-cream/60">{s.city}</span></address>
            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic><a href={maps} target="_blank" rel="noopener" className="btn btn-light !px-5 !py-2.5 text-sm">Get directions <span aria-hidden="true">↗</span></a></Magnetic>
              {phone && <a href={`tel:${phone}`} className="btn btn-outline !px-5 !py-2.5 text-sm">{s.phone}</a>}
            </div>
            {s.email && <a href={`mailto:${s.email}`} className="link-u mt-5 inline-block text-cream/80">{s.email}</a>}
          </Col>

          <Col title="Explore">
            <nav aria-label="Footer"><ul className="space-y-1">
              {site.nav.footer.map((l) => (
                <li key={l.id}><NavItem l={l} className="font-display group inline-flex items-baseline gap-3 text-[2rem] leading-tight transition-transform duration-500 hover:translate-x-2">
                  <span>{l.label}</span><span className="text-lg text-cream/0 transition-colors group-hover:text-cream" aria-hidden="true">→</span></NavItem></li>
              ))}
            </ul></nav>
          </Col>

          <Col title="Opening hours">
            <dl className="text-sm">
              {DAYS.map((d) => (
                <div key={d} className={`flex justify-between border-b border-cream/10 py-2 ${d === today ? 'font-semibold text-cream' : 'text-cream/60'}`}>
                  <dt className="flex items-center gap-2">{d === today && <motion.span className="h-1.5 w-1.5 rounded-full bg-cream" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />}{d.slice(0, 3)}</dt>
                  <dd className="tabular-nums">{fmtHours(s.hours?.[d])}</dd>
                </div>
              ))}
            </dl>
          </Col>

          <Col title="Follow">
            {photos.length > 0 && (
              <ul className="mb-5 grid grid-cols-2 gap-2">
                {photos.map((p) => (
                  <li key={p.id} className="overflow-hidden rounded-xl"><Link to="/gallery" aria-label="Open gallery" data-cursor="View"><Img path={p.path} alt="" w={300} h={300} sizes="120px" className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-110" /></Link></li>
                ))}
              </ul>
            )}
            <ul className="flex flex-wrap gap-2">
              {socials.map(([k, l]) => <li key={k}><a href={s[k]} target="_blank" rel="noopener" className="inline-block rounded-full border border-cream/30 px-4 py-1.5 text-sm transition-colors hover:bg-cream hover:text-wine">{l} ↗</a></li>)}
            </ul>
          </Col>
        </div>
      </div>

      {/* closing wordmark */}
      <div className="relative overflow-hidden" aria-hidden="true">
        <p className="font-display pointer-events-none -mb-[0.16em] select-none whitespace-nowrap bg-gradient-to-b from-cream/25 to-transparent bg-clip-text text-center text-[19vw] leading-[0.85] text-transparent">{name}</p>
      </div>

      <div className="relative border-t border-cream/10 bg-black/50">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 pb-28 pt-5 text-xs text-cream/60 md:px-10 md:pb-5">
          <p className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <span>© {new Date().getFullYear()} {s.footer_text}</span>
            <span className="hidden opacity-40 sm:inline" aria-hidden="true">·</span>
            <span>Designed &amp; developed by <a href="https://www.aluxtechnologies.com" target="_blank" rel="noopener" className="link-u font-semibold text-cream">Alux Tech</a></span>
          </p>
          <p className="flex items-center gap-6">
            <Link to="/contact" className="link-u">Contact</Link>
            <Link to="/admin" className="link-u">Admin</Link>
            <button type="button" onClick={top} className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-1.5 transition-colors hover:bg-cream hover:text-wine" aria-label="Back to top">Back to top <span aria-hidden="true">↑</span></button>
          </p>
        </div>
      </div>
    </footer>
  );
}
