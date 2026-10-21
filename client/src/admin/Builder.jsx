import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Btn, Card, FieldInput, Switch, confirmBox, inputCls, useAsync, useToast } from './ui.jsx';
import { Handle, SortItem, Sortable } from './Sortable.jsx';
import { useMeta } from './AdminApp.jsx';
import Select from './Select.jsx';

const summary = (s) => {
  const d = s.data || {};
  const t = ['title', 'eyebrow'].map((k) => d[k]).find((x) => typeof x === 'string' && x);
  return (t || '').replace(/\*/g, '').slice(0, 70);
};

/** Page builder: add, reorder (drag), hide, edit and delete a page's sections. */
export function PageBuilder() {
  const { id } = useParams();
  const meta = useMeta();
  const toast = useToast();
  const nav = useNavigate();
  const { data, reload } = useAsync(() => api(`/admin/pages/${id}/sections`), [id]);
  const [rows, setRows] = useState([]);
  const [type, setType] = useState('');
  useEffect(() => setRows(data?.sections || []), [data]);
  if (!data) return <p>Loading…</p>;
  const { page } = data;

  const reorder = async (ids) => {
    setRows(ids.map((i) => rows.find((r) => r.id === i)));
    try { await api('/admin/sections/reorder', { method: 'POST', body: { ids } }); toast('Order saved'); } catch (e) { toast(e.message, 'err'); reload(); }
  };
  const toggle = async (s) => { await api(`/admin/sections/${s.id}`, { method: 'PUT', body: { is_visible: !s.is_visible } }); reload(); };
  const del = async (s) => { if (!confirmBox('Delete this section? This cannot be undone.')) return; await api(`/admin/sections/${s.id}`, { method: 'DELETE' }); toast('Section deleted.'); reload(); };
  const add = async () => {
    if (!type) return toast('Choose a section type first.', 'err');
    const r = await api(`/admin/pages/${page.id}/sections`, { method: 'POST', body: { type } });
    toast('Section added. Fill in its content.'); nav(`/admin/sections/${r.id}`);
  };
  const preview = page.slug === 'home' ? '/' : `/${page.slug}`;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="opacity-70">Drag sections to reorder. Changes go live immediately.</p>
        <div className="flex gap-2"><Link to={`/admin/pages/${page.id}`}><Btn variant="ghost">Page settings &amp; SEO</Btn></Link><a href={preview} target="_blank" rel="noopener"><Btn variant="ghost">Preview on site ↗</Btn></a></div>
      </div>
      <Sortable ids={rows.map((r) => r.id)} onReorder={reorder}>
        <ul className="grid gap-2.5">
          {rows.map((s) => (
            <SortItem key={s.id} id={s.id}>{({ setNodeRef, style, handle }) => (
              <li ref={setNodeRef} style={style} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-3.5 ${s.is_visible ? '' : 'opacity-55'}`}>
                <Handle {...handle} />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <strong>{meta.sectionTypes[s.type]?.label || s.type}</strong><span className="truncate opacity-60">{summary(s)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${s.bg === 'wine' ? 'bg-wine text-cream' : s.bg === 'black' ? 'bg-black text-cream' : 'bg-dim'}`}>{meta.backgrounds[s.bg]}</span>
                  {!s.is_visible && <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-xs">hidden</span>}
                </div>
                <div className="flex items-center gap-1.5" role="group" aria-label="Show on devices">
                  {[['hide_mobile', 'Phone', 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm4 15h2'], ['hide_desktop', 'Desktop', 'M3 5h18v11H3V5Zm6 14h6m-3-3v3']].map(([k, label, d]) => (
                    <button key={k} type="button" title={s[k] ? `Hidden on ${label.toLowerCase()} — click to show` : `Shown on ${label.toLowerCase()} — click to hide`} aria-pressed={!s[k]} aria-label={`${label}: ${s[k] ? 'hidden' : 'shown'}`}
                      onClick={async () => { await api(`/admin/sections/${s.id}`, { method: 'PUT', body: { [k]: !s[k] } }); toast(`${s[k] ? 'Shown' : 'Hidden'} on ${label.toLowerCase()}`); reload(); }}
                      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${s[k] ? 'border-black/15 bg-black/5 text-black/35 line-through' : 'border-wine/40 bg-wine/10 text-wine'}`}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
                  <Switch on={s.is_visible} onChange={() => toggle(s)} label={`Visible: ${meta.sectionTypes[s.type]?.label}`} />
                  <Link to={`/admin/sections/${s.id}`}><Btn size="sm" variant="ghost">Edit</Btn></Link><Btn size="sm" variant="danger" onClick={() => del(s)}>Delete</Btn></div>
              </li>)}</SortItem>
          ))}
        </ul>
      </Sortable>
      {!rows.length && <Card className="opacity-70">This page has no sections yet. Add one below.</Card>}
      <Card className="mt-5 flex flex-wrap items-center gap-3">
        <label htmlFor="newtype" className="font-semibold">Add a section</label>
        <Select id="newtype" className="min-w-64" value={type} onChange={setType} placeholder="Choose a type…" options={Object.entries(meta.sectionTypes).map(([k, t]) => ({ value: k, label: t.label }))} />
        <Btn onClick={add}>+ Add section</Btn>
      </Card>
    </>
  );
}

export function SectionEditor() {
  const { id } = useParams();
  const meta = useMeta();
  const toast = useToast();
  const nav = useNavigate();
  const [s, setS] = useState(null), [page, setPage] = useState(null), [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // find the section by scanning pages (small data set)
      for (const p of meta.options.pages) {
        const r = await api(`/admin/pages/${p.value}/sections`);
        const f = r.sections.find((x) => x.id === +id);
        if (f) { setS(f); setPage(r.page); return; }
      }
      toast('Section not found.', 'err');
    })();
  }, [id, meta, toast]);
  if (!s) return <p>Loading…</p>;
  const def = meta.sectionTypes[s.type];
  const setData = (k, v) => setS({ ...s, data: { ...s.data, [k]: v } });
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api(`/admin/sections/${s.id}`, { method: 'PUT', body: { data: s.data, bg: s.bg, is_visible: !!s.is_visible } }); toast('Section saved.'); nav(`/admin/pages/${page.id}/sections`); }
    catch (err) { toast(err.message, 'err'); setSaving(false); }
  };
  return (
    <form onSubmit={save} className="max-w-3xl">
      <p className="mb-3 opacity-70">Page: <Link className="text-wine underline" to={`/admin/pages/${page.id}/sections`}>{page.title}</Link> · Type: {def.label}</p>
      {def.note && <p className="mb-4 rounded-xl bg-wine/10 p-3">{def.note}</p>}
      <p className="mb-4 text-sm opacity-60">Tip: wrap words in *asterisks* in a title to make them italic.</p>
      <Card className="grid gap-5">
        {def.fields.map((f) => <FieldInput key={f.name} f={f} value={s.data[f.name]} onChange={(v) => setData(f.name, v)} meta={meta} idPrefix="s" />)}
        <fieldset className="grid gap-4 rounded-2xl border border-black/10 p-4"><legend className="px-2 font-semibold">Look</legend>
          <div><label htmlFor="bg" className="mb-1 block text-sm font-semibold">Background colour</label>
            <Select id="bg" value={s.bg} onChange={(v) => setS({ ...s, bg: v })} options={Object.entries(meta.backgrounds).map(([k, v]) => ({ value: k, label: v }))} /></div>
          <label className="flex items-center gap-3"><input type="checkbox" checked={!!s.is_visible} onChange={(e) => setS({ ...s, is_visible: e.target.checked ? 1 : 0 })} className="h-5 w-5 accent-[#2f524d]" /> Visible on site</label>
        </fieldset>
      </Card>
      <div className="mt-5 flex gap-3"><Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save section'}</Btn><Btn variant="ghost" onClick={() => nav(`/admin/pages/${page.id}/sections`)}>Cancel</Btn></div>
    </form>
  );
}
