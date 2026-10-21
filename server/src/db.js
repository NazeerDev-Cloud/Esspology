// SQLite (built into Node 22+) — one file database, no external server needed.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.DATA_DIR || path.join(here, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'esspology.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export const all = (sql, ...p) => db.prepare(sql).all(...p);
export const get = (sql, ...p) => db.prepare(sql).get(...p) ?? null;
export const run = (sql, ...p) => db.prepare(sql).run(...p);
export const val = (sql, ...p) => { const r = get(sql, ...p); return r ? Object.values(r)[0] : null; };
export const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const IDENT = /^[a-z_][a-z0-9_]*$/i;
export const ident = (s) => { if (!IDENT.test(s)) throw new Error('bad identifier ' + s); return s; };

export function insert(table, data) {
  const cols = Object.keys(data).map(ident);
  const r = run(`INSERT INTO ${ident(table)} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, ...Object.values(data));
  return Number(r.lastInsertRowid);
}
export function update(table, id, data) {
  const cols = Object.keys(data).map(ident);
  if (!cols.length) return;
  run(`UPDATE ${ident(table)} SET ${cols.map((c) => c + ' = ?').join(',')} WHERE id = ?`, ...Object.values(data), id);
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor', last_login TEXT, deleted_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY, ip TEXT, email TEXT, at INTEGER);
CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT DEFAULT '', image TEXT DEFAULT '', sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, deleted_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_desc TEXT DEFAULT '', description TEXT DEFAULT '', price REAL DEFAULT 0, sale_price REAL, image TEXT DEFAULT '', tags TEXT DEFAULT '[]', variants TEXT DEFAULT '[]', temps TEXT DEFAULT '[]', images TEXT DEFAULT '[]', is_featured INTEGER DEFAULT 0, is_available INTEGER DEFAULT 1, is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, deleted_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, seo_title TEXT DEFAULT '', seo_description TEXT DEFAULT '', og_image TEXT DEFAULT '', is_system INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS sections (id INTEGER PRIMARY KEY, page_id INTEGER NOT NULL, type TEXT NOT NULL, data TEXT DEFAULT '{}', bg TEXT DEFAULT 'cream', sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY, name TEXT NOT NULL, text TEXT NOT NULL, rating INTEGER DEFAULT 5, photo TEXT DEFAULT '', sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY, path TEXT NOT NULL, caption TEXT DEFAULT '', alt TEXT DEFAULT '', sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT '', photo TEXT DEFAULT '', bio TEXT DEFAULT '', sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS nav_links (id INTEGER PRIMARY KEY, location TEXT DEFAULT 'header', label TEXT NOT NULL, url TEXT DEFAULT '/', page_id INTEGER, new_tab INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, is_read INTEGER DEFAULT 0, ip TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY, path TEXT NOT NULL, mime TEXT, size INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY, user_id INTEGER, user_name TEXT, action TEXT, entity TEXT, entity_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
// Add columns introduced after the first release to existing databases.
try { db.exec("ALTER TABLE items ADD COLUMN temps TEXT DEFAULT '[]'"); } catch { /* already there */ }
// Per-section visibility by device (page builder: "Show on phones / on desktop").
try { db.exec('ALTER TABLE sections ADD COLUMN hide_mobile INTEGER DEFAULT 0'); } catch { /* already there */ }
try { db.exec('ALTER TABLE sections ADD COLUMN hide_desktop INTEGER DEFAULT 0'); } catch { /* already there */ }
