import { useEffect, useState } from 'react';

const Q = '(max-width: 767px)';

/** True below the md breakpoint. Updates live when the window is resized or the phone rotates. */
export function useIsMobile() {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(Q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(Q);
    const on = (e) => setM(e.matches);
    setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}
