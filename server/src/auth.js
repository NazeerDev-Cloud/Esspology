import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { get, run, insert, update, now, DATA_DIR } from './db.js';

// Signing secret persisted in the data folder so sessions survive restarts.
const secretFile = path.join(DATA_DIR, '.secret');
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'));
const SECRET = process.env.JWT_SECRET || fs.readFileSync(secretFile, 'utf8');
const COOKIE = 'esp_token';
const IDLE = 2 * 60 * 60;           // 2 hours idle timeout (token is re-issued on every request)
const MAX_ATTEMPTS = 5, LOCK_MS = 15 * 60 * 1000;

const cookieOpts = (req) => ({ httpOnly: true, sameSite: 'lax', secure: req.secure || req.headers['x-forwarded-proto'] === 'https', path: '/', maxAge: IDLE * 1000 });
const ip = (req) => req.ip || req.socket.remoteAddress || '0';

/** Attaches req.user when a valid session cookie is present and slides the idle timer. */
export function session(req, res, next) {
  const t = req.cookies?.[COOKIE];
  if (t) {
    try {
      const { uid } = jwt.verify(t, SECRET);
      const u = get('SELECT id, name, email, role FROM users WHERE id = ? AND deleted_at IS NULL', uid);
      if (u) { req.user = u; res.cookie(COOKIE, jwt.sign({ uid }, SECRET, { expiresIn: IDLE }), cookieOpts(req)); }
    } catch { /* expired/invalid -> anonymous */ }
  }
  next();
}

export const requireAuth = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Please sign in.' }));
export const requireSuper = (req, res, next) => (req.user?.role === 'super' ? next() : res.status(403).json({ error: 'Super Admin only.' }));

/** CSRF defence for cookie auth: SameSite=Lax cookie + mandatory custom header + same-origin check on writes. */
export function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.headers['x-requested-with'] !== 'esspology') return res.status(403).json({ error: 'Bad request origin.' });
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Cross-origin request blocked.' });
  next();
}

export function log(req, action, entity, entityId = null) {
  try { insert('activity', { user_id: req.user?.id ?? null, user_name: req.user?.name ?? 'system', action, entity, entity_id: entityId, created_at: now() }); } catch { /* ignore */ }
}

export const passwordProblem = (pw) => (typeof pw !== 'string' || pw.length < 10 ? 'Password must be at least 10 characters.' : null);

export const authRouter = Router();

authRouter.get('/me', (req, res) => res.json({ user: req.user ?? null }));

authRouter.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const since = Date.now() - LOCK_MS;
  const fails = get('SELECT COUNT(*) AS n FROM login_attempts WHERE at > ? AND (ip = ? OR email = ?)', since, ip(req), email).n;
  if (fails >= MAX_ATTEMPTS) return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });

  const u = get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', email);
  const hash = u?.password_hash || '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
  const ok = bcrypt.compareSync(password, hash) && u;       // always compare: constant-ish timing
  if (!ok) {
    run('INSERT INTO login_attempts (ip, email, at) VALUES (?, ?, ?)', ip(req), email, Date.now());
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  run('DELETE FROM login_attempts WHERE ip = ? OR email = ?', ip(req), email);
  update('users', u.id, { last_login: now() });
  res.cookie(COOKIE, jwt.sign({ uid: u.id }, SECRET, { expiresIn: IDLE }), cookieOpts(req));
  req.user = u; log(req, 'login', 'user', u.id);
  res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});

authRouter.post('/logout', (req, res) => { res.clearCookie(COOKIE, { path: '/' }); res.json({ ok: true }); });

authRouter.post('/password', requireAuth, (req, res) => {
  const u = get('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!bcrypt.compareSync(String(req.body?.current || ''), u.password_hash)) return res.status(400).json({ error: 'Current password is wrong.' });
  const problem = passwordProblem(req.body?.next);
  if (problem) return res.status(400).json({ error: problem });
  update('users', u.id, { password_hash: bcrypt.hashSync(req.body.next, 10) });
  log(req, 'password', 'user', u.id);
  res.json({ ok: true });
});
