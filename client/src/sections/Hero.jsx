import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Split, FadeUp, Magnetic, EASE } from '../components/Motion.jsx';
import Img from '../components/Img.jsx';
import { useIntro, useSite } from '../lib/site.jsx';
import { isExternal, money, openStatus } from '../lib/utils.js';

export const A = ({ href = '/', className = '', children, ...p }) => (isExternal(href)
  ? <a href={href} className={className} {...p}>{children}</a>
  : <Link to={href} className={className} {...p}>{children}</Link>);

/** Rotating round badge with text on a circle. */
export function Badge({ text, className = '' }) {
  const unit = `${text} · `;
  const t = unit.repeat(Math.max(1, Math.round(30 / unit.length)));
  return (
    <div className={`relative grid h-32 w-32 place-items-center rounded-full bg-wine text-cream shadow-2xl md:h-40 md:w-40 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-[spin_20s_linear_infinite]">
        <defs><path id="circ" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs>
        <text fill="currentColor" fontSize="15" letterSpacing="4" fontFamily="Manrope" fontWeight="500" style={{ textTransform: 'uppercase' }}><textPath href="#circ" textLength="448" lengthAdjust="spacing">{t}</textPath></text>
      </svg>
      <span className="font-display text-4xl italic">E</span>
    </div>
  );
}

const Sparkle = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={`animate-[spin_14s_linear_infinite] ${className}`} aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.400-5.600-11.400-12-12C6.400 11.400 11.400 6.400 12 0Z" /></svg>
);

/**
 * Editorial split hero. Left: headline, copy, actions and a trust row.
 * Right: a layered photo collage — an offset-outlined arch, a tilted capsule, a circle on a dashed orbit,
 * a live "today's pour" card and a rotating badge. Layers drift with scroll and follow the pointer.
 */
export default function Hero({ d }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { ready } = useIntro();
  const { s, site } = useSite();
  const status = openStatus(s.hours);
  const coffeeId = site.categories.find((c) => /coffee/i.test(c.slug))?.id;
  const pour = site.items.find((i) => i.category_id === coffeeId && i.is_featured && i.image) || site.items.find((i) => i.category_id === coffeeId && i.image) || site.items.find((i) => i.image);

  // pointer parallax (each layer multiplies the same spring by its own depth)
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 }), sy = useSpring(my, { stiffness: 80, damping: 18 });
  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const depth = (k) => ({ x: useTransform(sx, (v) => v * k), y: useTransform(sy, (v) => v * k) }); // eslint-disable-line react-hooks/rules-of-hooks
  const dArch = depth(18), dCap = depth(-30), dCirc = depth(40), dCard = depth(-14);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const amt = reduce ? 0 : 1;
  const yArch = useTransform(scrollYProgress, [0, 1], ['0%', `${14 * amt}%`]);
  const yCap = useTransform(scrollYProgress, [0, 1], ['0%', `${-20 * amt}%`]);
  const yCirc = useTransform(scrollYProgress, [0, 1], ['0%', `${28 * amt}%`]);
  const yCard = useTransform(scrollYProgress, [0, 1], ['0%', `${-34 * amt}%`]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', `${8 * amt}%`]);

  const clip = (delay) => ({ initial: { clipPath: reduce ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)', opacity: reduce ? 0 : 1 }, animate: ready ? { clipPath: 'inset(-90px -90px -90px -90px)', opacity: 1 } : undefined, transition: { duration: 1.3, ease: EASE, delay } });
  const pop = (delay) => ({ initial: { opacity: 0, y: 30, scale: 0.9 }, animate: ready ? { opacity: 1, y: 0, scale: 1 } : undefined, transition: { duration: 1, ease: EASE, delay } });

  return (
    <div ref={ref} className="relative overflow-hidden" onMouseMove={onMove}>
      {/* soft background shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-[12vw] top-[4vh] hidden h-[78vh] w-[78vh] rounded-full bg-wine/[0.07] md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(rgba(47,82,77,0.14)_1.2px,transparent_1.2px)] [background-size:26px_26px] [mask-image:linear-gradient(100deg,transparent_35%,black_100%)]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1500px] items-center gap-6 px-5 pb-16 pt-32 md:grid-cols-[1.05fr_1fr] md:px-10 md:pt-28">
        {/* ---------- copy ---------- */}
        <motion.div style={{ y: yText }} className="relative z-10">
          {d.eyebrow && <FadeUp gate className="eyebrow mb-6 text-wine">{d.eyebrow}</FadeUp>}
          <Split as="h1" gate text={d.title} stagger={0.09} className="font-display text-[clamp(2.5rem,6.32vw,7.15rem)] font-medium leading-[0.92] text-ink" />
          {d.subtitle && <FadeUp gate delay={0.5} className="mt-8 max-w-[42ch] text-lg leading-relaxed text-ink/70 md:text-xl">{d.subtitle}</FadeUp>}
          <FadeUp gate delay={0.65} className="mt-9 flex flex-wrap items-center gap-4">
            {d.btn1_text && <Magnetic><A href={d.btn1_url} className="btn btn-primary">{d.btn1_text} <span aria-hidden="true">→</span></A></Magnetic>}
            {d.btn2_text && <A href={d.btn2_url} className="btn btn-outline">{d.btn2_text}</A>}
          </FadeUp>
          <FadeUp gate delay={0.8} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3" aria-hidden="true">
                {[d.image2, d.image3, d.image].map((p, i) => <span key={i} className="h-10 w-10 overflow-hidden rounded-full border-2 border-cream"><Img path={p} alt="" w={80} h={80} sizes="40px" className="h-full w-full object-cover" /></span>)}
              </div>
              <div className="text-sm leading-tight"><p className="tracking-widest text-wine">★★★★★</p><p className="text-ink/70">Loved by locals</p></div>
            </div>
            <span className="chip"><span className={`pulse-dot ${status.open ? 'text-[#1f7a3d]' : 'text-ink/40'}`} />{status.text}</span>
          </FadeUp>
        </motion.div>

        {/* ---------- collage ---------- */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[600px] md:aspect-auto md:h-[min(80vh,740px)] md:max-w-none">
          {/* orbit ring behind everything */}
          <Sparkle className="absolute left-[34%] top-[2%] h-6 w-6 text-wine" />
          <Sparkle className="absolute bottom-[4%] left-[46%] h-4 w-4 text-wine/70" />

          {/* arch with an offset outline frame */}
          <motion.div style={{ y: yArch }} className="absolute right-[5%] top-[2%] h-[80%] w-[60%]">
            <motion.div style={dArch} className="relative h-full w-full [filter:drop-shadow(0_22px_26px_rgba(0,0,0,0.22))]">
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] rounded-b-[2.2rem] border-2 border-wine md:translate-x-5 md:translate-y-5" />
              <motion.div {...clip(0.2)} className="relative h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[2.2rem] bg-dim">
                <Img path={d.image} alt="" eager w={900} h={1200} sizes="(max-width:768px) 60vw, 34vw" className="h-full w-full object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* tilted capsule */}
          <motion.div style={{ y: yCap }} className="absolute bottom-[8%] left-[1%] h-[46%] w-[28%]">
            <motion.div style={dCap} className="h-full w-full [filter:drop-shadow(0_22px_26px_rgba(0,0,0,0.22))]">
              <motion.div {...clip(0.5)} className="h-full w-full -rotate-6 overflow-hidden rounded-full border-[7px] border-cream bg-dim md:border-[9px]">
                <Img path={d.image2} alt="" eager w={500} h={900} sizes="18vw" className="h-full w-full object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* circle on its own orbit */}
          <motion.div style={{ y: yCirc }} className="absolute bottom-[2%] right-[0%] aspect-square w-[27%]">
            <motion.div style={dCirc} className="relative h-full w-full [filter:drop-shadow(0_22px_26px_rgba(0,0,0,0.22))]">
              <motion.div {...clip(0.8)} className="h-full w-full overflow-hidden rounded-full border-[6px] border-cream bg-dim">
                <Img path={d.image3} alt="" w={500} h={500} sizes="16vw" className="h-full w-full object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* live "today's pour" card */}
          {pour && (
            <motion.div style={{ y: yCard }} className="absolute left-[2%] top-[16%] z-10 w-[52%] max-w-[250px]">
              <motion.div style={dCard}>
                <motion.div {...pop(1.2)} className="animate-[float_6s_ease-in-out_infinite]">
                  <Link to={`/menu/item/${pour.slug}`} data-cursor="Order" className="flex items-center gap-3 rounded-2xl border border-white/60 bg-cream/85 p-2.5 pr-4 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"><Img path={pour.image} alt="" w={120} h={120} sizes="56px" className="h-full w-full object-cover" /></span>
                    <span className="min-w-0 leading-tight">
                      <span className="eyebrow block text-[0.6rem] text-wine">Today’s pour</span>
                      <span className="font-display block truncate text-lg">{pour.name}</span>
                      <span className="text-sm text-ink/70">{money(pour.sale_price || pour.price, s.currency || '$')}</span>
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {d.badge && (
            <motion.div className="absolute -right-1 top-[34%] z-10 md:right-[-3%]" initial={{ scale: 0, rotate: -120 }} animate={ready ? { scale: 1, rotate: 0 } : undefined} transition={{ duration: 1.1, ease: EASE, delay: 1.3 }}>
              <Badge text={d.badge} className="!h-24 !w-24 md:!h-32 md:!w-32" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
