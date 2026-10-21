import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { EASE } from './Motion.jsx';
import logoLight from '../assets/logo/site-logo-light.png';

const STRIPS = 7;

/**
 * Intro shown on every full page load: a coffee cup is drawn line by line, the name rises, a counter runs to 100,
 * then the screen opens like shutters (vertical strips slide up one after another).
 * onReady fires as the shutters start to open so hero animations can begin behind them.
 */
export default function Preloader({ name = 'Esspology', onReady }) {
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState('in');       // in -> out -> gone

  useEffect(() => {
    const c = animate(0, 100, { duration: 2.3, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setN(Math.round(v)), onComplete: () => { setTimeout(() => { onReady(); setPhase('out'); }, 200); } });
    return () => c.stop();
  }, [onReady]);

  useEffect(() => {
    if (phase !== 'out') return undefined;
    const t = setTimeout(() => setPhase('gone'), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;
  const out = phase === 'out';
  return (
    <div className="on-dark pointer-events-none fixed inset-0 z-[200] text-cream" aria-hidden="true">
      {/* shutters */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: STRIPS }, (_, i) => (
          <motion.div key={i} className="relative h-full flex-1 bg-wine" style={{ marginRight: -1 }} animate={out ? { y: '-101%' } : { y: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: out ? i * 0.07 : 0 }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,190,178,0.18),transparent_60%)]" />
          </motion.div>
        ))}
      </div>

      {/* content */}
      <motion.div className="absolute inset-0 flex flex-col items-center justify-between p-6 md:p-10" animate={{ opacity: out ? 0 : 1, scale: out ? 1.04 : 1 }} transition={{ duration: 0.5 }}>
        <div className="flex w-full justify-between">
          <p className="eyebrow opacity-70">Café &amp; Roastery</p>
          <p className="eyebrow opacity-70">Est. {new Date().getFullYear() - 5}</p>
        </div>

        <div className="flex flex-col items-center">
          <motion.img src={logoLight} alt="" width="581" height="125" className="h-auto w-[min(78vw,640px)]" initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }} />
        </div>

        <div className="w-full">
          <div className="mb-4 flex items-end justify-between">
            <p className="font-display text-6xl tabular-nums leading-none md:text-8xl">{String(n).padStart(2, '0')}<span className="text-2xl opacity-60 md:text-3xl">%</span></p>
            <p className="eyebrow max-w-[16ch] text-right opacity-70">Freshly brewed · Made to order</p>
          </div>
          <div className="h-px w-full bg-cream/25"><div className="h-full bg-cream" style={{ width: `${n}%` }} /></div>
        </div>
      </motion.div>
    </div>
  );
}
