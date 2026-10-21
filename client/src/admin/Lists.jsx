import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { money, thumb } from '../lib/utils.js';
import { Btn, Card, FieldInput, Switch, autoSlug, confirmBox, inputCls, uploadFiles, useAsync, useToast } from './ui.jsx';
import { Handle, SortItem, Sortable } from './Sortable.jsx';
import { useMeta } from './AdminApp.jsx';
import Select from './Select.jsx';

const useRes = (key) => { const meta = useMeta(); return { meta, def: meta.resources.find((r) => r.key === key) }; };

export function ResourceList() {
  const { key } = useParams();
  const { def, meta } = useRes(key);
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', f = sp.get('f') || '';
  const [qText, setQText] = useState(q);
  const [sel, setSel] = useState([]);
  const { data, reload, loading } = useAsync(() => api(`/admin/${key}?${new URLSearchParams({ q, f })}`), [key, q, f]);
  const [rows, setRows] = useState([]);
  useEffect(() => { setRows(data?.items || []); setSel([]); }, [data]);
  useEffect(() => setQText(q), [q]);
  if (!def) return <p>Unknown section.</p>;

  const filterOpts = def.filter ? (def.filter.options ? Object.entries(def.filter.options).map(([value, label]) => ({ value, label })) : meta.options[def.filter.optionsFrom]) : [];
  const canDrag = def.sortable && !q && !f && !def.filter;
  const bulk = async (action, ids = sel) => {
    if (!ids.length) return;
    if (action === 'delete' && !confirmBox(`Delete ${ids.length} item(s)?${def.soft ? ' They go to Trash and can be restored.' : ''}`)) return;
    try { await api(`/admin/${key}/bulk`, { method: 'POST', body: { action, ids } }); if (action === 'delete') toast('Deleted.'); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  const reorder = async (ids) => {
    setRows(ids.map((id) => rows.find((r) => r.id === id)));
    try { await api(`/admin/${key}/reorder`, { method: 'POST', body: { ids } }); toast('Order saved'); } catch (e) { toast(e.message, 'err'); reload(); }
  };
  const upload = async (files) => {
    if (!files.length) return;
    try {
      const res = await uploadFiles(files); let n = 0;
      for (const r of res) { if (r.ok) { await api('/admin/gallery', { method: 'POST', body: { path: r.path, caption: '', alt: r.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), is_visible: 1 } }); n++; } else toast(`${r.name}: ${r.error}`, 'err'); }
      if (n) toast(`${n} image(s) uploaded`); reload();
    } catch (e) { toast(e.message, 'err'); }
  };

  const cell = (r, [col, , kind]) => {
    const v = r[col];
    if (kind === 'image') return <img src={thumb(v)} alt="" width="48" height="48" className="h-12 w-12 rounded-lg bg-dim object-cover" loading="lazy" />;
    if (kind === 'price') return money(v);
    if (kind === 'bool') return v ? '✓' : '—';
    if (col === def.title) return <Link to={`/admin/${key}/${r.id}`} className="font-semibold hover:text-wine hover:underline">{v || '(untitled)'}</Link>;
    return v ?? '';
  };

  const ids = rows.map((r) => r.id);
  const RowView = ({ r, drag, setNodeRef, style, handle }) => (
      <tr key={r.id} ref={setNodeRef} style={{ ...style, animationDelay: Math.min(rows.indexOf(r), 14) * 35 + 'ms' }} className={`row-in border-t border-[#eef1f2] transition-colors hover:bg-[#f8fafb] ${def.visible && !r[def.visible] ? 'opacity-50' : ''}`}>
        <td className="w-10 px-3"><input type="checkbox" aria-label={`Select ${r[def.title]}`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} className="h-4 w-4 accent-[#2f524d]" /></td>
        {drag && <td className="w-8"><Handle {...handle} /></td>}
        {def.columns.map((c, i) => <td key={i} className="px-3 py-2.5">{cell(r, c)}</td>)}
        {def.visible && <td className="px-3"><Switch on={r[def.visible]} label={`Visible: ${r[def.title]}`} onChange={() => bulk('toggle', [r.id])} /></td>}
        <td className="whitespace-nowrap px-3 text-sm">
          <span className="flex items-center gap-1.5"><Link className="inline-flex items-center rounded-md border border-[#e3e8ea] px-2.5 py-1 text-[0.8rem] font-semibold text-[#1a2422] transition-colors hover:border-wine/50 hover:bg-wine/[0.06] hover:text-wine" to={`/admin/${key}/${r.id}`}>Edit</Link>
          {key === 'pages' && <Link className="inline-flex items-center rounded-md border border-[#e3e8ea] px-2.5 py-1 text-[0.8rem] font-semibold text-[#1a2422] transition-colors hover:border-wine/50 hover:bg-wine/[0.06] hover:text-wine" to={`/admin/pages/${r.id}/sections`}>Sections</Link>}
          {r._preview && <a className="inline-flex items-center rounded-md border border-[#e3e8ea] px-2.5 py-1 text-[0.8rem] font-semibold text-[#1a2422] transition-colors hover:border-wine/50 hover:bg-wine/[0.06] hover:text-wine" href={r._preview} target="_blank" rel="noopener">Preview</a>}
          {!(def.protect && r[def.protect]) && <button type="button" className="inline-flex items-center rounded-md border border-[#f1c5c0] px-2.5 py-1 text-[0.8rem] font-semibold text-[#b42318] transition-colors hover:bg-[#b42318] hover:text-white" onClick={() => confirmBox(`Delete “${r[def.title] || 'this item'}”?${def.soft ? ' It goes to Trash and can be restored.' : ''}`) && bulk('delete', [r.id])}>Delete</button>}</span>
        </td>
      </tr>
  );
  const rowEl = (r, drag) => (drag ? <SortItem key={r.id} id={r.id}>{(p) => RowView({ r, drag: true, ...p })}</SortItem> : RowView({ r, drag: false }));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap gap-2" role="search" onSubmit={(e) => { e.preventDefault(); setSp({ ...(qText ? { q: qText } : {}), ...(f ? { f } : {}) }); }}>
          <input type="search" value={qText} onChange={(e) => setQText(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} aria-label="Search" className={`${inputCls} !w-64`} />
          {def.filter && <Select label="Filter" size="sm" className="min-w-48" clearable value={f} placeholder={def.filter.label} options={filterOpts} onChange={(v) => setSp({ ...(q ? { q } : {}), ...(v ? { f: v } : {}) })} />}
          <Btn variant="ghost" type="submit">Search</Btn>
          {(q || f) && <Btn variant="ghost" onClick={() => setSp({})}>Clear</Btn>}
        </form>
        <Link to={`/admin/${key}/new`}><Btn>+ New {def.singular}</Btn></Link>
      </div>

      {def.multiUpload && (
        <Card className="mb-4 flex flex-wrap items-center gap-3"><label className="font-semibold" htmlFor="bulk">Upload many images at once</label>
          <input id="bulk" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} /></Card>
      )}

      {sel.length > 0 && (
        <div className="on-dark mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#1b302d] p-2.5 text-white"><span className="px-2"><b>{sel.length}</b> selected</span>
          {def.visible && <><Btn size="sm" variant="light" onClick={() => bulk('show')}>Show</Btn><Btn size="sm" variant="light" onClick={() => bulk('hide')}>Hide</Btn></>}
          <Btn size="sm" variant="light" onClick={() => bulk('delete')}>Delete</Btn></div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#e3e8ea] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <table className="w-full text-left">
          <thead className="border-b border-[#e3e8ea]"><tr>
            <th className="w-10 px-3 py-3.5"><input type="checkbox" aria-label="Select all" checked={rows.length > 0 && sel.length === rows.length} onChange={(e) => setSel(e.target.checked ? ids : [])} className="h-4 w-4 accent-[#2f524d]" /></th>
            {canDrag && <th className="w-8"><span className="sr-only">Reorder</span></th>}
            {def.columns.map((c, i) => <th key={i} className="px-3">{c[1]}</th>)}{def.visible && <th className="px-3">Visible</th>}<th className="px-3">Actions</th></tr></thead>
          <tbody>
            {canDrag ? <Sortable ids={ids} onReorder={reorder}>{rows.map((r) => rowEl(r, true))}</Sortable> : rows.map((r) => rowEl(r, false))}
            {!rows.length && <tr><td colSpan={20} className="py-10 text-center opacity-60">{loading ? 'Loading…' : 'Nothing here yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
      {canDrag && rows.length > 1 && <p className="mt-3 text-sm opacity-60">Tip: drag the ⋮⋮ handle to change the order shown on the site.</p>}
    </>
  );
}

export function ResourceForm() {
  const { key, id } = useParams();
  const { def, meta } = useRes(key);
  const nav = useNavigate();
  const toast = useToast();
  const isNew = !id || id === 'new';
  const [v, setV] = useState(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const defaults = useMemo(() => def && Object.fromEntries(def.fields.map((f) => [f.name, f.default ?? (['repeater', 'tags'].includes(f.kind) ? [] : f.kind === 'bool' ? 0 : '')])), [def]);
  useEffect(() => {
    if (!def) return;
    if (isNew) setV(defaults);
    else api(`/admin/${key}/${id}`).then(({ item }) => setV({ ...defaults, ...Object.fromEntries(def.fields.map((f) => [f.name, item[f.name] ?? defaults[f.name]])), _row: item })).catch((e) => toast(e.message, 'err'));
  }, [def, key, id, isNew, defaults, toast]);
  if (!def || !v) return <p>Loading…</p>;

  const set = (name, val) => setV((s) => {
    const n = { ...s, [name]: val };
    const slugF = def.fields.find((f) => f.kind === 'slug');
    if (slugF && name === slugF.from && !slugTouched) n[slugF.name] = autoSlug(val);
    if (slugF && name === slugF.name) setSlugTouched(true);
    return n;
  });
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const { _row, ...body } = v;
    try {
      const r = await api(`/admin/${key}${isNew ? '' : '/' + id}`, { method: isNew ? 'POST' : 'PUT', body });
      toast(`${def.singular[0].toUpperCase()}${def.singular.slice(1)} saved.`);
      nav(key === 'pages' && isNew ? `/admin/pages/${r.id}/sections` : `/admin/${key}`);
    } catch (err) { toast(err.message, 'err'); setSaving(false); }
  };
  const locked = (f) => f.lockSystem && v._row?.is_system;

  return (
    <form onSubmit={save} className="max-w-3xl">
      <Card className="grid gap-5">
        {def.fields.filter((f) => !(f.newOnly && !isNew)).map((f) => (locked(f)
          ? <div key={f.name}><span className="mb-1 block text-sm font-semibold">{f.label}</span><input readOnly value={v[f.name]} className={`${inputCls} bg-black/5`} /><small className="opacity-60">Built-in page: URL can’t change.</small></div>
          : <FieldInput key={f.name} f={f} value={v[f.name]} onChange={(val) => set(f.name, val)} meta={meta} />))}
      </Card>
      <div className="mt-5 flex flex-wrap gap-3">
        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
        <Btn variant="ghost" onClick={() => nav(`/admin/${key}`)}>Cancel</Btn>
        {v._row?._preview && <a className="inline-flex items-center rounded-full border border-wine/40 px-5 py-2.5 text-wine hover:bg-wine/10" href={v._row._preview} target="_blank" rel="noopener">Preview on site ↗</a>}
        {key === 'pages' && !isNew && <Link to={`/admin/pages/${id}/sections`} className="inline-flex items-center rounded-full border border-wine/40 px-5 py-2.5 text-wine hover:bg-wine/10">Edit sections →</Link>}
      </div>
    </form>
  );
}
