import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { all, get, insert, val, now } from './db.js';

export const publicRouter = Router();
const parse = (s, d) => { try { return JSON.parse(s) ?? d; } catch { return d; } };
const PRIVATE_SETTINGS = new Set(['notify_email']);

export function settingsMap() {
  const o = {};
  for (const r of all('SELECT k, v FROM settings')) o[r.k] = r.v;
  return o;
}

export function siteData() {
  const settings = settingsMap();
  for (const k of PRIVATE_SETTINGS) delete settings[k];
  settings.hours = parse(settings.hours, {});
  const mobile = parse(settings.mobile_home, {});
  delete settings.mobile_home;

  const pages = all('SELECT id, title, slug, seo_title, seo_description, og_image FROM pages WHERE is_visible = 1 AND deleted_at IS NULL');
  const pageById = Object.fromEntries(pages.map((p) => [p.id, p]));
  for (const p of pages) {
    p.sections = all('SELECT id, type, data, bg, hide_mobile, hide_desktop FROM sections WHERE page_id = ? AND is_visible = 1 ORDER BY sort_order, id', p.id)
      .map((s) => ({ ...s, hide_mobile: !!s.hide_mobile, hide_desktop: !!s.hide_desktop, data: parse(s.data, {}) }));
  }
  const nav = (location) => all('SELECT * FROM nav_links WHERE location = ? AND is_visible = 1 ORDER BY sort_order, id', location)
    .filter((l) => !l.page_id || pageById[l.page_id])
    .map((l) => ({ id: l.id, label: l.label, new_tab: !!l.new_tab, href: l.page_id ? (pageById[l.page_id].slug === 'home' ? '/' : '/' + pageById[l.page_id].slug) : l.url }));

  const categories = all('SELECT id, name, slug, description, image FROM categories WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY sort_order, id');
  const catIds = new Set(categories.map((c) => c.id));
  const items = all('SELECT * FROM items WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY sort_order, id')
    .filter((i) => catIds.has(i.category_id))
    .map((i) => ({ id: i.id, category_id: i.category_id, name: i.name, slug: i.slug, short_desc: i.short_desc, description: i.description, price: i.price, sale_price: i.sale_price,
      image: i.image, tags: parse(i.tags, []), variants: parse(i.variants, []), temps: parse(i.temps, []), images: parse(i.images, []), is_featured: !!i.is_featured, is_available: !!i.is_available }));

  return {
    settings, mobile, pages, nav: { header: nav('header'), footer: nav('footer') }, categories, items,
    testimonials: all('SELECT id, name, text, rating, photo FROM testimonials WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY sort_order, id'),
    gallery: all('SELECT id, path, caption, alt FROM gallery WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY sort_order, id'),
    team: all('SELECT id, name, role, photo, bio FROM team WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY sort_order, id'),
  };
}

publicRouter.get('/site', (req, res) => { res.set('Cache-Control', 'no-cache'); res.json(siteData()); });

const contactLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 3, standardHeaders: true, legacyHeaders: false, message: { error: 'You have sent several messages recently. Please wait a few minutes.' } });

publicRouter.post('/contact', contactLimiter, async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true });                       // honeypot: pretend success to bots
  const clip = (v, n) => String(v ?? '').trim().slice(0, n);
  const name = clip(b.name, 120), email = clip(b.email, 190), phone = clip(b.phone, 40), subject = clip(b.subject, 190), message = clip(b.message, 5000);
  const errors = {};
  if (!name) errors.name = 'Please tell us your name.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.length < 5) errors.message = 'Please write a short message.';
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  insert('messages', { name, email, phone, subject, message, ip: req.ip, created_at: now() });
  // Optional email notification when SMTP_* env vars are configured.
  if (process.env.SMTP_HOST) {
    try {
      const to = settingsMap().notify_email || process.env.MAIL_FROM;
      const tx = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 465), secure: +(process.env.SMTP_PORT || 465) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await tx.sendMail({ from: process.env.MAIL_FROM, to, replyTo: email, subject: `New message from ${name}${subject ? ': ' + subject : ''}`, text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}` });
    } catch (e) { console.error('mail failed:', e.message); }
  }
  res.json({ ok: true });
});

publicRouter.get('/health', (req, res) => res.json({ ok: true, pages: val('SELECT COUNT(*) FROM pages'), time: get("SELECT datetime('now') AS t").t }));
