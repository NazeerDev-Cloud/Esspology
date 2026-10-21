import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Custom animated dropdown (replaces the native <select>).
 * options: [{ value, label, hint? }]   value: current value (string | number | '')
 * Keyboard: ↑ ↓ Home End to move, Enter / Space to choose, Esc to close, type a letter to jump.
 */
export default function Select({ options, value, onChange, placeholder = 'Choose…', id, label, className = '', size = 'md', clearable = false }) {
  const auto = useId();
  const uid = id || auto;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef(null), btn = useRef(null), list = useRef(null), typed = useRef({ s: '', t: 0 });

  const all = useMemo(() => (clearable ? [{ value: '', label: placeholder, muted: true, none: true }, ...options] : options), [options, clearable, placeholder]);
  const current = options.find((o) => String(o.value) === String(value ?? ''));
  const idx = all.findIndex((o) => String(o.value) === String(value ?? '') && (value !== '' || o.none));

  const show = () => {
    const r = btn.current?.getBoundingClientRect();
    setUp(!!r && window.innerHeight - r.bottom < 280 && r.top > 280);   // open upwards when there is no room below
    setActive(Math.max(0, idx));
    setOpen(true);
  };
  const close = (focus = true) => { setOpen(false); if (focus) btn.current?.focus(); };
  const pick = (o) => { onChange(o.value); close(); };

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  useEffect(() => { if (open) list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  const onKey = (e) => {
    if (!open) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(); } return; }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(all.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(all.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (all[active]) pick(all[active]); }
    else if (e.key === 'Tab') setOpen(false);
    else if (e.key.length === 1) {
      const t = typed.current, now = Date.now();
      t.s = now - t.t > 700 ? e.key.toLowerCase() : t.s + e.key.toLowerCase(); t.t = now;
      const k = all.findIndex((o) => String(o.label).toLowerCase().startsWith(t.s));
      if (k >= 0) setActive(k);
    }
  };

  const pad = size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-4 py-3';
  return (
    <div ref={root} className={`relative ${className}`}>
      <button ref={btn} id={uid} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={uid + '-list'} aria-label={label}
        onClick={() => (open ? close(false) : show())} onKeyDown={onKey}
        className={`group flex w-full items-center justify-between gap-3 rounded-xl border bg-white text-left outline-none transition-all duration-200 ${pad} ${open ? 'border-wine ring-4 ring-wine/15' : 'border-black/15 hover:border-wine/50 focus-visible:border-wine focus-visible:ring-4 focus-visible:ring-wine/15'}`}>
        <span className={`truncate ${current ? '' : 'text-black/45'}`}>{current ? current.label : placeholder}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-wine" aria-hidden="true">
          <path d="M3.5 6 8 10.5 12.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul ref={list} id={uid + '-list'} role="listbox" aria-labelledby={uid}
            initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: up ? 'bottom' : 'top' }}
            className={`absolute left-0 z-50 max-h-72 min-w-full overflow-auto rounded-2xl border border-wine/15 bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(47,82,77,0.45)] ${up ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            {all.map((o, k) => {
              const sel = !o.none && String(o.value) === String(value ?? '');
              return (
                <li key={String(o.value) + k} role="option" aria-selected={sel} data-active={k === active}
                  onMouseEnter={() => setActive(k)} onClick={() => pick(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-colors duration-100 ${k === active ? 'bg-wine/10' : ''} ${sel ? 'font-semibold text-wine' : o.muted ? 'text-black/50' : ''}`}>
                  <span className="min-w-0 truncate">{o.label}{o.hint && <small className="ml-2 font-normal text-black/45">{o.hint}</small>}</span>
                  {sel && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>}
                </li>
              );
            })}
            {!all.length && <li className="px-3.5 py-3 text-black/45">No options</li>}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
