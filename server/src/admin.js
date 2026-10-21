// Admin API: generic CRUD driven by resources.js, section builder, settings, messages, media, trash, activity.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { all, get, run, val, insert, update, now, ident } from './db.js';
import { RESOURCES, SECTION_TYPES, BACKGROUNDS, SETTINGS_GROUPS, MOBILE_BLOCKS, MOBILE_ORDER } from './resources.js';
import { requireAuth, requireSuper, log, passwordProblem } from './auth.js';
import { saveImage, deleteImage } from './images.js';

export const adminRouter = Router();
adminRouter.use(requireAuth);

const parse = (s, d) => { try { return JSON.parse(s) ?? d; } catch { return d; } };
const IMG = /^uploads\/[\w./-]+\.webp$/;
const JSON_COLS = new Set(['tags', 'variants', 'temps', 'images']);
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item-' + Math.random().toString(36).slice(2, 7);
const uniqueSlug = (table, slug, id = 0) => { let s = slug, i = 2; while (val(`SELECT COUNT(*) FROM ${ident(table)} WHERE slug = ? AND id <> ?`, s, id)) s = `${slug}-${i++}`; return s; };
const ids = (v) => [...new Set((Array.isArray(v) ? v : []).map(Number).filter(Number.isInteger))];
const marks = (a) => a.map(() => '?').join(',');
const cleanImage = (v) => (typeof v === 'string' && IMG.test(v) && !v.includes('..') ? v : '');
const RESERVED = new Set(['admin', 'api', 'uploads', 'menu', 'home', 'gallery', 'contact', 'about', 'assets', 'sitemap']);

// ---- Field coercion (server never trusts the client) -------------------------------------
function coerce(f, v) {
  switch (f.kind) {
    case 'bool': return v ? 1 : 0;
    case 'number': return Math.max(f.min ?? 0, Math.min(f.max ?? 100000, Math.round(Number(v) || 0)));
    case 'price': if ((v === '' || v == null) && f.nullable) return null; return Math.max(0, Math.round((Number(String(v).replace(',', '.')) || 0) * 100) / 100);
    case 'image': return cleanImage(v);
    case 'select': {
      if ((v === '' || v == null) && f.nullable) return null;
      return f.int ? Number(v) || null : String(v);
    }
    case 'tags': return JSON.stringify([...new Set((Array.isArray(v) ? v : []).map((t) => String(t).trim().slice(0, 24)).filter(Boolean))]);
    case 'repeater': {
      const rows = (Array.isArray(v) ? v : []).map((r) => Object.fromEntries(f.fields.map((sf) => [sf.name, coerceLoose(sf, r?.[sf.name])])))
        .filter((r) => Object.values(r).some((x) => x !== '' && x != null));
      return rows;
    }
    case 'textarea': return String(v ?? '').trim().slice(0, 6000);
    default: return String(v ?? '').trim().slice(0, 255);
  }
}
// Section data keeps JSON natively (not stringified) so nested repeaters work.
function coerceLoose(f, v) { const r = coerce(f, v); return f.kind === 'tags' ? JSON.parse(r) : r; }

// ---- Meta for the UI -------------------------------------------------------------------
adminRouter.get('/meta', (req, res) => {
  const resources = Object.entries(RESOURCES)
    .filter(([, r]) => !r.superOnly || req.user.role === 'super')
    .map(([key, r]) => ({ key, label: r.label, singular: r.singular, title: r.title, sortable: !!r.sortable, soft: !!r.soft, visible: r.visible || null, columns: r.columns, fields: r.fields, filter: r.filter || null, multiUpload: !!r.multiUpload, protect: r.protect || null }));
  res.json({
    resources, sectionTypes: SECTION_TYPES, backgrounds: BACKGROUNDS, settingsGroups: SETTINGS_GROUPS,
    options: {
      categories: all('SELECT id, name FROM categories WHERE deleted_at IS NULL ORDER BY sort_order').map((c) => ({ value: c.id, label: c.name })),
      pages: all('SELECT id, title FROM pages WHERE deleted_at IS NULL ORDER BY is_system DESC, title').map((p) => ({ value: p.id, label: p.title })),
    },
    unread: val('SELECT COUNT(*) FROM messages WHERE is_read = 0'),
  });
});

adminRouter.get('/dashboard', (req, res) => res.json({
  counts: { 'Menu items': val('SELECT COUNT(*) FROM items WHERE deleted_at IS NULL'), Categories: val('SELECT COUNT(*) FROM categories WHERE deleted_at IS NULL'), Pages: val('SELECT COUNT(*) FROM pages WHERE deleted_at IS NULL'), 'Unread messages': val('SELECT COUNT(*) FROM messages WHERE is_read = 0') },
  recent: all('SELECT id, name, email, subject, is_read, created_at FROM messages ORDER BY id DESC LIMIT 6'),
}));

// ---- Upload & media ----------------------------------------------------------------------
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 30 } });

adminRouter.post('/upload', upload.array('file', 30), async (req, res) => {
  const out = [];
  for (const f of req.files || []) {
    try {
      const r = await saveImage(f.buffer);
      insert('media', { path: r.path, mime: 'image/webp', size: r.size, created_at: now() });
      out.push({ ok: true, path: r.path, name: f.originalname });
    } catch (e) { out.push({ ok: false, error: e.message, name: f.originalname }); }
  }
  if (!out.length) return res.status(400).json({ error: 'No file received.' });
  log(req, 'upload', 'media');
  res.json({ files: out });
});

const mediaUsed = (p) => {
  const checks = [['categories', 'image'], ['items', 'image'], ['testimonials', 'photo'], ['gallery', 'path'], ['team', 'photo'], ['pages', 'og_image']];
  if (checks.some(([t, c]) => val(`SELECT COUNT(*) FROM ${t} WHERE ${c} = ?`, p))) return true;
  const like = `%${p}%`;
  return !!(val('SELECT COUNT(*) FROM settings WHERE v = ?', p) || val('SELECT COUNT(*) FROM sections WHERE data LIKE ?', like.replace(/\//g, '\\/')) || val('SELECT COUNT(*) FROM sections WHERE data LIKE ?', like) || val('SELECT COUNT(*) FROM items WHERE images LIKE ?', like));
};
adminRouter.get('/media', (req, res) => res.json({ items: all('SELECT * FROM media ORDER BY id DESC LIMIT 400').map((m) => ({ ...m, used: mediaUsed(m.path) })) }));
adminRouter.post('/media/delete', (req, res) => {
  let n = 0;
  for (const id of ids(req.body?.ids)) {
    const m = get('SELECT * FROM media WHERE id = ?', id);
    if (!m || mediaUsed(m.path)) continue;
    deleteImage(m.path); run('DELETE FROM media WHERE id = ?', id); n++;
  }
  log(req, 'delete', 'media');
  res.json({ deleted: n });
});

// ---- Sections (page builder) --------------------------------------------------------------
adminRouter.get('/pages/:id/sections', (req, res) => {
  const page = get('SELECT * FROM pages WHERE id = ? AND deleted_at IS NULL', +req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  res.json({ page, sections: all('SELECT * FROM sections WHERE page_id = ? ORDER BY sort_order, id', page.id).map((s) => ({ ...s, data: parse(s.data, {}) })) });
});
adminRouter.post('/pages/:id/sections', (req, res) => {
  const page = get('SELECT id FROM pages WHERE id = ?', +req.params.id);
  const type = req.body?.type;
  if (!page || !SECTION_TYPES[type]) return res.status(400).json({ error: 'Choose a section type.' });
  const id = insert('sections', { page_id: page.id, type, data: '{}', bg: type === 'cta_banner' ? 'wine' : 'cream', sort_order: val('SELECT COALESCE(MAX(sort_order),0)+1 FROM sections WHERE page_id = ?', page.id) });
  log(req, 'create', 'section', id);
  res.json({ id });
});
adminRouter.post('/sections/reorder', (req, res) => {
  ids(req.body?.ids).forEach((id, i) => run('UPDATE sections SET sort_order = ? WHERE id = ?', i + 1, id));
  log(req, 'reorder', 'section'); res.json({ ok: true });
});
adminRouter.put('/sections/:id', (req, res) => {
  const s = get('SELECT * FROM sections WHERE id = ?', +req.params.id);
  if (!s) return res.status(404).json({ error: 'Section not found.' });
  const def = SECTION_TYPES[s.type], b = req.body || {}, patch = {};
  if ('data' in b) patch.data = JSON.stringify(Object.fromEntries(def.fields.map((f) => [f.name, coerceLoose(f, b.data?.[f.name])])));
  if ('bg' in b) patch.bg = BACKGROUNDS[b.bg] ? b.bg : 'cream';
  if ('is_visible' in b) patch.is_visible = b.is_visible ? 1 : 0;
  if ('hide_mobile' in b) patch.hide_mobile = b.hide_mobile ? 1 : 0;
  if ('hide_desktop' in b) patch.hide_desktop = b.hide_desktop ? 1 : 0;
  update('sections', s.id, patch); log(req, 'update', 'section', s.id);
  res.json({ ok: true });
});
adminRouter.delete('/sections/:id', (req, res) => { run('DELETE FROM sections WHERE id = ?', +req.params.id); log(req, 'delete', 'section', +req.params.id); res.json({ ok: true }); });

// ---- Mobile home (phone-only layout): order, visibility and per-block text/photos -----------------
const readMobile = () => {
  const m = parse(val("SELECT v FROM settings WHERE k = 'mobile_home'") || '{}', {});
  const order = [...(Array.isArray(m.order) ? m.order.filter((k) => MOBILE_BLOCKS[k]) : [])];
  for (const k of MOBILE_ORDER) if (!order.includes(k)) order.push(k);
  return { order, hidden: (Array.isArray(m.hidden) ? m.hidden : []).filter((k) => MOBILE_BLOCKS[k]), data: m.data && typeof m.data === 'object' ? m.data : {} };
};
adminRouter.get('/mobile', (req, res) => {
  res.json({ ...readMobile(), blocks: Object.fromEntries(Object.entries(MOBILE_BLOCKS).map(([k, b]) => [k, { label: b.label, note: b.note || '', fields: b.fields }])) });
});
adminRouter.put('/mobile', (req, res) => {
  const b = req.body || {};
  const order = [...new Set((Array.isArray(b.order) ? b.order : []).filter((k) => MOBILE_BLOCKS[k]))];
  for (const k of MOBILE_ORDER) if (!order.includes(k)) order.push(k);
  const hidden = [...new Set((Array.isArray(b.hidden) ? b.hidden : []).filter((k) => MOBILE_BLOCKS[k]))];
  const data = {};
  for (const [k, def] of Object.entries(MOBILE_BLOCKS)) {
    if (!def.fields.length) continue;
    const raw = b.data?.[k] || {};
    data[k] = Object.fromEntries(def.fields.map((f) => [f.name, coerceLoose(f, raw[f.name])]));
  }
  const json = JSON.stringify({ order, hidden, data });
  run("INSERT INTO settings (k, v) VALUES ('mobile_home', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", json);
  log(req, 'update', 'mobile home'); res.json({ ok: true });
});

// ---- Settings ---------------------------------------------------------------------------------
adminRouter.get('/settings', requireSuper, (req, res) => {
  const o = {}; for (const r of all('SELECT k, v FROM settings')) o[r.k] = r.v;
  res.json({ values: { ...o, hours: parse(o.hours, {}) } });
});
adminRouter.put('/settings', requireSuper, (req, res) => {
  const b = req.body || {};
  const set = (k, v) => run('INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', k, v);
  for (const fields of Object.values(SETTINGS_GROUPS)) {
    for (const [key, , kind] of fields) {
      let v = b[key];
      if (kind === 'bool') v = v && v !== '0' ? '1' : '0';
      else if (kind === 'image') v = cleanImage(v);
      else if (key === 'map_embed') { const m = String(v || '').match(/src=["']([^"']+)["']/i); const u = (m ? m[1] : String(v || '')).trim(); v = /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(u) ? u : ''; }
      else if (key === 'whatsapp') v = String(v || '').replace(/\D+/g, '');
      else v = String(v ?? '').trim().slice(0, kind === 'textarea' ? 1000 : 255);
      set(key, v);
    }
  }
  const hours = {};
  for (const d of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    const h = String(b.hours?.[d] || '');
    hours[d] = /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(h) ? h : '';
  }
  set('hours', JSON.stringify(hours));
  log(req, 'update', 'settings'); res.json({ ok: true });
});

// ---- Messages ---------------------------------------------------------------------------------
adminRouter.get('/messages', (req, res) => {
  const q = `%${req.query.q || ''}%`, unread = req.query.unread === '1';
  res.json({ items: all(`SELECT * FROM messages WHERE (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?) ${unread ? 'AND is_read = 0' : ''} ORDER BY id DESC LIMIT 300`, q, q, q, q) });
});
adminRouter.get('/messages/export', (req, res) => {
  const safe = (v) => { v = String(v ?? ''); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return `"${v.replace(/"/g, '""')}"`; };
  const rows = all('SELECT * FROM messages ORDER BY id DESC');
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="esspology-messages-${new Date().toISOString().slice(0, 10)}.csv"` });
  res.send('﻿' + ['ID,Date,Name,Email,Phone,Subject,Message,Read', ...rows.map((m) => [m.id, m.created_at, m.name, m.email, m.phone, m.subject, m.message, m.is_read ? 'yes' : 'no'].map(safe).join(','))].join('\r\n'));
});
adminRouter.post('/messages/bulk', (req, res) => {
  const list = ids(req.body?.ids), a = req.body?.action;
  if (list.length) {
    if (a === 'delete') run(`DELETE FROM messages WHERE id IN (${marks(list)})`, ...list);
    else if (a === 'read' || a === 'unread') run(`UPDATE messages SET is_read = ? WHERE id IN (${marks(list)})`, a === 'read' ? 1 : 0, ...list);
    log(req, a, 'message');
  }
  res.json({ ok: true });
});

// ---- Trash & activity -----------------------------------------------------------------------------
const trashable = (user) => Object.entries(RESOURCES).filter(([, r]) => r.soft && (!r.superOnly || user.role === 'super'));
adminRouter.get('/trash', (req, res) => res.json({ groups: trashable(req.user).map(([key, r]) => ({ key, label: r.label, rows: all(`SELECT id, ${ident(r.title)} AS title, deleted_at FROM ${r.table} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`) })).filter((g) => g.rows.length) }));
adminRouter.post('/trash/:action', (req, res) => {
  if (!['restore', 'purge'].includes(req.params.action)) return res.status(404).json({ error: 'Not found.' });
  const def = trashable(req.user).find(([k]) => k === req.body?.res)?.[1];
  const list = ids(req.body?.ids);
  if (!def || !list.length) return res.status(400).json({ error: 'Nothing selected.' });
  try {
    if (req.params.action === 'restore') run(`UPDATE ${def.table} SET deleted_at = NULL WHERE id IN (${marks(list)})`, ...list);
    else run(`DELETE FROM ${def.table} WHERE deleted_at IS NOT NULL AND id IN (${marks(list)})`, ...list);
  } catch { return res.status(409).json({ error: 'Cannot delete permanently: other records still depend on it.' }); }
  log(req, req.params.action, req.body.res); res.json({ ok: true });
});
adminRouter.get('/activity', requireSuper, (req, res) => res.json({ items: all('SELECT * FROM activity ORDER BY id DESC LIMIT 200') }));

// ---- Generic resource CRUD ---------------------------------------------------------------------------
function resource(req, res, next) {
  const def = RESOURCES[req.params.res];
  if (!def) return res.status(404).json({ error: 'Unknown resource.' });
  if (def.superOnly && req.user.role !== 'super') return res.status(403).json({ error: 'Super Admin only.' });
  req.def = def; next();
}
const shape = (def, r) => {
  const o = { ...r };
  for (const c of JSON_COLS) if (c in o) o[c] = parse(o[c], []);
  if (def.preview) o._preview = def.preview(r);
  delete o.password_hash;
  return o;
};

adminRouter.get('/:res', resource, (req, res) => {
  const { def } = req;
  const where = [def.soft ? 't.deleted_at IS NULL' : '1=1'], params = [];
  const q = String(req.query.q || '').trim();
  if (q) { where.push(`(t.${ident(def.title)} LIKE ?)`); params.push(`%${q}%`); }
  if (req.query.f && def.filter) { where.push(`t.${ident(def.filter.column)} = ?`); params.push(req.query.f); }
  const join = def.table === 'items' ? ', c.name AS category_name' : '';
  const from = def.table === 'items' ? 'items t LEFT JOIN categories c ON c.id = t.category_id' : `${def.table} t`;
  const order = def.sortable ? (def.table === 'nav_links' ? 't.location, t.sort_order, t.id' : 't.sort_order, t.id') : 't.id DESC';
  const rows = all(`SELECT t.*${join} FROM ${from} WHERE ${where.join(' AND ')} ORDER BY ${order}`, ...params);
  res.json({ items: rows.map((r) => shape(def, r)) });
});
adminRouter.get('/:res/:id', resource, (req, res) => {
  const r = get(`SELECT * FROM ${req.def.table} WHERE id = ?`, +req.params.id);
  r ? res.json({ item: shape(req.def, r) }) : res.status(404).json({ error: 'Not found.' });
});

function collect(def, body, existing) {
  const data = {};
  for (const f of def.fields) {
    if (f.virtual) continue;
    if (f.kind === 'slug') {
      if (existing && f.lockSystem && existing.is_system) { data[f.name] = existing[f.name]; continue; }
      data[f.name] = uniqueSlug(def.table, slugify(body[f.name] || body[f.from] || ''), existing?.id || 0);
      continue;
    }
    let v = coerce(f, body[f.name]);
    if (f.kind === 'repeater') v = JSON.stringify(v);
    if (f.required && (v === '' || v == null || v === 0 && f.kind === 'select')) throw new Error(`${f.label} is required.`);
    data[f.name] = v;
  }
  return data;
}

function save(req, res, existing) {
  const { def } = req;
  let data;
  try { data = collect(def, req.body || {}, existing); } catch (e) { return res.status(422).json({ error: e.message }); }

  if (def.table === 'pages' && !existing?.is_system && RESERVED.has(data.slug)) return res.status(422).json({ error: 'That URL is reserved for a built-in page.' });
  if (def.table === 'items' && data.sale_price != null && data.sale_price >= data.price) data.sale_price = null;
  if (def.table === 'users') {
    data.email = data.email.toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return res.status(422).json({ error: 'Please enter a valid email.' });
    if (val('SELECT COUNT(*) FROM users WHERE email = ? AND id <> ?', data.email, existing?.id || 0)) return res.status(422).json({ error: 'That email is already in use.' });
    const pw = String(req.body.password || '');
    if (!existing && !pw) return res.status(422).json({ error: 'A password is required for new users.' });
    if (pw) { const p = passwordProblem(pw); if (p) return res.status(422).json({ error: p }); data.password_hash = bcrypt.hashSync(pw, 10); }
    if (existing?.role === 'super' && data.role !== 'super' && val("SELECT COUNT(*) FROM users WHERE role = 'super' AND deleted_at IS NULL") <= 1) return res.status(422).json({ error: 'There must always be at least one Super Admin.' });
  }
  let id;
  if (existing) { update(def.table, existing.id, data); id = existing.id; }
  else {
    if (def.sortable) data.sort_order = val(`SELECT COALESCE(MAX(sort_order),0)+1 FROM ${def.table}`);
    id = insert(def.table, data);
    if (def.table === 'pages' && req.body.add_to_menu) {
      insert('nav_links', { location: 'header', label: data.title, url: '/' + data.slug, page_id: id, sort_order: val("SELECT COALESCE(MAX(sort_order),0)+1 FROM nav_links WHERE location = 'header'") });
    }
  }
  log(req, existing ? 'update' : 'create', req.params.res, id);
  res.json({ id });
}
adminRouter.post('/:res/reorder', resource, (req, res) => {
  if (!req.def.sortable) return res.status(400).json({ error: 'Not sortable.' });
  ids(req.body?.ids).forEach((id, i) => run(`UPDATE ${req.def.table} SET sort_order = ? WHERE id = ?`, i + 1, id));
  log(req, 'reorder', req.params.res); res.json({ ok: true });
});
adminRouter.post('/:res/bulk', resource, (req, res) => {
  const { def } = req, list = ids(req.body?.ids), a = req.body?.action;
  if (!list.length) return res.status(400).json({ error: 'Nothing selected.' });
  if (a === 'delete') {
    if (def.protect && list.some((id) => get(`SELECT ${def.protect} AS p FROM ${def.table} WHERE id = ?`, id)?.p)) return res.status(409).json({ error: 'Built-in pages cannot be deleted. You can hide them instead.' });
    if (def.table === 'users') {
      if (list.includes(req.user.id)) return res.status(409).json({ error: 'You cannot delete your own account.' });
      const supers = val("SELECT COUNT(*) FROM users WHERE role='super' AND deleted_at IS NULL"), rem = val(`SELECT COUNT(*) FROM users WHERE role='super' AND deleted_at IS NULL AND id IN (${marks(list)})`, ...list);
      if (rem >= supers) return res.status(409).json({ error: 'There must always be at least one Super Admin.' });
    }
    if (def.soft) run(`UPDATE ${def.table} SET deleted_at = ? WHERE id IN (${marks(list)})`, now(), ...list);
    else run(`DELETE FROM ${def.table} WHERE id IN (${marks(list)})`, ...list);
  } else if (['show', 'hide', 'toggle'].includes(a) && def.visible) {
    const c = ident(def.visible);
    if (a === 'toggle') run(`UPDATE ${def.table} SET ${c} = 1 - ${c} WHERE id IN (${marks(list)})`, ...list);
    else run(`UPDATE ${def.table} SET ${c} = ? WHERE id IN (${marks(list)})`, a === 'show' ? 1 : 0, ...list);
  } else return res.status(400).json({ error: 'Unknown action.' });
  log(req, a, req.params.res, list.length === 1 ? list[0] : null);
  res.json({ ok: true });
});
adminRouter.post('/:res', resource, (req, res) => save(req, res, null));
adminRouter.put('/:res/:id', resource, (req, res) => {
  const existing = get(`SELECT * FROM ${req.def.table} WHERE id = ?`, +req.params.id);
  existing ? save(req, res, existing) : res.status(404).json({ error: 'Not found.' });
});
