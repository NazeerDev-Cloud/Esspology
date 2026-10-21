// Image pipeline: decode with sharp (real format check, not the filename), resize to max 2000px,
// convert to WebP, and write a 600px thumbnail next to it as name-t.webp.
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(here, '..', 'uploads');
const ALLOWED = new Set(['jpeg', 'png', 'webp', 'gif']);        // svg intentionally not allowed

export async function saveImage(buffer) {
  let meta;
  try { meta = await sharp(buffer).metadata(); } catch { throw new Error('That file is not a valid image.'); }
  if (!ALLOWED.has(meta.format)) throw new Error('Only JPG, PNG, WebP or GIF images are allowed.');

  const d = new Date();
  const rel = `uploads/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const dir = path.join(UPLOAD_DIR, '..', rel);
  fs.mkdirSync(dir, { recursive: true });
  const name = crypto.randomBytes(10).toString('hex');
  const base = sharp(buffer).rotate();                            // honour EXIF orientation
  const full = await base.clone().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(path.join(dir, `${name}.webp`), full);
  await base.clone().resize({ width: 600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(dir, `${name}-t.webp`));
  return { path: `${rel}/${name}.webp`, size: full.length };
}

export function deleteImage(rel) {
  if (!rel || !rel.startsWith('uploads/') || rel.includes('..') || rel.startsWith('uploads/seed/')) return;
  for (const p of [rel, rel.replace(/\.webp$/, '-t.webp')]) {
    const f = path.join(UPLOAD_DIR, '..', p);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}
