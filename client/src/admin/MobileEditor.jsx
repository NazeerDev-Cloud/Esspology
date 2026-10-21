import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { Btn, Card, FieldInput, Switch, useAsync, useToast } from './ui.jsx';
import { Handle, SortItem, Sortable } from './Sortable.jsx';
import { useMeta } from './AdminApp.jsx';

const blank = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.kind === 'repeater' ? [] : '']));

/**
 * Mobile Home editor: reorder, hide and edit the blocks of the phone-only home page,
 * with a live phone-sized preview. Empty fields fall back to the desktop Home page content.
 */
export default function MobileEditor() {
  const meta = useMeta();
  const toast = useToast();
  const { data } = useAsync(() => api('/admin/mobile'), []);
  const [st, setSt] = useState(null);
  const [open, setOpen] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [rev, setRev] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    if (!data) return;
    const d = {};
    for (const [k, b] of Object.entries(data.blocks)) d[k] = { ...blank(b.fields), ...(data.data[k] || {}) };
    setSt({ order: data.order, hidden: data.hidden, data: d, blocks: data.blocks });
  }, [data]);
  if (!st) return <p>Loading…</p>;

  const set = (k, name, v) => setSt((s) => ({ ...s, data: { ...s.data, [k]: { ...s.data[k], [name]: v } } }));
  const toggle = (k) => setSt((s) => ({ ...s, hidden: s.hidden.includes(k) ? s.hidden.filter((x) => x !== k) : [...s.hidden, k] }));
  const save = async () => {
    setSaving(true);
    try {
      await api('/admin/mobile', { method: 'PUT', body: { order: st.order, hidden: st.hidden, data: st.data } });
      toast('Mobile home saved. Phones see it right away.'); setRev((r) => r + 1);
    } catch (e) { toast(e.message, 'err'); }
    setSaving(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div>
        <Card className="mb-4 !p-4">
          <p className="text-sm opacity-75">This is the home page people see on <b>phones</b> (screens under 768px wide). Drag blocks to reorder, use the switch to hide one, and open a block to change its text and photos. Anything you leave empty uses your normal Home page content.</p>
          <p className="mt-2 text-sm opacity-60">Other pages (Menu, About, Gallery, Contact, custom pages) resize automatically. In <b>Pages → Sections</b> you can also hide any section on phones or on desktop with the little phone / monitor buttons.</p>
        </Card>

        <Sortable ids={st.order} onReorder={(order) => setSt((s) => ({ ...s, order }))}>
          <ul className="grid gap-2.5">
            {st.order.map((k) => {
              const b = st.blocks[k]; const hidden = st.hidden.includes(k); const isOpen = open === k;
              return (
                <SortItem key={k} id={k}>{({ setNodeRef, style, handle }) => (
                  <li ref={setNodeRef} style={style} className={`overflow-hidden rounded-2xl border bg-white transition-colors ${isOpen ? 'border-wine/40 shadow-lg' : 'border-black/10'} ${hidden ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 p-3.5">
                      <Handle {...handle} />
                      <button type="button" className="min-w-0 flex-1 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : k)}>
                        <strong className="block truncate">{b.label}</strong>
                        <span className="text-xs opacity-55">{b.fields.length ? `${b.fields.length} editable field${b.fields.length > 1 ? 's' : ''}` : 'Automatic'}{hidden ? ' · hidden on phones' : ''}</span>
                      </button>
                      <Switch on={!hidden} onChange={() => toggle(k)} label={`Show ${b.label} on phones`} />
                      <button type="button" aria-label={isOpen ? 'Collapse' : 'Edit'} onClick={() => setOpen(isOpen ? '' : k)} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-wine">
                        <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3.5 6 8 10.5 12.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                          <div className="grid gap-4 border-t border-black/10 bg-cream/60 p-4">
                            {b.note && <p className="rounded-xl bg-wine/10 p-3 text-sm">{b.note}</p>}
                            {b.fields.length === 0 && <p className="text-sm opacity-60">Nothing to edit here — it updates automatically.</p>}
                            {b.fields.map((f) => <FieldInput key={f.name} f={f} value={st.data[k][f.name]} onChange={(v) => set(k, f.name, v)} meta={meta} idPrefix={'m-' + k} />)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>)}</SortItem>
              );
            })}
          </ul>
        </Sortable>

        <div className="sticky bottom-0 mt-5 flex flex-wrap gap-3 border-t border-black/10 bg-cream py-4">
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save mobile home'}</Btn>
          <Btn variant="ghost" onClick={() => setRev((r) => r + 1)}>Reload preview</Btn>
          <a href="/" target="_blank" rel="noopener"><Btn variant="ghost">Open site ↗</Btn></a>
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start" aria-label="Phone preview">
        <p className="eyebrow mb-3 opacity-60">Live phone preview</p>
        <div className="mx-auto w-[390px] max-w-full rounded-[2.6rem] border-[10px] border-black bg-black shadow-2xl">
          <iframe key={rev} ref={frame} src="/" title="Phone preview" className="block h-[760px] w-full rounded-[2rem] bg-cream" />
        </div>
        <p className="mt-3 text-center text-xs opacity-55">Save, then the preview reloads with your changes.</p>
      </aside>
    </div>
  );
}
