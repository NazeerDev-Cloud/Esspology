import { useEffect, useState } from 'react';
import { useSite } from '../lib/site.jsx';

/** Floating WhatsApp button + cookie notice (toggle in admin). Analytics starts after consent. */
export default function Extras() {
  const { s } = useSite();
  const [seen, setSeen] = useState(() => { try { return localStorage.getItem('esspCookie') === '1'; } catch { return false; } });
  const wa = (s.whatsapp || '').replace(/\D+/g, '');
  const notice = s.cookie_notice === '1';

  useEffect(() => {
    if ((notice && !seen) || !/^[A-Za-z0-9-]+$/.test(s.ga_id || '') || window.__gaOn) return;
    window.__gaOn = true;
    const sc = document.createElement('script'); sc.async = true; sc.src = `https://www.googletagmanager.com/gtag/js?id=${s.ga_id}`; document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', s.ga_id);
  }, [notice, seen, s.ga_id]);

  return (
    <>
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" data-cursor="Chat"
          className="fixed bottom-[5.6rem] right-4 z-[70] grid h-12 w-12 md:bottom-5 md:right-5 md:h-14 md:w-14 place-items-center rounded-full bg-wine text-cream shadow-xl transition-transform hover:scale-110">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.7.7-2.5-.3-.4A8 8 0 0 1 12 4Zm-3 3.5c-.3 0-.7.1-1 .5-.6.7-.9 1.6-.5 2.7.7 2.2 2.4 4 4.5 5 1.3.6 2.3.7 3.1.5.7-.2 1.3-.9 1.5-1.6 0-.2 0-.4-.2-.5l-1.8-.9c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.3-.6-2.3-1.6-2.9-2.9-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.4 0-.6l-.8-1.8c-.1-.2-.3-.3-.5-.3H9Z" /></svg>
        </a>
      )}
      {notice && !seen && (
        <div role="dialog" aria-label="Cookie notice" className="on-dark fixed bottom-[5.6rem] left-3 right-3 z-[79] flex max-w-sm items-center gap-3 rounded-2xl bg-black px-3.5 py-2.5 text-[0.72rem] leading-snug text-cream shadow-2xl md:bottom-5 md:left-5 md:right-auto md:z-[75] md:gap-4 md:p-4 md:text-sm">
          <p>We use cookies to improve your experience and understand how the site is used.</p>
          <button className="btn btn-light shrink-0 whitespace-nowrap !px-4 !py-1.5 !text-[0.78rem]" onClick={() => { try { localStorage.setItem('esspCookie', '1'); } catch { /* private mode */ } setSeen(true); }}>Got it</button>
        </div>
      )}
    </>
  );
}
