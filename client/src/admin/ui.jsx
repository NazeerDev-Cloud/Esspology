import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { slugify, thumb, src } from '../lib/utils.js';
import Select from './Select.jsx';

// ---- Toasts ----------------------------------------------------------------------------
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random();
    setList((l) => [...l, { id, msg, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[500] grid max-w-[92vw] gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.95 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex items-center gap-3 overflow-hidden rounded-xl py-3 pl-3.5 pr-5 text-sm text-white shadow-2xl ${t.type === 'err' ? 'bg-[#b42318]' : 'bg-[#1a2422]'}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${t.type === 'err' ? 'bg-white text-[#b42318]' : 'bg-[#5be08a] text-black'}`}>{t.type === 'err' ? '!' : '✓'}</span>
              <span>{t.msg}</span>
              <motion.span className="absolute bottom-0 left-0 h-[3px] bg-cream/50" initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 5, ease: 'linear' }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

// ---- Buttons / small bits ---------------------------------------------------------------
export const Btn = ({ variant = 'solid', size = 'md', className = '', ...p }) => {
  const v = { solid: 'bg-wine text-white hover:bg-wine-90 border-wine shadow-sm', ghost: 'bg-white text-[#1a2422] border-black/15 hover:border-wine/60 hover:bg-wine/[0.05]', danger: 'bg-white text-[#b42318] border-[#f1c5c0] hover:bg-[#b42318] hover:text-white hover:border-[#b42318]', light: 'bg-white/10 text-white border-white/20 hover:bg-white/20' }[variant];
  const z = size === 'sm' ? 'px-3 py-1.5 text-[0.8rem]' : 'px-4 py-2 text-sm';
  return <motion.button type="button" whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} {...p} className={`inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${z} ${className}`} />;
};
export const Card = ({ className = '', ...p }) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} {...p} className={`rounded-xl border border-[#e3e8ea] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-6 ${className}`} />;

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  categories: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  items: 'M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Zm12 1h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2m4-2v2',
  pages: 'M7 3h8l4 4v14H7V3Zm8 0v4h4M10 12h6m-6 4h6',
  testimonials: 'M4 5h16v11H9l-5 4V5Zm4 4h8m-8 3h5',
  team: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a5 5 0 0 0-3-4.6',
  gallery: 'M4 5h16v14H4V5Zm0 11 4.5-4.5L13 16l3-3 4 4M15.5 9.5h.01',
  nav: 'M4 7h16M4 12h16M4 17h10',
  nav_: 'M4 7h16M4 12h16M4 17h10',
  mobile: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h2',
  messages: 'M3 6h18v12H3V6Zm0 1 9 7 9-7',
  media: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  trash: 'M5 7h14M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-2.2.1-.8-.1-.8 1.9-1.5-1.8-3.2-2.3.8a7 7 0 0 0-1.4-.8L15.4 3h-3.6l-.4 2.5c-.5.2-1 .5-1.4.8l-2.3-.8-1.8 3.2L7.8 10.2l-.1.8.1.8-1.9 1.5 1.8 3.2 2.3-.8c.4.3.9.6 1.4.8l.4 2.5h3.6l.4-2.5c.5-.2 1-.5 1.4-.8l2.3.8 1.8-3.2-1.9-1.5Z',
  users: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  plus: 'M12 5v14M5 12h14',
  external: 'M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4a2 2 0 0 0 4 0',
  chevron: 'M6 9l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4-4',
  logout: 'M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5m5-4 4-4-4-4m4 4H9',
  key: 'M14 10a4 4 0 1 1-3.5 6L9 17.5H7V20H4v-3l6.5-6.5A4 4 0 0 1 14 6',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  check: 'M5 12.5 10 17.5 19 7.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
};
export const Icon = ({ name, className = 'h-[18px] w-[18px]' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name] || ICONS.pages} /></svg>
);
export const Switch = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={!!on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${on ? 'bg-wine' : 'bg-black/15'}`}>
    <motion.span animate={{ left: on ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" />
  </button>
);
export const confirmBox = (msg) => window.confirm(msg);

export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    return fn().then((data) => setState({ data, error: null, loading: false })).catch((error) => setState({ data: null, error, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}

// ---- Image field (drag & drop + media library) -------------------------------------------------
export async function uploadFiles(files) {
  const form = new FormData();
  [...files].forEach((f) => form.append('file', f));
  return (await api('/admin/upload', { method: 'POST', form })).files;
}

function Library({ onPick, onClose }) {
  const { data } = useAsync(() => api('/admin/media'), []);
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[400] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Media library" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-3xl bg-cream p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><strong>Choose an image</strong><Btn size="sm" variant="ghost" onClick={onClose}>Close</Btn></div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {(data?.items || []).map((m) => <li key={m.id}><button type="button" onClick={() => onPick(m.path)} className="block overflow-hidden rounded-xl border-2 border-transparent hover:border-wine focus-visible:border-wine"><img src={thumb(m.path)} alt="" className="aspect-square w-full object-cover" loading="lazy" /></button></li>)}
        </ul>
        {data && !data.items.length && <p className="py-8 text-center opacity-60">No images yet.</p>}
      </motion.div>
    </motion.div>
  );
}

export function ImageField({ value, onChange, label }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false), [over, setOver] = useState(false), [lib, setLib] = useState(false);
  const go = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const [r] = await uploadFiles([files[0]]);
      r.ok ? onChange(r.path) : toast(r.error, 'err');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };
  return (
    <div>
      <div role="button" tabIndex={0} aria-label={`Upload image: ${label}`} onClick={() => input.current.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); go(e.dataTransfer.files); }}
        className={`relative grid min-h-28 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-3 text-center text-sm transition-colors ${over ? 'border-wine bg-wine/10' : 'border-wine/25 bg-cream hover:border-wine'}`}>
        {value ? <img src={thumb(value)} alt="" className="max-h-44 rounded-xl" /> : <span className="opacity-60">Drop an image or click to upload<br /><small>JPG, PNG, WebP, GIF · max 8MB</small></span>}
        {busy && <span className="absolute inset-0 grid place-items-center rounded-2xl bg-cream/85">Uploading…</span>}
      </div>
      <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { go(e.target.files); e.target.value = ''; }} />
      <div className="mt-2 flex gap-2"><Btn size="sm" variant="ghost" onClick={() => setLib(true)}>Choose from library</Btn>{value && <Btn size="sm" variant="ghost" onClick={() => onChange('')}>Remove</Btn>}</div>
      {lib && <Library onPick={(p) => { onChange(p); setLib(false); }} onClose={() => setLib(false)} />}
    </div>
  );
}

// ---- Generic field renderer -----------------------------------------------------------------------
export const inputCls = 'w-full rounded-lg border border-[#d5dcdf] bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-150 placeholder:text-black/35 hover:border-[#aab6b9] focus:border-wine focus:ring-4 focus:ring-wine/15';
const emptyRow = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.kind === 'bool' ? 0 : '']));

export function FieldInput({ f, value, onChange, meta, idPrefix = 'f' }) {
  const id = `${idPrefix}-${f.name}`;
  const label = <label htmlFor={id} className="mb-1 block text-sm font-semibold">{f.label}{f.required ? ' *' : ''}</label>;
  switch (f.kind) {
    case 'bool':
      return <label className="flex cursor-pointer items-center gap-3 py-1"><input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked ? 1 : 0)} className="h-5 w-5 accent-[#2f524d]" /><span>{f.label}</span></label>;
    case 'textarea':
      return <div>{label}<textarea id={id} rows={f.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
    case 'image':
      return <div><span className="mb-1 block text-sm font-semibold">{f.label}{f.required ? ' *' : ''}</span><ImageField value={value} onChange={onChange} label={f.label} /></div>;
    case 'select': {
      const opts = f.options ? Object.entries(f.options).map(([value, label]) => ({ value, label })) : meta.options[f.optionsFrom] || [];
      return <div>{label}<Select id={id} value={value ?? ''} onChange={onChange} options={opts} clearable={!!f.nullable || value === '' || value == null} placeholder={f.nullable ? '— none / custom —' : 'Choose…'} /></div>;
    }
    case 'tags': return <TagsField f={f} value={value} onChange={onChange} />;
    case 'repeater': return <Repeater f={f} value={value} onChange={onChange} meta={meta} idPrefix={id} />;
    case 'number': return <div>{label}<input id={id} type="number" min={f.min ?? 0} max={f.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
    case 'price': return <div>{label}<input id={id} inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
    case 'password': return <div>{label}<input id={id} type="password" autoComplete="new-password" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
    default: return <div>{label}<input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
  }
}

function TagsField({ f, value, onChange }) {
  const tags = Array.isArray(value) ? value : [];
  const [text, setText] = useState('');
  const toggle = (t) => onChange(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  const add = () => { const t = text.trim(); if (t && !tags.includes(t)) onChange([...tags, t]); setText(''); };
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{f.label}</span>
      <div className="mb-2 flex flex-wrap gap-2">{[...new Set([...(f.suggestions || []), ...tags])].map((t) => (
        <button key={t} type="button" aria-pressed={tags.includes(t)} onClick={() => toggle(t)} className={`rounded-full border px-3 py-1 text-sm ${tags.includes(t) ? 'border-wine bg-wine text-cream' : 'border-wine/30 text-wine'}`}>{t}</button>))}</div>
      <div className="flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="Add custom tag…" className={inputCls} /><Btn variant="ghost" onClick={add}>Add</Btn></div>
    </div>
  );
}

function Repeater({ f, value, onChange, meta, idPrefix }) {
  const rows = Array.isArray(value) ? value : [];
  const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= rows.length) return; const c = [...rows]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{f.label}</span>
      <div className="grid gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2 rounded-xl border border-black/10 bg-cream p-3">
            <div className="grid shrink-0 content-start gap-1"><button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="rounded px-1.5 hover:bg-wine/10">↑</button><button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="rounded px-1.5 hover:bg-wine/10">↓</button></div>
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">{f.fields.map((sf) => <FieldInput key={sf.name} f={sf} value={r[sf.name]} onChange={(v) => set(i, sf.name, v)} meta={meta} idPrefix={`${idPrefix}-${i}`} />)}</div>
            <Btn size="sm" variant="danger" className="self-start" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Remove row">Remove</Btn>
          </div>
        ))}
        <div><Btn variant="ghost" size="sm" onClick={() => onChange([...rows, emptyRow(f.fields)])}>+ Add</Btn></div>
      </div>
    </div>
  );
}

export const autoSlug = (v) => slugify(v);
export { src };
