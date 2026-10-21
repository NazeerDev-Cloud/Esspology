import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../lib/site.jsx';

const P = {
  home: 'M3 11.500 12 4l9 7.500V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.500Z',
  menu: 'M7 3v7a3 3 0 0 0 3 3v8M10 3v6M13 3v7a3 3 0 0 1-3 3M18 21V3c-2.500 1.500-3 5-3 8h3',
  photos: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 9 4.500-4.500 3.500 3.500 3-3L20 17M9 9.500h.01',
  contact: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
  call: 'M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
};

/** Floating bottom tab bar for phones (hidden from md up). */
export default function TabBar() {
  const { s } = useSite();
  const { pathname } = useLocation();
  const phone = (s.phone || '').replace(/[^\d+]/g, '');
  const tabs = [
    { to: '/', label: 'Home', icon: P.home, end: true },
    { to: '/menu', label: 'Menu', icon: P.menu },
    { to: '/gallery', label: 'Gallery', icon: P.photos },
    { to: '/contact', label: 'Contact', icon: P.contact },
  ];
  if (pathname.startsWith('/admin')) return null;
  const cell = 'relative flex flex-1 flex-col items-center gap-1 py-2 text-[0.68rem] font-medium';
  const svg = (d) => <svg viewBox="0 0 24 24" className="relative h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
  return (
    <nav aria-label="Quick navigation" className="on-dark fixed inset-x-3 bottom-3 z-[78] flex items-center rounded-[1.6rem] border border-cream/15 bg-[#1f3a36]/92 p-1.5 text-cream shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden" style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}>
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cell + (isActive ? ' text-wine' : ' text-cream/75')}>
          {({ isActive }) => (<>{isActive && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[1.2rem] bg-cream" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}{svg(t.icon)}<span className="relative">{t.label}</span></>)}
        </NavLink>
      ))}
      {phone && <a href={'tel:' + phone} className={cell + ' text-cream/75'}>{svg(P.call)}<span className="relative">Call</span></a>}
    </nav>
  );
}
