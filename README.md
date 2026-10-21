# Esspology Café — React + Tailwind site with a built-in admin

- **Frontend:** React 19, React Router, Tailwind CSS v4, Framer Motion, Lenis smooth scroll (`client/`)
- **Backend:** Node + Express with SQLite (built into Node 22+) and `sharp` for WebP image processing (`server/`)
- **Admin:** `/admin` — every visible element is editable (pages & sections, menu, categories, gallery, team, testimonials, navigation, settings, messages, media, users, trash, activity log)

## Run locally

```bash
npm run install:all     # once
npm run build           # builds client/dist
npm start               # http://localhost:3001  (site + API + admin)
```

Development with hot reload: `npm run dev:server` and `npm run dev:client` (site on http://localhost:5173).

First start seeds demo content and creates the first admin from `server/.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`; copy `server/.env.example`). If no password is set, a random one is written to
`server/data/INITIAL_ADMIN.txt`. Change it under *Admin → My account → Password*.

## Deploy

This app needs **Node.js 22+** (Hostinger Node.js web-app hosting on Business/Cloud plans, or any VPS).
It will **not** run on Hostinger plans that only offer PHP.

1. Upload the project (without `node_modules`), run `npm run install:all` and `npm run build`.
2. Create `server/.env` (see `.env.example`), set the start command to `npm start`, app root to the project folder.
3. Put it behind HTTPS (Hostinger/Nginx). Persist `server/data/` (database) and `server/uploads/` (images) between deploys.

## Notes

- Roles: **Super Admin** (all) and **Editor** (content only; no Settings/Users/Activity).
- Security: bcrypt passwords, HttpOnly SameSite session cookie (2h idle), 5-attempt/15-min lockout, custom-header CSRF guard, server-side validation of every field, image uploads decoded and re-encoded to WebP (SVG rejected), rate-limited contact form with honeypot.
- SEO: titles, descriptions, Open Graph and JSON-LD are set client-side per route. Because this is a single-page app, crawlers that do not run JavaScript will only see the default `index.html`. If strict server-side SEO matters, add a pre-render step later.
- Password reset by email is not included; a Super Admin can set any user's password under *Users*.
- Demo photos are from Unsplash (free licence); replace them from the admin.
