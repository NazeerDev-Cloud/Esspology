# Esspology Café — Website + Admin Panel Build Spec

> **For the AI agent:** This is your complete brief. Read the whole file before writing any code. Follow the phases in order (Section 13) and do not move on until each phase's checklist passes. When something isn't specified here, choose the simplest option that still works on Hostinger shared hosting, and record the decision in `DECISIONS.md`.

---

## 1. Project Overview

| Item | Detail |
|---|---|
| Brand | **Esspology** (café) |
| Offer | Breakfast, Sandwiches, Salads, Coffee |
| Type | A **content website** with multiple real pages, server-rendered, SEO-friendly. **Not** a single-page web app and **not** a React/Vue SPA. |
| Must have | Modern premium look, rich but smooth animations, fully responsive layout, and an admin panel where **every visible element** can be added, edited, hidden, reordered and deleted |
| Hosting | **Hostinger** (shared / Premium / Business plan): PHP + MySQL, uploaded via hPanel |

---

## 2. Tech Stack (fixed — do not change)

Hostinger shared hosting runs PHP and MySQL natively and has no Node server, so the stack is:

| Layer | Choice | Notes |
|---|---|---|
| Backend | **PHP 8.2+** (plain PHP, small MVC-style structure, no framework) | Runs on Hostinger with no build step |
| Database | **MySQL 8 / MariaDB** via **PDO** with prepared statements only | |
| Frontend | Semantic HTML5, modern CSS (custom properties, grid, clamp), **vanilla JS (ES modules)** | No React/Vue/jQuery |
| Animation | **GSAP 3** + **ScrollTrigger** + **SplitText** (or a small custom splitter) + **Flip**, plus **Lenis** for smooth scrolling | GSAP and its plugins are free. Load from cdnjs/jsDelivr **and** keep a local fallback copy in `/assets/vendor/` |
| Admin UI | Same PHP app under `/admin`, plain CSS, **SortableJS** for drag-to-reorder, a lightweight rich-text editor (**Quill** or **TinyMCE community**) | |
| Images | Uploads resized and converted to **WebP** server-side using PHP **GD** (Hostinger supports it) | |
| Config | `config.php` stored **outside `public_html`** where possible | |

No Composer dependencies are required. If you do use any, commit the `vendor/` folder, because the user will upload files manually.

---

## 3. Brand & Design System

### 3.1 Colors (use only these, plus tints and shades of them)

```css
:root {
  --c-wine:   #5c061d;  /* primary: buttons, accents, headings, highlights */
  --c-cream:  #fbf8ef;  /* main background, text on wine/black */
  --c-black:  #000000;  /* body text, footer, dark sections */

  /* derived tints (allowed) */
  --c-wine-90: #6e1a30;           /* hover state */
  --c-wine-10: rgba(92,6,29,.08); /* subtle fills, card borders */
  --c-black-70: rgba(0,0,0,.7);   /* secondary text */
  --c-cream-dim: #f1ecdd;         /* alternate section background */
}
```

> The brief listed black as `#00000` (5 digits). Treat it as **`#000000`**.

**Usage rules**
- The page background is cream. Dark "feature" sections alternate between black and wine.
- Body text is black on cream and cream on wine/black.
- Check contrast against WCAG AA: wine on cream passes, and cream on wine passes.
- Add a subtle paper or noise grain overlay (2–4% opacity) to give the brand a craft-café feel.

### 3.2 Typography (Google Fonts)
- **Display / headings:** `Fraunces` (serif, variable; use its optical size and "soft" axes for a warm editorial look)
- **Body / UI:** `Inter` or `DM Sans`
- **Accent / labels:** body font in uppercase with letter-spacing `0.12em`
- Fluid type scale using `clamp()`. Example: `h1: clamp(2.8rem, 7vw, 6.5rem)`.

### 3.3 UI Language
- Large editorial headlines, generous whitespace, rounded image masks (`border-radius: 24px`), and circular badges for features like "Fresh daily".
- Buttons are pill-shaped. The primary button is wine with cream text. The secondary button has a black outline. On hover, a fill slides across the button.
- Store all spacing, radii, and shadows as CSS variables in `/assets/css/tokens.css`.

---

## 4. Site Map (public website)

All pages are server-rendered PHP with clean URLs set up through `.htaccess`.

| URL | Page | Sections (all editable in admin) |
|---|---|---|
| `/` | Home | Preloader → Hero (headline, subtext, 2 CTAs, hero image/video) → Marquee strip ("Freshly brewed · Made to order · …") → About teaser → Signature items (featured menu items) → Category showcase (Breakfast / Sandwiches / Salads / Coffee) → Stats/counters → Testimonials slider → Gallery teaser → Visit us (hours + map) → CTA banner → Footer |
| `/menu` | Full Menu | Sticky category tabs, filterable item grid, item cards (image, name, short desc, price, tags such as Veg / Spicy / New / Bestseller) |
| `/menu/{category-slug}` | Category page | Same layout, pre-filtered to one category (good for SEO) |
| `/menu/item/{item-slug}` | Item detail | Large image, description, price, variants/sizes, related items |
| `/about` | About | Story, values, team, timeline |
| `/gallery` | Gallery | Masonry grid with a lightbox |
| `/contact` | Contact / Visit | Contact form (saved to DB and emailed), address, embedded map, hours, WhatsApp button |
| `/{custom-page-slug}` | Custom pages | Any extra page the admin creates, such as Catering, Events, or Careers |
| `404` | Not found | Branded page with an animated coffee cup |

**Global elements:** header (logo, nav, "Order / Call" CTA, mobile menu), footer (logo, links, hours, socials, newsletter field), floating WhatsApp button, and a cookie notice (optional, toggled in admin).

The navigation menu must be **editable in the admin**: add/remove links, reorder them, and set the label and URL.

---

## 5. Animation Spec

Use GSAP with ScrollTrigger and Lenis. Put all animation code in `/assets/js/animations/` and split it by feature.

### 5.1 Global
1. **Preloader** (first visit per session only): an Esspology logo stroke-draw (SVG `stroke-dashoffset`), then a wine panel wipes up to reveal the page. Max 1.8s. Skipped on later page loads using `sessionStorage`.
2. **Smooth scroll:** Lenis, synced with ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`).
3. **Page transitions:** on internal link click, a wine overlay slides in, then the browser navigates; on page load, the overlay slides out. These are real page loads (MPA), so do **not** turn the site into an SPA.
4. **Header:** hides when scrolling down, reappears when scrolling up, and gains a cream blurred background after 80px.
5. **Custom cursor (desktop only):** a small wine dot that grows and shows "View" over menu cards and gallery images. Disabled on touch devices.
6. **Magnetic buttons:** primary CTAs pull slightly toward the cursor.

### 5.2 Home page
| Section | Animation |
|---|---|
| Hero headline | Split into lines/words that rise from a mask with a stagger (`y: 110%`, `stagger: 0.08`, `ease: "power4.out"`) |
| Hero image | Clip-path reveal (`inset(100% 0 0 0)` → `inset(0)`) plus a slow scale from 1.15 to 1 |
| Coffee steam | Looping SVG steam paths above the cup (morph/opacity loop) |
| Marquee | Infinite horizontal scroll whose speed and direction respond to scroll velocity |
| About teaser | Image parallax (`yPercent: -15` on scrub) and text fade-up |
| Signature items | Cards stagger in. On hover: image zoom, slight 3D tilt, price tag slides in |
| Category showcase | **Pinned horizontal scroll** section (pin the section and translate the track on X as the user scrolls). Each category panel has a large image and a title |
| Stats | Counters animate from 0 when they come into view |
| Testimonials | Auto-sliding carousel with a fade and slide; pauses on hover |
| Gallery teaser | Images reveal in a staggered grid with clip-path |
| CTA banner | Wine background with the text scaling up on scroll |

### 5.3 Menu page
- Category tab underline slides to the active tab.
- **Filtering uses GSAP Flip:** cards rearrange smoothly while hidden cards fade/scale out. No page reload. Every category also has its own URL (`/menu/{slug}`) for SEO.
- Item cards fade up in batches using `ScrollTrigger.batch`.

### 5.4 Rules (mandatory)
- **Respect `prefers-reduced-motion`:** turn off parallax, pinning, the preloader, and the cursor, and replace them with simple fades.
- Animate only `transform` and `opacity`. Never animate layout properties (`top`, `width`, …).
- No layout shift: give every image `width`/`height` or `aspect-ratio`.
- Mobile: no pinned horizontal scroll (it becomes a swipeable row), lighter effects, no custom cursor.
- Content must be readable with JavaScript disabled. Animations are progressive enhancement only.
- Call `ScrollTrigger.refresh()` after images load.

---

## 6. Admin Panel (`/admin`)

**Goal:** the owner can manage **every** element on the site without touching code.

### 6.1 Authentication
- Login with email and password (`password_hash` / `password_verify`).
- Session hardening: regenerate the ID on login, `HttpOnly` + `Secure` + `SameSite=Lax` cookies, 2-hour idle timeout.
- Brute-force protection: lock for 15 minutes after 5 failed attempts per IP/email.
- "Forgot password" email reset link (token, 30-minute expiry).
- Roles: **Super Admin** (everything, including users and settings) and **Editor** (content only).

### 6.2 Modules
Every module supports **Create, Read, Update, Delete, Show/Hide toggle, and drag-to-reorder** wherever order matters.

| Module | What can be managed |
|---|---|
| **Dashboard** | Counts (items, categories, unread messages), recent messages, quick links |
| **Menu Categories** | Name, slug, description, image, icon, sort order, visible |
| **Menu Items** | Name, slug, category, short and long description, price, optional sale price, sizes/variants (name + price, repeatable), image, extra images, tags (Veg, Spicy, New, Bestseller, custom), featured on home (yes/no), available (yes/no), sort order |
| **Pages** | Create custom pages (title, slug, SEO), built from **Sections** |
| **Sections (page builder)** | Each page — Home, About, and custom pages — is a list of sections. The admin can **add, remove, reorder, hide, and edit** sections. Section types: Hero, Text + Image, Feature List, Featured Menu Items, Category Showcase, Stats, Testimonials, Gallery Strip, CTA Banner, Marquee, Map/Hours, Rich Text, FAQ. Each type has its own form fields (title, subtitle, body, image, button text/link, background color from the brand palette, animation style chosen from a dropdown) |
| **Testimonials** | Name, text, rating, photo, visible, order |
| **Gallery** | Upload many images at once, captions, alt text, order, visible |
| **Team** | Name, role, photo, bio, order |
| **Navigation** | Header and footer menu links: label, URL/page picker, order, open in new tab |
| **Site Settings** | Logo (light/dark), favicon, café name, tagline, phone, WhatsApp, email, address, Google Maps embed, opening hours (per day), social links, footer text, default SEO title/description, OG image, Google Analytics / Meta Pixel IDs, preloader on/off, cookie notice on/off |
| **Messages** | Contact form submissions: read/unread, reply via mailto, delete, export CSV |
| **Media Library** | All uploaded files, reuse anywhere, delete unused ones |
| **Users** (Super Admin) | Add/edit/delete admins, assign roles, reset passwords |
| **Activity Log** | Who changed what and when (simple table) |

### 6.3 Admin UX
- Clean sidebar layout in the brand colors (wine sidebar, cream workspace).
- Lists have search, a category filter, pagination, and bulk delete / show / hide.
- Every delete asks for confirmation. Use **soft delete** with a Trash view that allows restore or permanent delete.
- Image fields: drag-and-drop upload with a preview. Server side: validate the MIME type, max 8MB, resize to max 2000px, convert to WebP, generate a 600px thumbnail.
- Auto-generate slugs from names, with manual editing allowed.
- Success and error toast notifications.
- Every form has a "Preview on site" link.
- Mobile-usable, so the owner can edit from a phone.

---

## 7. Database Schema (MySQL, `utf8mb4`)

Create `/database/schema.sql` and `/database/seed.sql` (seed with demo menu items in all 4 categories, home sections, and settings, so the site looks complete right after install).

```
users            (id, name, email UNIQUE, password_hash, role ENUM('super','editor'), last_login, created_at, updated_at)
password_resets  (id, user_id, token_hash, expires_at)
login_attempts   (id, ip, email, attempted_at)

settings         (key VARCHAR PK, value TEXT)          -- key/value store for Site Settings

categories       (id, name, slug UNIQUE, description, image, icon, sort_order, is_visible, deleted_at, timestamps)
menu_items       (id, category_id FK, name, slug UNIQUE, short_desc, description, price DECIMAL(10,2),
                  sale_price, image, tags JSON, is_featured, is_available, is_visible, sort_order, deleted_at, timestamps)
item_variants    (id, item_id FK, name, price, sort_order)
item_images      (id, item_id FK, path, alt, sort_order)

pages            (id, title, slug UNIQUE, seo_title, seo_description, og_image, is_system, is_visible, deleted_at, timestamps)
                  -- is_system = 1 for home/about/menu/gallery/contact (cannot be deleted, can be edited)
sections         (id, page_id FK, type VARCHAR, data JSON, bg_style, animation, sort_order, is_visible, timestamps)
                  -- data JSON holds that section type's fields

testimonials     (id, name, text, rating, photo, sort_order, is_visible, timestamps)
gallery          (id, path, thumb, caption, alt, sort_order, is_visible, timestamps)
team             (id, name, role, photo, bio, sort_order, is_visible, timestamps)
nav_links        (id, location ENUM('header','footer'), label, url, page_id NULL, new_tab, sort_order, is_visible)
messages         (id, name, email, phone, subject, message, is_read, ip, created_at)
media            (id, path, thumb, mime, size, alt, uploaded_by, created_at)
activity_log     (id, user_id, action, entity, entity_id, created_at)
```

---

## 8. Folder Structure

```
esspology/
├── public_html/                 ← upload this folder's contents to Hostinger public_html
│   ├── index.php                ← front controller / router
│   ├── .htaccess                ← clean URLs, HTTPS redirect, caching, security headers
│   ├── admin/
│   │   └── index.php            ← admin front controller
│   ├── assets/
│   │   ├── css/   (tokens.css, base.css, components.css, pages/*.css, admin.css)
│   │   ├── js/    (main.js, animations/*.js, menu-filter.js, admin/*.js)
│   │   ├── fonts/ (optional self-hosted)
│   │   ├── img/   (static brand images, SVG logo)
│   │   └── vendor/ (gsap, ScrollTrigger, Flip, lenis, sortable, quill — local fallbacks)
│   ├── uploads/                 ← user uploads (deny PHP execution here via .htaccess)
│   └── robots.txt
├── app/                         ← keep OUTSIDE public_html
│   ├── config.php               ← DB credentials, site URL, mail settings (NOT committed)
│   ├── config.sample.php
│   ├── core/    (Router.php, DB.php, Auth.php, Csrf.php, Upload.php, View.php, Mailer.php, Helpers.php)
│   ├── controllers/  (public + admin)
│   ├── models/
│   └── views/
│       ├── layouts/   (public.php, admin.php)
│       ├── partials/  (header, footer, nav, sections/*.php — one template per section type)
│       ├── pages/
│       └── admin/
├── database/  (schema.sql, seed.sql)
├── DECISIONS.md
└── README.md                    ← install + deploy steps
```

If the Hostinger plan doesn't allow folders above `public_html`, put `app/` inside `public_html/` and add an `.htaccess` there with `Require all denied`.

---

## 9. Security Requirements

- PDO prepared statements everywhere. Never concatenate SQL.
- CSRF token on every admin form and every POST.
- Escape all output with `htmlspecialchars`. Rich-text fields go through an HTML sanitizer (allowlist of tags).
- Uploads: verify the real MIME type with `finfo`, allow images only (jpg/png/webp/gif/svg is **not** allowed), rename to random filenames, and block PHP execution in `/uploads`.
- Contact form: honeypot field plus rate limit (3 per IP per 10 minutes). Optional Google reCAPTCHA v3, toggled in settings.
- Security headers in `.htaccess`: `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and a basic `Content-Security-Policy` allowing the CDNs in use.
- Force HTTPS.
- Show no PHP errors in production (`display_errors=0`); log them to a file outside `public_html`.

---

## 10. SEO & Performance

- Each page has its own `<title>`, meta description, canonical URL, and Open Graph/Twitter tags, all editable in the admin.
- JSON-LD structured data: `CafeOrCoffeeShop` (name, address, hours, phone, geo) on every page, plus `Menu` / `MenuItem` on menu pages.
- Auto-generate `sitemap.xml` at `/sitemap.xml` from pages, categories, and items.
- Images: WebP, `loading="lazy"` (except hero), `srcset` with thumbnail and full sizes, `alt` from the admin.
- Fonts: `preconnect` + `display=swap`.
- Use `defer` on all scripts and load GSAP plugins only on pages that need them.
- `.htaccess`: gzip/deflate plus long cache headers for `/assets` and `/uploads`.
- **Targets:** Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95. LCP < 2.5s, CLS < 0.05.

---

## 11. Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page.
- Keyboard-navigable menu, tabs, slider, and lightbox, with visible focus rings in wine color.
- The mobile menu traps focus and closes on `Esc`.
- All decorative SVGs get `aria-hidden="true"`.
- Reduced-motion support as described in Section 5.4.

---

## 12. Deployment to Hostinger (write these steps in README.md too)

1. **hPanel → Advanced → PHP Configuration:** set PHP to **8.2 or 8.3**. Make sure `gd`, `pdo_mysql`, `fileinfo`, and `mbstring` are enabled.
2. **hPanel → Databases → MySQL Databases:** create a database, user, and password. Note the host (usually `localhost`).
3. **hPanel → Databases → phpMyAdmin:** import `database/schema.sql`, then `database/seed.sql`.
4. **hPanel → Files → File Manager:**
   - Upload the **contents** of `public_html/` into the domain's `public_html/`.
   - Upload `app/` **one level above** `public_html` (e.g. `domains/yourdomain.com/app/`).
5. Copy `config.sample.php` to `config.php` and fill in the DB credentials, `SITE_URL`, and the SMTP details (use a Hostinger email account: host `smtp.hostinger.com`, port 465, SSL).
6. **hPanel → Security → SSL:** install the free SSL certificate. The `.htaccess` file forces HTTPS.
7. Set the `uploads/` folder permission to **755** (files 644).
8. Open `https://yourdomain.com/admin`, log in with the seeded Super Admin account, and **change the password immediately**.
9. Test: contact form email delivery, image upload, menu filtering, and every page on mobile.
10. Optional: install an install-lock — after the first login, `/install` (if built) must refuse to run again.

**Seeded admin (change on first login):** `admin@esspology.com` / random strong password printed in `README.md`, never a hardcoded "admin123".

---

## 13. Build Phases (do them in order)

### Phase 1 — Foundation
- [ ] Folder structure, router, DB class, config, `.htaccess`
- [ ] `schema.sql` + `seed.sql`
- [ ] Design tokens and base CSS; header and footer pulled from the DB

### Phase 2 — Public site (static look, data from DB)
- [ ] Home page rendered from the `sections` table (one partial per section type)
- [ ] Menu, category, and item detail pages
- [ ] About, Gallery (lightbox), Contact (form saves and emails), 404, custom pages
- [ ] Fully responsive at 360 / 768 / 1024 / 1440px

### Phase 3 — Animations
- [ ] Lenis + GSAP setup, preloader, page transitions, header behavior
- [ ] Every animation in Section 5
- [ ] Reduced-motion and mobile fallbacks verified

### Phase 4 — Admin panel
- [ ] Auth (login, logout, reset, lockout, roles)
- [ ] All modules in Section 6.2 with CRUD, show/hide, drag-reorder, and soft delete
- [ ] Section page builder: add / edit / hide / reorder / delete sections on any page
- [ ] Image upload pipeline (WebP + thumbnail)
- [ ] Settings change the live site immediately (logo, colors used per section, contact info, hours, SEO)

### Phase 5 — Hardening & launch
- [ ] Security checklist (Section 9)
- [ ] SEO: meta tags, JSON-LD, sitemap
- [ ] Lighthouse targets met
- [ ] README with deployment steps; tested on a clean Hostinger install

---

## 14. Acceptance Test (the owner will check these)

1. I can log in at `/admin` and change the hero headline. It updates on the home page right away.
2. I can add a new menu item with a photo and two sizes. It appears in the right category with the animation.
3. I can hide a category. It disappears from the site and the menu tabs.
4. I can drag sections on the Home page into a new order, delete one, and add a new "CTA Banner" section.
5. I can create a new page ("Catering"), add sections, and put it in the header menu.
6. I can change the phone number and opening hours in Settings, and the header, footer, contact page, and schema all update.
7. A deleted item goes to Trash and can be restored.
8. The site looks and animates smoothly on my phone, and nothing breaks with "Reduce motion" turned on.
9. The contact form arrives in both the Messages module and my email.
10. Everything runs on Hostinger with only File Manager + phpMyAdmin (no terminal, no Node).

---

## 15. Rules for the AI Agent

- Do **not** switch to React, Next.js, Vue, Laravel, WordPress, or any build tool unless the owner approves it in writing.
- Do **not** hardcode content that the admin should control. If text or an image appears on the public site, it must come from the database.
- Use only the 3 brand colors and their tints.
- Write clean, commented code. Keep PHP files under ~300 lines and split them when they grow.
- After each phase, give a short summary: what was built, which files changed, and anything the owner must do.
- Ask before deleting files or changing the database schema after Phase 1.
- When unsure, follow this spec. If the spec doesn't cover it, pick the simplest working solution and log it in `DECISIONS.md`.
