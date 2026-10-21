import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useIntro } from '../lib/site.jsx';
import { fine } from '../lib/utils.js';

export const EASE = [0.16, 1, 0.3, 1];

/** Headline whose words rise out of a mask. Use *asterisks* around words for an italic accent. */
export function Split({ text = '', as: Tag = 'h2', className = '', delay = 0, gate = false, stagger = 0.07, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' });
  const { ready } = useIntro();
  const reduce = useReducedMotion();
  const show = inView && (!gate || ready);
  let italic = false;
  const words = String(text).split(/\s+/).filter(Boolean).map((w) => {
    const starts = w.startsWith('*'), ends = w.endsWith('*') && w.length > 1;
    if (starts) italic = true;
    const out = { t: w.replace(/^\*|\*$/g, ''), italic };
    if (ends) italic = false;
    return out;
  });
  const plain = String(text).replace(/\*/g, '');
  return (
    <Tag ref={ref} className={className} aria-label={plain}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-top pb-[0.14em] -mb-[0.14em] mr-[0.22em] last:mr-0">
          <motion.span className={`inline-block ${w.italic ? 'italic font-light' : ''}`} initial={{ y: reduce ? 0 : '112%', opacity: reduce ? 0 : 1 }}
            animate={show ? { y: 0, opacity: 1 } : undefined} transition={{ duration: reduce ? 0.4 : 1.05, ease: EASE, delay: delay + i * stagger }}>{w.t}</motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function FadeUp({ children, className = '', delay = 0, y = 40, gate = false, as = 'div', ...rest }) {
  const reduce = useReducedMotion();
  const { ready } = useIntro();
  const M = motion[as] || motion.div;
  const props = gate
    ? { animate: ready ? { opacity: 1, y: 0 } : undefined }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '0px 0px -10% 0px' } };
  return (
    <M className={className} initial={{ opacity: 0, y: reduce ? 0 : y }} {...props} transition={{ duration: reduce ? 0.4 : 1, ease: EASE, delay }} {...rest}>{children}</M>
  );
}

/** Pulls its child slightly toward the pointer (desktop only). */
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 15 }), y = useSpring(0, { stiffness: 200, damping: 15 });
  if (reduce || !fine()) return children;
  const move = (e) => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * strength); y.set((e.clientY - (r.top + r.height / 2)) * strength); };
  return <motion.span ref={ref} style={{ x, y, display: 'inline-block' }} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.span>;
}

export function Counter({ to = 0, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return undefined;
    const c = animate(0, Number(to) || 0, { duration: 2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Image that drifts slower than the page and reveals through a rising clip-path. */
export function Parallax({ children, className = '', amount = 12, clip = true }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  return (
    <motion.div ref={ref} className={`overflow-hidden ${className}`} initial={clip && !reduce ? { clipPath: 'inset(100% 0 0 0)' } : false}
      animate={inView || !clip ? { clipPath: 'inset(-90px -90px -90px -90px)' } : undefined} transition={{ duration: 1.3, ease: EASE }}>
      <motion.div className="h-full w-full" style={reduce ? undefined : { y, scale: 1 + amount / 50 }}>{children}</motion.div>
    </motion.div>
  );
}
