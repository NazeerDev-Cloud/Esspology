import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { fine, reduced } from '../lib/utils.js';

/** True when the nearest solid background behind (x, y) is dark (wine / black). */
function darkAt(x, y) {
  let el = document.elementFromPoint(x, y);
  while (el && el !== document.documentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || +m[3] > 0.6)) {
      const [r, g, b] = m.map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Custom cursor (desktop / fine pointer only). Burgundy on light (beige) backgrounds and beige on dark
 * (burgundy / black) ones — it re-checks the surface under it on every move and while scrolling.
 * Grows with a label over [data-cursor] elements.
 */
export default function Cursor() {
  const [on] = useState(() => fine() && !reduced());
  const [state, setState] = useState({ size: 14, label: '' });
  const [dark, setDark] = useState(false);
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 }), sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const pos = useRef({ x: -100, y: -100 }), frame = useRef(0);

  useEffect(() => {
    if (!on) return undefined;
    document.documentElement.classList.add('cursor-on');
    const check = () => { frame.current = 0; setDark(darkAt(pos.current.x, pos.current.y)); };
    const schedule = () => { if (!frame.current) frame.current = requestAnimationFrame(check); };
    const move = (e) => { pos.current = { x: e.clientX, y: e.clientY }; x.set(e.clientX); y.set(e.clientY); schedule(); };
    const over = (e) => {
      const c = e.target.closest?.('[data-cursor]');
      if (c) return setState({ size: 92, label: c.dataset.cursor });
      if (e.target.closest?.('a, button, input, textarea, select, summary')) return setState({ size: 36, label: '' });
      return setState({ size: 14, label: '' });
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('mouseover', over);
    return () => {
      document.documentElement.classList.remove('cursor-on');
      cancelAnimationFrame(frame.current);
      window.removeEventListener('mousemove', move); window.removeEventListener('scroll', schedule); window.removeEventListener('mouseover', over);
    };
  }, [on, x, y]);

  if (!on) return null;
  return (
    <motion.div aria-hidden="true" className={`cursor-dot pointer-events-none fixed left-0 top-0 z-[300] grid place-items-center rounded-full transition-colors duration-300 ${dark ? 'bg-cream text-wine' : 'bg-wine text-cream'}`}
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }} animate={{ width: state.size, height: state.size, opacity: state.size === 36 ? 0.6 : 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <span className="eyebrow text-[0.6rem]" style={{ opacity: state.label ? 1 : 0 }}>{state.label}</span>
    </motion.div>
  );
}
