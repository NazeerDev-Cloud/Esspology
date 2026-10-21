import { useEffect } from 'react';
import Lenis from 'lenis';
import { reduced } from '../lib/utils.js';

let instance = null;
export const lenis = () => instance;

/** Lenis smooth scrolling (skipped when the visitor prefers reduced motion). */
export default function SmoothScroll() {
  useEffect(() => {
    if (reduced()) return undefined;
    instance = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (t) => { instance?.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); instance?.destroy(); instance = null; };
  }, []);
  return null;
}
