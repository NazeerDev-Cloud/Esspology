import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Counter } from '../components/Motion.jsx';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { thumb } from '../lib/utils.js';
import { Btn, Card, FieldInput, Icon, confirmBox, inputCls, uploadFiles, useAsync, useToast } from './ui.jsx';
import { useMeta } from './AdminApp.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const KPI = {
  'Menu items': { icon: 'items', to: '/admin/items', tone: 'bg-[#e8f3f1] text-[#2f524d]' },
  Categories: { icon: 'categories', to: '/admin/categories', tone: 'bg-[#eaf0fb] text-[#3156a6]' },
  Pages: { icon: 'pages', to: '/admin/pages', tone: 'bg-[#fdf3e3] text-[#a15c07]' },
  'Unread messages': { icon: 'messages', to: '/admin/messages', tone: 'bg-[#fdecea] text-[#b42318]' },
};
const ACTIONS = [
  ['+ Add menu item', '/admin/items/new', 'items'], ['Edit pages', '/admin/pages', 'pages'], ['Mobile home', '/admin/mobile', 'mobile'],
  ['Upload photos', '/admin/gallery', 'gallery'], ['Navigation', '/admin/nav', 'nav'], ['Site settings', '/admin/settings', 'settings'],
];

export function Dashboard({ user }) {
  const { data } = useAsync(() => api('/admin/dashboard'), []);
  if (!data) return <p className="text-black/50">Loading…</p>;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <>
      <div className="on-dark relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#2f524d] to-[#1b302d] p-6 text-white md:p-8">
        <span aria-hidden="true" className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/[0.06]" />
        <p className="eyebrow relative text-white/60">{greet}</p>
        <h2 className="font-display relative mt-1 text-2xl md:text-3xl">Welcome back, {user?.name || 'Admin'}</h2>
        <p className="relative mt-1.5 max-w-xl text-sm text-white/70">Manage your menu, pages and messages from here. Changes go live on the website straight away.</p>
        <div className="relative mt-5 flex flex-wrap gap-2.5">
          <Link to="/admin/items/new"><Btn variant="light" className="!bg-white !text-[#1b302d] hover:!bg-white/90">+ New menu item</Btn></Link>
          <Link to="/admin/mobile"><Btn variant="light">Edit mobile home</Btn></Link>
          <a href="/" target="_blank" rel="noopener"><Btn variant="light">View website</Btn></a>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(data.counts).map(([k, n], i) => {
          const m = KPI[k] || KPI.Pages;
          return (
            <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
              <Link to={m.to} className="group flex items-center gap-4 rounded-xl border border-[#e3e8ea] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-wine/30 hover:shadow-md">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${m.tone}`}><Icon name={m.icon} className="h-6 w-6" /></span>
                <span><span className="block text-3xl font-bold leading-none tracking-tight"><Counter to={Number(n)} /></span><span className="mt-1.5 block text-sm text-black/55">{k}</span></span>
                <Icon name="arrow" className="ml-auto h-4 w-4 text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-wine" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="!p-0">
          <div className="flex items-center justify-between border-b border-[#eef1f2] px-5 py-4"><h2 className="font-display text-base">Recent messages</h2><Link to="/admin/messages" className="text-sm font-semibold text-wine hover:underline">View all</Link></div>
          {!data.recent.length ? <p className="p-8 text-center text-sm text-black/50">No messages yet.</p> : (
            <ul>{data.recent.map((m) => (
              <li key={m.id} className="border-b border-[#eef1f2] last:border-0">
                <Link to="/admin/messages" className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#f8fafb]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f3f1] text-sm font-bold text-wine">{(m.name || '?').slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-sm">{m.name}</b><small className="block truncate text-black/50">{m.subject || m.email}</small></span>
                  <span className="shrink-0 text-right"><small className="block text-black/45">{m.created_at}</small>{!m.is_read && <span className="mt-0.5 inline-block rounded-full bg-[#e5484d] px-2 text-[0.65rem] font-bold text-white">New</span>}</span>
                </Link>
              </li>))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display mb-3 text-base">Quick actions</h2>
          <ul className="grid grid-cols-2 gap-2.5">
            {ACTIONS.map(([label, to, icon]) => (
              <li key={to}><Link to={to} className="flex items-center gap-2.5 rounded-lg border border-[#e3e8ea] px-3 py-3 text-sm font-medium transition-colors hover:border-wine/40 hover:bg-wine/[0.05]"><Icon name={icon} className="h-4 w-4 text-wine" />{label}</Link></li>
            ))}
          </ul>
          <a href="/" target="_blank" rel="noopener" className="mt-3 flex items-center justify-between rounded-lg bg-[#f4f6f8] px-3.5 py-3 text-sm font-medium hover:bg-[#e8ecef]">Open the live website <Icon name="external" className="h-4 w-4" /></a>
        </Card>
      </div>
    </>
  );
}

export function Settings() {
  const meta = useMeta();
  const toast = useToast();
  const { data } = useAsync(() => api('/admin/settings'), []);
  const [v, setV] = useState(null), [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setV(data.values); }, [data]);
  if (!v) return <p>Loading…</p>;
  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));
  const hours = v.hours || {};
  const setHour = (d, i, val) => { const [o = '08:00', c = '18:00'] = (hours[d] || '').split('-'); const n = i === 0 ? `${val}-${c}` : `${o}-${val}`; set('hours', { ...hours, [d]: n }); };
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api('/admin/settings', { method: 'PUT', body: v }); toast('Settings saved. The live site is updated.'); } catch (err) { toast(err.message, 'err'); }
    setSaving(false);
  };
  const kindOf = (k) => (k === 'bool' ? 'bool' : k);
  return (
    <form onSubmit={save} className="max-w-3xl pb-24">
      {Object.entries(meta.settingsGroups).map(([title, fields]) => (
        <Card key={title} className="mb-5 grid gap-4"><h2 className="font-display text-2xl">{title}</h2>
          {fields.map(([key, label, kind]) => <FieldInput key={key} f={{ name: key, label, kind: kindOf(kind) }} value={kind === 'bool' ? (v[key] === '1' ? 1 : 0) : v[key]} onChange={(val) => set(key, kind === 'bool' ? (val ? '1' : '0') : val)} meta={meta} idPrefix="st" />)}
          {title === 'Contact' && (
            <div><span className="mb-2 block text-sm font-semibold">Opening hours</span>
              {DAYS.map((d) => { const [o = '08:00', c = '18:00'] = (hours[d] || '').split('-'); const closed = !hours[d];
                return <div key={d} className="flex flex-wrap items-center gap-3 border-b border-black/10 py-2"><span className="w-28">{d}</span>
                  <input type="time" aria-label={`${d} opens`} disabled={closed} value={o} onChange={(e) => setHour(d, 0, e.target.value)} className={`${inputCls} !w-32`} />
                  <input type="time" aria-label={`${d} closes`} disabled={closed} value={c} onChange={(e) => setHour(d, 1, e.target.value)} className={`${inputCls} !w-32`} />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={closed} onChange={(e) => set('hours', { ...hours, [d]: e.target.checked ? '' : '08:00-18:00' })} className="h-4 w-4 accent-[#2f524d]" /> Closed</label></div>; })}
            </div>
          )}
        </Card>
      ))}
      <div className="sticky bottom-0 flex gap-3 border-t border-black/10 bg-cream py-4"><Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</Btn><a href="/" target="_blank" rel="noopener"><Btn variant="ghost">Preview on site ↗</Btn></a></div>
    </form>
  );
}

export function Messages() {
  const toast = useToast();
  const meta = useMeta();
  const [q, setQ] = useState(''), [unread, setUnread] = useState(false), [sel, setSel] = useState([]), [open, setOpen] = useState(null);
  const { data, reload } = useAsync(() => api(`/admin/messages?${new URLSearchParams({ q, ...(unread ? { unread: '1' } : {}) })}`), [q, unread]);
  const rows = data?.items || [];
  const bulk = async (action, ids = sel) => {
    if (!ids.length) return; if (action === 'delete' && !confirmBox('Permanently delete the selected message(s)?')) return;
    await api('/admin/messages/bulk', { method: 'POST', body: { action, ids } }); setSel([]); setOpen(null); reload(); meta.refresh();
  };
  const show = async (m) => { setOpen(m); if (!m.is_read) { await api('/admin/messages/bulk', { method: 'POST', body: { action: 'read', ids: [m.id] } }); reload(); meta.refresh(); } };
  void toast;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2"><input type="search" placeholder="Search messages…" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} !w-60`} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={unread} onChange={(e) => setUnread(e.target.checked)} className="accent-[#2f524d]" /> Unread only</label>
          <a href="/api/admin/messages/export" className="ml-auto"><Btn variant="ghost" size="sm">Export CSV</Btn></a></div>
        {sel.length > 0 && <div className="mb-3 flex gap-2 rounded-xl bg-wine p-2.5 text-cream"><span className="px-2"><b>{sel.length}</b> selected</span><Btn size="sm" variant="light" onClick={() => bulk('read')}>Mark read</Btn><Btn size="sm" variant="light" onClick={() => bulk('unread')}>Mark unread</Btn><Btn size="sm" variant="light" onClick={() => bulk('delete')}>Delete</Btn></div>}
        <ul className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          {rows.map((m) => (
            <li key={m.id} className={`flex items-start gap-3 border-b border-black/10 p-3 last:border-0 ${m.is_read ? '' : 'bg-wine/5 font-semibold'} ${open?.id === m.id ? 'outline outline-2 -outline-offset-2 outline-wine' : ''}`}>
              <input type="checkbox" aria-label={`Select ${m.name}`} checked={sel.includes(m.id)} onChange={(e) => setSel(e.target.checked ? [...sel, m.id] : sel.filter((x) => x !== m.id))} className="mt-1.5 h-4 w-4 accent-[#2f524d]" />
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => show(m)}><span className="block truncate">{m.name} <span className="font-normal opacity-60">· {m.email}</span></span><span className="block truncate text-sm font-normal opacity-70">{m.subject || m.message}</span><span className="text-xs font-normal opacity-50">{m.created_at}</span></button>
            </li>))}
          {!rows.length && <li className="p-8 text-center opacity-60">No messages.</li>}
        </ul>
      </div>
      <div>{open ? (
        <Card className="sticky top-4"><dl className="mb-4 grid gap-1 text-sm"><div><b>From:</b> {open.name} &lt;{open.email}&gt;</div>{open.phone && <div><b>Phone:</b> {open.phone}</div>}<div><b>Subject:</b> {open.subject || '—'}</div><div><b>Received:</b> {open.created_at}</div></dl>
          <p className="whitespace-pre-wrap rounded-xl bg-cream p-4">{open.message}</p>
          <div className="mt-4 flex flex-wrap gap-2"><a href={`mailto:${open.email}?subject=${encodeURIComponent('Re: ' + (open.subject || 'Your message'))}`}><Btn>Reply by email</Btn></a><Btn variant="ghost" onClick={() => bulk('unread', [open.id])}>Mark unread</Btn><Btn variant="danger" onClick={() => bulk('delete', [open.id])}>Delete</Btn></div></Card>
      ) : <Card className="opacity-60">Select a message to read it.</Card>}</div>
    </div>
  );
}

export function Media() {
  const toast = useToast();
  const { data, reload } = useAsync(() => api('/admin/media'), []);
  const [sel, setSel] = useState([]);
  const upload = async (files) => {
    try { const r = await uploadFiles(files); const ok = r.filter((x) => x.ok).length; if (ok) toast(`${ok} uploaded`); r.filter((x) => !x.ok).forEach((x) => toast(`${x.name}: ${x.error}`, 'err')); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  const del = async () => { if (!confirmBox('Permanently delete the selected unused files?')) return; const r = await api('/admin/media/delete', { method: 'POST', body: { ids: sel } }); toast(r.deleted ? `${r.deleted} deleted` : 'Nothing deleted: files in use are locked.', r.deleted ? 'ok' : 'err'); setSel([]); reload(); };
  return (
    <>
      <Card className="mb-5"><p className="mb-3 opacity-70">Every uploaded image appears here. Files in use on the site are locked; unused files can be deleted.</p>
        <label className="inline-block cursor-pointer rounded-2xl border-2 border-dashed border-wine/30 px-6 py-5 hover:border-wine">Drop or click to upload images<input type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} /></label></Card>
      {sel.length > 0 && <div className="mb-3"><Btn variant="danger" onClick={del}>Delete {sel.length} selected</Btn></div>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {(data?.items || []).map((m) => (
          <li key={m.id}><label className="relative block"><input type="checkbox" disabled={m.used} aria-label="Select image" checked={sel.includes(m.id)} onChange={(e) => setSel(e.target.checked ? [...sel, m.id] : sel.filter((x) => x !== m.id))} className="absolute left-2 top-2 z-10 h-4 w-4 accent-[#2f524d]" />
            <img src={thumb(m.path)} alt="" loading="lazy" className={`aspect-square w-full rounded-xl object-cover ${sel.includes(m.id) ? 'ring-4 ring-wine' : ''}`} /></label>
            <small className="opacity-60">{m.used ? 'In use' : 'Unused'}</small></li>))}
      </ul>
    </>
  );
}

export function Trash() {
  const toast = useToast();
  const { data, reload } = useAsync(() => api('/admin/trash'), []);
  const [sel, setSel] = useState({});
  const act = async (key, action) => {
    const ids = sel[key] || []; if (!ids.length) return;
    if (action === 'purge' && !confirmBox('Permanently delete? This cannot be undone.')) return;
    try { await api(`/admin/trash/${action}`, { method: 'POST', body: { res: key, ids } }); toast(action === 'restore' ? 'Restored.' : 'Permanently deleted.'); setSel({}); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  if (!data) return <p>Loading…</p>;
  if (!data.groups.length) return <Card className="opacity-70">The Trash is empty. Deleted items appear here and can be restored.</Card>;
  return data.groups.map((g) => (
    <Card key={g.key} className="mb-5"><h2 className="font-display mb-3 text-2xl">{g.label}</h2>
      <ul>{g.rows.map((r) => <li key={r.id} className="flex items-center gap-3 border-b border-black/10 py-2.5 last:border-0"><input type="checkbox" aria-label={`Select ${r.title}`} checked={(sel[g.key] || []).includes(r.id)} onChange={(e) => setSel({ ...sel, [g.key]: e.target.checked ? [...(sel[g.key] || []), r.id] : (sel[g.key] || []).filter((x) => x !== r.id) })} className="h-4 w-4 accent-[#2f524d]" /><span className="flex-1">{r.title || '(untitled)'}</span><small className="opacity-60">{r.deleted_at}</small></li>)}</ul>
      <div className="mt-3 flex gap-2"><Btn size="sm" onClick={() => act(g.key, 'restore')}>Restore</Btn><Btn size="sm" variant="danger" onClick={() => act(g.key, 'purge')}>Delete permanently</Btn></div></Card>
  ));
}

export function Activity() {
  const { data } = useAsync(() => api('/admin/activity'), []);
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white"><table className="w-full text-left text-sm"><thead className="bg-dim text-xs uppercase text-black/60"><tr><th className="p-3">When</th><th>Who</th><th>Action</th><th>What</th></tr></thead>
      <tbody>{(data?.items || []).map((r) => <tr key={r.id} className="border-t border-black/10"><td className="p-3">{r.created_at}</td><td>{r.user_name}</td><td>{r.action}</td><td>{r.entity}{r.entity_id ? ` #${r.entity_id}` : ''}</td></tr>)}</tbody></table></div>
  );
}

export function Account() {
  const toast = useToast();
  const [v, setV] = useState({ current: '', next: '' });
  const save = async (e) => { e.preventDefault(); try { await api('/auth/password', { method: 'POST', body: v }); toast('Password updated.'); setV({ current: '', next: '' }); } catch (err) { toast(err.message, 'err'); } };
  return (
    <form onSubmit={save} className="max-w-md"><Card className="grid gap-4"><h2 className="font-display text-2xl">Change password</h2>
      <div><label htmlFor="cur" className="mb-1 block text-sm font-semibold">Current password</label><input id="cur" type="password" autoComplete="current-password" className={inputCls} value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} /></div>
      <div><label htmlFor="new" className="mb-1 block text-sm font-semibold">New password (min 10 characters)</label><input id="new" type="password" autoComplete="new-password" className={inputCls} value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} /></div>
      <Btn type="submit">Update password</Btn></Card></form>
  );
}
