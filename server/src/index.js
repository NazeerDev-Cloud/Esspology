import express from 'express';
import { existsSync as hasFile } from 'node:fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { seedIfEmpty, applyContentV2, applyContentV3, applyContentV4, applyContentV5, applyContentV6, applyContentV7, applyContentV8 } from './seed.js';
import { authRouter, adminRouterGuard } from './routes.js';
import { UPLOAD_DIR } from './images.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Optional server/.env (PORT, ADMIN_EMAIL, ADMIN_PASSWORD, SMTP_*, MAIL_FROM)
if (hasFile(path.join(here, '..', '.env'))) process.loadEnvFile(path.join(here, '..', '.env'));
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ["'self'", 'data:', 'blob:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'script-src': ["'self'", 'https://www.googletagmanager.com'],
      'connect-src': ["'self'", 'https://*.google-analytics.com', 'https://www.googletagmanager.com'],
      'frame-src': ["'self'", 'https://www.google.com'],
      'upgrade-insecure-requests': null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

seedIfEmpty();
applyContentV2();
applyContentV3();
applyContentV4();
applyContentV5();
applyContentV6();
applyContentV7();
applyContentV8();
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true, setHeaders: (r) => r.set('X-Content-Type-Options', 'nosniff') }));
app.use('/api', adminRouterGuard);

const dist = path.join(here, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1y', index: false, setHeaders: (r, p) => { if (p.endsWith('.html')) r.set('Cache-Control', 'no-cache'); } }));
  // SPA fallback: only for page URLs. Missing files (images, fonts, scripts) must be real 404s.
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/uploads/') || path.extname(req.path)) return res.status(404).type('text/plain').send('Not found');
    return res.sendFile(path.join(dist, 'index.html'));
  });
}
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);
  res.status(err.status || 500).json({ error: err.status && err.status < 500 ? err.message : 'Something went wrong.' });
});

const port = +(process.env.PORT || 3001);
app.listen(port, () => console.log(`Esspology API + site on http://localhost:${port}`));
export { authRouter };
