import { useLayoutEffect, useRef, useState } from 'react';

const OVERLAP = 48;   // px the footer extends up underneath the page's rounded bottom corners

/**
 * "Curtain reveal" layout: the page sits on top and the footer is pinned underneath it,
 * so the footer is uncovered as you scroll to the end. The footer is OVERLAP px taller than the
 * space reserved for it, so it also fills in behind the page's rounded bottom corners (no cream wedges).
 * Falls back to a normal footer on small screens or when the footer is taller than the viewport.
 */
export default function RevealLayout({ children, footer }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const fh = ref.current?.offsetHeight || 0;
      setH(fh);
      setOn(window.innerWidth >= 768 && fh > 0 && fh <= window.innerHeight * 0.98);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  return (
    <>
      <div className="relative z-10 bg-cream" style={on ? { marginBottom: Math.max(0, h - OVERLAP), borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem', overflow: 'clip' } : undefined}>{children}</div>
      <div ref={ref} className={on ? 'fixed inset-x-0 bottom-0 z-0 bg-black' : 'relative'} style={on ? { paddingTop: OVERLAP } : undefined}>{footer}</div>
    </>
  );
}
