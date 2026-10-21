import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { lenis } from './SmoothScroll.jsx';
import { EASE } from './Motion.jsx';

let firstMount = true;

/**
 * Route wrapper used inside <AnimatePresence mode="wait">.
 * A wine curtain sweeps up to cover the old page (exit), the new page mounts, and the curtain lifts away (enter).
 * `skipIntro` hides the curtain on the very first load (the preloader handles that).
 */
export default function Transition({ children, skipIntro = false }) {
  const first = firstMount; firstMount = false;
  useEffect(() => {
    window.scrollTo(0, 0);
    lenis()?.scrollTo(0, { immediate: true, force: true });
  }, []);
  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      <motion.div aria-hidden="true" className="on-dark pointer-events-none fixed inset-0 z-[150] bg-wine"
        initial={{ y: first && skipIntro ? '-100%' : '0%' }}
        animate={{ y: '-100%', transition: { duration: first ? 0 : 0.9, ease: EASE, delay: first ? 0 : 0.15 } }}
        exit={{ y: ['100%', '0%'], borderTopLeftRadius: ['50% 10vh', '0% 0vh'], borderTopRightRadius: ['50% 10vh', '0% 0vh'], transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] } }} />
      {children}
    </motion.div>
  );
}
