import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const SiteCtx = createContext(null);
export const useSite = () => useContext(SiteCtx);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => api('/site').then(setSite).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const s = site?.settings || {};
  const value = { site, error, reload: load, s, currency: s.currency || '$', page: (slug) => site?.pages.find((p) => p.slug === slug) };
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

/** Sets <title>, description, social tags and optional JSON-LD for the current route (client-side SEO). */
export function useSeo({ title, description, image, jsonld } = {}) {
  const { s } = useSite();
  useEffect(() => {
    const name = s.cafe_name || 'Esspology';
    document.title = title ? (title.includes(name) ? title : `${title} — ${name}`) : s.seo_title || name;
    const desc = description || s.seo_description || '';
    const img = image || s.og_image || '';
    const set = (sel, attr, key, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };
    set('meta[name="description"]', 'name', 'description', desc);
    set('meta[property="og:title"]', 'property', 'og:title', document.title);
    set('meta[property="og:description"]', 'property', 'og:description', desc);
    set('meta[property="og:image"]', 'property', 'og:image', img ? location.origin + '/' + img.replace(/^\//, '') : '');
    set('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = location.origin + location.pathname;
    let ld = document.getElementById('ld-json');
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(jsonld ? [cafeLd(s), jsonld] : [cafeLd(s)]);
  }, [title, description, image, jsonld, s]);
}

function cafeLd(s) {
  const hours = Object.entries(s.hours || {}).filter(([, v]) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(v)).map(([d, v]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: d, opens: v.slice(0, 5), closes: v.slice(6) }));
  return { '@context': 'https://schema.org', '@type': 'CafeOrCoffeeShop', name: s.cafe_name, url: location.origin, telephone: s.phone, email: s.email,
    servesCuisine: ['Breakfast', 'Sandwiches', 'Salads', 'Coffee'], address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.city }, openingHoursSpecification: hours, hasMenu: location.origin + '/menu' };
}

// Header tone: pages whose first section is dark ask the header for light text.
const ToneCtx = createContext({ tone: 'light', setTone: () => {} });
export const useTone = () => useContext(ToneCtx);
export function ToneProvider({ children }) {
  const [tone, setTone] = useState('light');
  return <ToneCtx.Provider value={{ tone, setTone }}>{children}</ToneCtx.Provider>;
}

// Intro gate: hero animations wait until the preloader has finished.
const IntroCtx = createContext({ ready: true });
export const useIntro = () => useContext(IntroCtx);
export const IntroProvider = IntroCtx.Provider;
