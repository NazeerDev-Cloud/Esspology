export const src = (p) => (p ? (/^https?:/.test(p) ? p : '/' + p.replace(/^\//, '')) : '');
export const thumb = (p) => (p && p.endsWith('.webp') ? src(p.replace(/\.webp$/, '-t.webp')) : src(p));
// Rupees are shown whole with thousands separators (PKR 1,250); other currencies keep two decimals ($3.90).
export const money = (n, cur = 'PKR') => {
  const v = Number(n || 0);
  return /^[$£€]$/.test(cur) ? `${cur}${v.toFixed(2)}` : `${cur} ${Math.round(v).toLocaleString('en-US')}`;
};
export const paras = (t) => String(t || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
export const lines = (t) => String(t || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
export const link = (u) => u || '/';
export const isExternal = (u) => /^(https?:|mailto:|tel:)/.test(u || '');
export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const cx = (...a) => a.filter(Boolean).join(' ');
export const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** { open, text } from the settings hours map, using the visitor's local time as an approximation. */
export function openStatus(hours = {}) {
  const d = new Date();
  const range = hours[DAYS[d.getDay()]];
  if (!range || !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(range)) return { open: false, text: 'Closed today' };
  const [o, c] = range.split('-');
  const mins = d.getHours() * 60 + d.getMinutes();
  const m = (s) => +s.slice(0, 2) * 60 + +s.slice(3);
  if (mins >= m(o) && mins < m(c)) return { open: true, text: `Open now · until ${c}` };
  if (mins < m(o)) return { open: false, text: `Opens today at ${o}` };
  return { open: false, text: 'Closed · see you tomorrow' };
}
