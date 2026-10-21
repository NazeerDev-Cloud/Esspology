import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useReducedMotion } from 'framer-motion';

const wrap = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

/** Infinite text strip whose speed and direction react to scroll velocity. */
export default function Marquee({ items, className = '', base = -1.1 }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const dir = useRef(1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const left = useTransform(x, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((t, delta) => {
    if (reduce) return;
    let move = dir.current * base * (delta / 1000);
    const b = boost.get();
    if (b < -0.05) dir.current = -1; else if (b > 0.05) dir.current = 1;
    move += dir.current * Math.abs(b) * (delta / 1000) * 1.2 * Math.sign(base);
    x.set(x.get() + move);
  });

  const group = (k) => (
    <div key={k} className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-6 text-[clamp(1.5rem,3.5vw,2.99rem)] font-light italic">{t}</span>
          <span className="text-[1.4rem] opacity-60">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap py-5 ${className}`} role="marquee" aria-label={items.join(', ')}>
      <motion.div className="flex w-max" style={{ x: left }}>{[0, 1, 2, 3].map(group)}</motion.div>
    </div>
  );
}
