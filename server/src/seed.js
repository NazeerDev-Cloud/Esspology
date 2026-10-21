// Seeds demo content on first run (only if the database is empty).
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { all, get, insert, run, val, now, DATA_DIR } from './db.js';
import { UPLOAD_DIR } from './images.js';

const S = (n) => `uploads/seed/${n}.webp`;
const j = JSON.stringify;

export function seedIfEmpty() {
  if (val('SELECT COUNT(*) FROM pages') > 0) return seedAdmin();

  const settings = {
    cafe_name: 'Esspology', tagline: 'Breakfast, sandwiches, salads & coffee — made fresh, every day.',
    phone: '+92 324 8888798', whatsapp: '923248888798', email: 'esspology@gmail.com', notify_email: 'esspology@gmail.com',
    address: 'Kohsar Market, F-6/3', city: 'Islamabad, Pakistan', map_embed: '', currency: 'PKR',
    instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', tiktok: '',
    footer_text: 'Esspology Café. Freshly brewed, made to order.',
    seo_title: 'Esspology — Breakfast, Sandwiches, Salads & Coffee',
    seo_description: 'A neighbourhood café serving fresh breakfast, sandwiches, salads and specialty coffee.',
    og_image: S('latte'), logo: '', favicon: '', ga_id: '', preloader: '1', cookie_notice: '1',
    hours: j({ Monday: '07:00-18:00', Tuesday: '07:00-18:00', Wednesday: '07:00-18:00', Thursday: '07:00-18:00', Friday: '07:00-20:00', Saturday: '08:00-20:00', Sunday: '08:00-16:00' }),
  };
  for (const [k, v] of Object.entries(settings)) run('INSERT INTO settings (k, v) VALUES (?, ?)', k, v);

  const cats = [
    ['Breakfast', 'breakfast', 'Slow mornings, done properly. Eggs, pastries, porridge and more.', 'brunch'],
    ['Sandwiches', 'sandwiches', 'Toasted, stacked and made to order on fresh-baked bread.', 'sandwich'],
    ['Salads', 'salads', 'Crisp, colourful bowls built from seasonal produce.', 'salad'],
    ['Coffee', 'coffee', 'Specialty beans, roasted for sweetness and poured with care.', 'espresso'],
  ];
  cats.forEach(([name, slug, description, img], i) => insert('categories', { name, slug, description, image: S(img), sort_order: i + 1 }));

  // [cat, name, slug, short, long, price, sale, image, tags, featured, variants]
  const items = [
    [1, 'Esspology Breakfast Plate', 'esspology-breakfast-plate', 'Two eggs your way, sourdough, roast tomato, avocado.', 'Our signature plate: two free-range eggs cooked your way, grilled sourdough, slow-roasted tomato, smashed avocado and a drizzle of chilli oil.', 12.5, null, 'egg-toast', ['Bestseller'], 1, []],
    [1, 'Butter Croissant', 'butter-croissant', 'Flaky, golden and baked every morning.', 'Laminated by hand with real butter and baked fresh each morning.', 3.8, null, 'brunch', ['Veg'], 0, []],
    [1, 'Berry Porridge Bowl', 'berry-porridge-bowl', 'Creamy oats, warm berries, honey and toasted seeds.', 'Slow-cooked oats with a warm berry compote, honey and toasted seeds.', 7.2, null, 'brunch', ['Veg', 'New'], 0, []],
    [1, 'Shakshuka', 'shakshuka', 'Eggs poached in spiced tomato, with warm bread.', 'Eggs poached in a smoky, spiced tomato sauce, finished with feta and herbs.', 11, null, 'egg-toast', ['Spicy'], 0, []],
    [2, 'Chicken Pesto Melt', 'chicken-pesto-melt', 'Grilled chicken, basil pesto, mozzarella, rocket.', 'Grilled chicken, house basil pesto, melted mozzarella and rocket on toasted ciabatta.', 10.5, null, 'chicken', ['Bestseller'], 1, []],
    [2, 'Halloumi & Roast Veg', 'halloumi-roast-veg', 'Charred halloumi, roasted peppers, hummus.', 'Charred halloumi with roasted peppers, courgette and hummus on seeded bread.', 9.8, null, 'sandwich', ['Veg'], 0, []],
    [2, 'Smoked Turkey Club', 'smoked-turkey-club', 'Triple-decker with turkey, bacon, tomato and aioli.', 'Triple-decker toasted club with smoked turkey, crisp bacon, tomato, lettuce and aioli.', 11.2, null, 'burger', [], 0, []],
    [2, 'Spicy Tuna Toastie', 'spicy-tuna-toastie', 'Tuna, jalapeno, cheddar, pressed golden.', 'Tuna mayo with jalapeno and mature cheddar, pressed until golden.', 9.5, null, 'sandwich', ['Spicy'], 0, []],
    [3, 'Harvest Grain Salad', 'harvest-grain-salad', 'Quinoa, roast squash, feta, pomegranate, citrus dressing.', 'Quinoa and farro with roast squash, feta, pomegranate and a bright citrus dressing.', 10.9, null, 'salad', ['Veg', 'Bestseller'], 1, []],
    [3, 'Caesar Salad', 'caesar-salad', 'Cos lettuce, parmesan, croutons, anchovy dressing.', 'Crisp cos, shaved parmesan, garlic croutons and a classic Caesar dressing.', 9.9, null, 'salad', [], 0, []],
    [3, 'Beet & Goat Cheese', 'beet-goat-cheese', 'Roasted beets, goat cheese, walnuts, honey vinaigrette.', 'Roasted beetroot, creamy goat cheese, candied walnuts and baby leaves.', 10.2, null, 'salad', ['Veg'], 0, []],
    [4, 'Flat White', 'flat-white', 'Double ristretto, velvety steamed milk.', 'A double ristretto topped with silky microfoam. Smooth, sweet, balanced.', 3.9, null, 'latte', ['Bestseller'], 1, [['Small', 3.9], ['Large', 4.6]]],
    [4, 'Cappuccino', 'cappuccino', 'Espresso, steamed milk, a thick cloud of foam.', 'Classic and comforting: espresso, steamed milk and a thick cloud of foam.', 3.8, null, 'cheers', [], 0, [['Small', 3.8], ['Large', 4.5]]],
    [4, 'Iced Vanilla Latte', 'iced-vanilla-latte', 'Cold espresso, milk, house vanilla over ice.', 'Espresso poured over ice with milk and our house-made vanilla syrup.', 4.6, 4, 'cups', ['New'], 0, [['Regular', 4.6], ['Large', 5.4]]],
    [4, 'Pour-Over Filter', 'pour-over-filter', 'Single-origin, brewed by hand to order.', 'A rotating single-origin coffee, brewed by hand to highlight its character.', 4.2, null, 'pourover', [], 0, []],
  ];
  const perCat = {};
  for (const [c, name, slug, short_desc, description, price, sale, img, tags, feat, variants] of items) {
    perCat[c] = (perCat[c] || 0) + 1;
    insert('items', { category_id: c, name, slug, short_desc, description, price, sale_price: sale, image: S(img), tags: j(tags), is_featured: feat, sort_order: perCat[c],
      variants: j(variants.map(([n, p]) => ({ name: n, price: p }))) });
  }

  const pages = [['Home', 'home', 'Esspology — Breakfast, Sandwiches, Salads & Coffee'], ['Menu', 'menu', 'Menu — Esspology'], ['About', 'about', 'About us — Esspology'], ['Gallery', 'gallery', 'Gallery — Esspology'], ['Contact', 'contact', 'Contact & Visit — Esspology']];
  pages.forEach(([title, slug, seo_title]) => insert('pages', { title, slug, seo_title, seo_description: '', is_system: 1 }));

  const sec = (page_id, type, data, bg, order) => insert('sections', { page_id, type, data: j(data), bg, sort_order: order });
  sec(1, 'hero', { eyebrow: 'Café & Roastery', title: 'Good food. *Better coffee.* Slow mornings.', subtitle: 'Breakfast, sandwiches, salads and specialty coffee, made fresh to order every single day.', btn1_text: 'View the menu', btn1_url: '/menu', btn2_text: 'Find us', btn2_url: '/contact', image: S('latte'), image2: S('egg-toast'), image3: S('espresso'), badge: 'Fresh daily · Made to order ·' }, 'cream', 1);
  sec(1, 'marquee', { items: 'Freshly brewed\nMade to order\nLocal ingredients\nBaked every morning\nSpecialty coffee' }, 'wine', 2);
  sec(1, 'text_image', { eyebrow: 'Our story', title: 'Made slowly, shared warmly.', body: 'Esspology began with a simple idea: that the best part of the day is the first hour of it. We bake, brew and build every plate in-house, with ingredients from people we know by name.\n\nPull up a chair. The kettle is always on.', image: S('cafe-counter'), btn_text: 'Read our story', btn_url: '/about', side: 'right' }, 'cream', 3);
  sec(1, 'featured_items', { eyebrow: 'Signature', title: 'Guest favourites', subtitle: 'The plates and pours our regulars order again and again.', limit: '4', btn_text: 'See full menu', btn_url: '/menu' }, 'dim', 4);
  sec(1, 'category_showcase', { eyebrow: 'Explore', title: 'Four ways to start well' }, 'black', 5);
  sec(1, 'stats', { items: [{ number: '12', suffix: 'k+', label: 'Coffees poured' }, { number: '4', suffix: '', label: 'Menu collections' }, { number: '100', suffix: '%', label: 'Made to order' }, { number: '7', suffix: '', label: 'Days a week' }] }, 'cream', 6);
  sec(1, 'testimonials', { eyebrow: 'Kind words', title: 'What our guests say' }, 'wine', 7);
  sec(1, 'gallery_strip', { eyebrow: 'Gallery', title: 'A peek inside', limit: '6', btn_text: 'View gallery', btn_url: '/gallery' }, 'cream', 8);
  sec(1, 'map_hours', { eyebrow: 'Visit us', title: 'Find us in Kohsar Market', subtitle: 'Pull up a chair. The kettle is always on.' }, 'dim', 9);
  sec(1, 'cta_banner', { title: 'Your table is waiting.', subtitle: 'Drop in for breakfast, lunch or just a really good coffee.', btn_text: 'Get directions', btn_url: '/contact' }, 'black', 10);

  sec(3, 'text_image', { eyebrow: 'Our story', title: 'Made with care, served with warmth.', body: 'Esspology is a neighbourhood café for people who like their mornings unhurried. Everything on our menu is prepared in our own kitchen, from the bread to the dressings to the syrups.\n\nWe work with small roasters and local growers, and we pay attention to the details so you can simply enjoy the moment.', image: S('team'), btn_text: '', btn_url: '', side: 'left' }, 'cream', 1);
  sec(3, 'feature_list', { eyebrow: 'What we believe', title: 'Our values', subtitle: '', items: [{ icon: '01', title: 'Fresh, always', text: 'Baked, chopped and brewed the same day it is served.' }, { icon: '02', title: 'Local first', text: 'We buy from growers and bakers within reach of our door.' }, { icon: '03', title: 'Made slowly', text: 'No rush, no shortcuts. Good things take a moment.' }] }, 'dim', 2);
  sec(3, 'team', { eyebrow: 'The people', title: 'Meet the team' }, 'cream', 3);
  sec(3, 'feature_list', { eyebrow: 'Timeline', title: 'How we got here', subtitle: '', items: [{ icon: '2019', title: 'The idea', text: 'A tiny pop-up serving flat whites on weekends.' }, { icon: '2021', title: 'Our doors open', text: 'Esspology finds a home on Roastery Lane.' }, { icon: '2024', title: 'Growing gently', text: 'A bigger kitchen, a bigger menu, the same care.' }] }, 'black', 4);
  sec(3, 'cta_banner', { title: 'Come and taste the difference.', subtitle: '', btn_text: 'See the menu', btn_url: '/menu' }, 'wine', 5);
  sec(5, 'map_hours', { eyebrow: 'Visit us', title: 'Your seat is waiting', subtitle: 'We would love to see you.' }, 'dim', 1);
  sec(5, 'faq', { title: 'Good to know', items: [{ q: 'Do you take reservations?', a: 'For groups of six or more, yes. Message us. Otherwise it is walk-in only.' }, { q: 'Do you have vegan options?', a: 'Yes. Look for the Veg tag on the menu and ask us about plant milks.' }, { q: 'Is there parking?', a: 'Street parking is available nearby.' }] }, 'cream', 2);

  [['Amira K.', 'The best flat white in town and the breakfast plate is unreal. My weekend ritual.'], ['Daniel R.', 'Warm, welcoming and the sandwiches are on another level. Pesto melt, every time.'], ['Sofia L.', 'Fresh salads that are actually exciting. Gorgeous space too.']]
    .forEach(([name, text], i) => insert('testimonials', { name, text, rating: 5, sort_order: i + 1 }));
  [['Layla Haddad', 'Founder & Head Barista', 'Obsessed with the perfect extraction since 2012.'], ['Marco Bellini', 'Head Chef', "Brings a baker's patience to every plate."], ['Priya Nair', 'Front of House', 'The reason regulars feel like family.']]
    .forEach(([name, role, bio], i) => insert('team', { name, role, bio, sort_order: i + 1 }));
  ['interior', 'espresso', 'cheers', 'brunch', 'pourover', 'dining', 'beans', 'cups'].forEach((n, i) =>
    insert('gallery', { path: S(n), caption: ['The room', 'Fresh grind', 'Cheers', 'Weekend brunch', 'Pour-over', 'Evenings', 'Single origin', 'Flight of coffees'][i], alt: n, sort_order: i + 1 }));
  [['header', 'Home', '/', 1], ['header', 'Menu', '/menu', 2], ['header', 'About', '/about', 3], ['header', 'Gallery', '/gallery', 4], ['header', 'Contact', '/contact', 5],
    ['footer', 'Menu', '/menu', 1], ['footer', 'About', '/about', 2], ['footer', 'Gallery', '/gallery', 3], ['footer', 'Contact', '/contact', 4]]
    .forEach(([location, label, url, sort_order]) => insert('nav_links', { location, label, url, sort_order }));
  for (const r of all("SELECT path FROM gallery UNION SELECT image FROM items WHERE image <> ''")) {
    if (!get('SELECT id FROM media WHERE path = ?', r.path)) insert('media', { path: r.path, mime: 'image/webp', size: 0 });
  }
  seedAdmin();
}

/** First admin: from ADMIN_EMAIL / ADMIN_PASSWORD env vars, or a random password written to data/INITIAL_ADMIN.txt. */
function seedAdmin() {
  if (val('SELECT COUNT(*) FROM users') > 0) return;
  const email = (process.env.ADMIN_EMAIL || 'owner@esspology.com').toLowerCase();
  let password = process.env.ADMIN_PASSWORD;
  const generated = !password;
  if (generated) password = crypto.randomBytes(9).toString('base64url');
  insert('users', { name: 'Owner', email, password_hash: bcrypt.hashSync(password, 10), role: 'super' });
  if (generated) {
    fs.writeFileSync(path.join(DATA_DIR, 'INITIAL_ADMIN.txt'), `Email: ${email}\nPassword: ${password}\nChange it after first login, then delete this file.\n`);
    console.log(`\n  First admin created -> ${email} / ${password}  (also saved to data/INITIAL_ADMIN.txt)\n`);
  }
}

// ---- Content v2 (one-time, flagged in settings) -----------------------------------------------
// Matching photos for every dish, Hot / Cold options for coffee drinks, new Espresso + Cold Brew items
// and a sharper tagline. Runs once on existing databases and on fresh installs.
// Adds the Signature Coffee section near the top of the home page (once).
export function applyContentV3() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v3'")) return;
  const home = val("SELECT id FROM pages WHERE slug = 'home'");
  if (home && !get("SELECT id FROM sections WHERE page_id = ? AND type = 'signature_coffee'", home)) {
    const at = (val("SELECT sort_order FROM sections WHERE page_id = ? AND type = 'marquee' ORDER BY sort_order LIMIT 1", home) ?? 1) + 1;
    run('UPDATE sections SET sort_order = sort_order + 1 WHERE page_id = ? AND sort_order >= ?', home, at);
    insert('sections', { page_id: home, type: 'signature_coffee', data: j({ eyebrow: 'Signature coffee', title: 'Brewed to be remembered', subtitle: 'Hot or iced, every cup is made to order.', limit: '8', btn_text: 'All coffee', btn_url: '/menu/coffee' }), bg: 'cream', sort_order: at });
  }
  run("INSERT INTO settings (k, v) VALUES ('content_v3', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}

export function applyContentV2() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v2'")) return;
  const img = {
    'esspology-breakfast-plate': 'egg-toast', 'butter-croissant': 'croissant', 'berry-porridge-bowl': 'porridge', shakshuka: 'shakshuka',
    'chicken-pesto-melt': 'burger-melt', 'halloumi-roast-veg': 'sandwich', 'smoked-turkey-club': 'club', 'spicy-tuna-toastie': 'toastie',
    'harvest-grain-salad': 'salad', 'caesar-salad': 'salad-bowl', 'beet-goat-cheese': 'salad',
  };
  const temp = (name, image, price = null) => ({ name, image: S(image), price: price == null ? '' : price });
  const coffee = {
    'flat-white': ['hot-latte', [temp('Hot', 'hot-latte'), temp('Iced', 'iced-coffee', 4.4)]],
    cappuccino: ['cappuccino', [temp('Hot', 'cappuccino'), temp('Iced', 'iced-milk-coffee', 4.3)]],
    'iced-vanilla-latte': ['iced-vanilla', [temp('Iced', 'iced-vanilla'), temp('Hot', 'latte-pour', 4)]],
    'pour-over-filter': ['black-coffee', [temp('Hot', 'black-coffee'), temp('Cold brew', 'iced-coffee', 4.6)]],
  };
  for (const [slug, im] of Object.entries(img)) run('UPDATE items SET image = ? WHERE slug = ?', S(im), slug);
  for (const [slug, [im, temps]] of Object.entries(coffee)) run('UPDATE items SET image = ?, temps = ? WHERE slug = ?', S(im), j(temps), slug);

  const catId = val("SELECT id FROM categories WHERE slug = 'coffee'");
  const next = val('SELECT COALESCE(MAX(sort_order),0) FROM items WHERE category_id = ?', catId);
  const add = (n, name, slug, short, long, price, tags, image, temps) => { if (!get('SELECT id FROM items WHERE slug = ?', slug)) insert('items', { category_id: catId, name, slug, short_desc: short, description: long, price, image: S(image), tags: j(tags), temps: j(temps), sort_order: next + n }); };
  add(1, 'Espresso', 'espresso', 'A short, intense shot with a thick golden crema.', 'Our house blend pulled short and sweet. Rich chocolate, toasted nut and a clean finish.', 3.2, [], 'espresso-top', [temp('Hot', 'espresso-top')]);
  add(2, 'Cold Brew', 'cold-brew', 'Steeped for 18 hours, served over ice.', 'Slow-steeped coarse grounds give a smooth, low-acid brew with notes of cocoa and caramel. Serve it black or with a splash of milk.', 4.8, ['New'], 'iced-coffee', [temp('Cold', 'iced-coffee'), temp('Hot', 'black-coffee', 4.2)]);

  for (const [slug, im] of Object.entries({ breakfast: 'brunch', sandwiches: 'club', salads: 'salad', coffee: 'latte-art-hands' })) run('UPDATE categories SET image = ? WHERE slug = ?', S(im), slug);
  for (const f of ['hot-latte', 'iced-coffee', 'cappuccino', 'iced-milk-coffee', 'iced-vanilla', 'latte-pour', 'black-coffee', 'espresso-top', 'croissant', 'porridge', 'shakshuka', 'burger-melt', 'club', 'toastie', 'salad-bowl', 'latte-art-hands']) {
    if (!get('SELECT id FROM media WHERE path = ?', S(f))) insert('media', { path: S(f), mime: 'image/webp', size: 0 });
  }

  // Tagline + hero copy
  const set = (k, v) => run('INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', k, v);
  set('tagline', 'Brewed slow. Made fresh. Served with soul.');
  set('seo_title', 'Esspology — Specialty Coffee & Fresh Breakfast in Islamabad');
  set('seo_description', 'Slow-brewed specialty coffee, fresh breakfasts, sandwiches and salads at Kohsar Market, Islamabad. Hot or iced, made to order.');
  const hero = get("SELECT id, data FROM sections WHERE type = 'hero' ORDER BY id LIMIT 1");
  if (hero) {
    const d = JSON.parse(hero.data || '{}');
    Object.assign(d, { eyebrow: 'Café & Roastery · Islamabad', title: 'Where every cup *feels like home.*', subtitle: 'Slow-crafted coffee, hot or iced, with fresh-baked breakfasts and sandwiches made to order in the heart of Kohsar Market.', badge: 'Brewed slow · Served with soul ·' });
    run('UPDATE sections SET data = ? WHERE id = ?', JSON.stringify(d), hero.id);
  }
  set('content_v2', '1');
}

// ---- Content v4: the branded Esspology cup photos for every coffee (hot / cold) ---------------
export function applyContentV4() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v4'")) return;
  const catId = val("SELECT id FROM categories WHERE slug = 'coffee'");
  if (!catId) return;
  const t = (name, file, price = '') => ({ name, image: S(file), price });

  // Existing drinks: just attach the new photos and Hot / Iced options.
  const existing = [
    ['flat-white', 'cup-h1', [t('Hot', 'cup-h1'), t('Iced', 'cup-c10', 4.4)]],
    ['cappuccino', 'cup-c2', [t('Hot', 'cup-c2')]],
    ['iced-vanilla-latte', 'cup-c8', [t('Iced', 'cup-c8'), t('Hot', 'cup-c6', 4)]],
    ['pour-over-filter', 'cup-h2', [t('Hot', 'cup-h2')]],
  ];
  // New drinks that match the remaining photos.
  const fresh = [
    ['caramel-macchiato', 'Caramel Macchiato', 'Espresso over vanilla milk, finished with a caramel lattice.', 'Layers of steamed vanilla milk and espresso, striped with buttery caramel. Serve it iced, or hot with a crumble of salted caramel and cream.', 5.2, ['Bestseller'], 'cup-c5', [t('Iced', 'cup-c5'), t('Hot', 'cup-c1', 5.6)]],
    ['matcha-latte', 'Matcha Latte', 'Ceremonial matcha, whisked and poured over milk and ice.', 'Stone-ground ceremonial matcha with a gentle sweetness, shaken with cold milk over ice.', 5.4, ['Veg', 'New'], 'cup-c7', [t('Iced', 'cup-c7')]],
    ['rose-latte', 'Rose Latte', 'Espresso, rose milk and dried petals.', 'A floral twist: espresso over rose-infused milk, scattered with dried rose petals and pistachio.', 5.4, ['New'], 'cup-c4', [t('Iced', 'cup-c4')]],
    ['mocha-frappe', 'Mocha Frappé', 'Blended chocolate coffee under whipped cream.', 'Espresso blended with dark chocolate and ice, topped with whipped cream and chocolate drizzle.', 5.8, [], 'cup-c9', [t('Iced', 'cup-c9')]],
    ['tiramisu-frappe', 'Tiramisu Frappé', 'Coffee, mascarpone cream and cocoa dust.', 'A blended dessert in a cup: espresso and mascarpone cream, dusted with cocoa and topped with a savoiardi biscuit.', 5.8, ['Bestseller'], 'cup-c3', [t('Iced', 'cup-c3')]],
    ['hot-chocolate', 'Hot Chocolate', 'Rich dark chocolate, steamed milk, chocolate shavings.', 'Slow-melted dark chocolate and steamed milk, finished with a cloud of foam and chocolate shavings.', 4.6, ['Veg'], 'cup-h3', [t('Hot', 'cup-h3')]],
  ];

  let order = 0;
  for (const [slug, main, temps] of existing) {
    run('UPDATE items SET image = ?, temps = ?, sort_order = ?, deleted_at = NULL WHERE slug = ?', S(main), j(temps), ++order, slug);
  }
  for (const [slug, name, short, long, price, tags, main, temps] of fresh) {
    order++;
    if (get('SELECT id FROM items WHERE slug = ?', slug)) {
      run('UPDATE items SET image = ?, temps = ?, sort_order = ?, deleted_at = NULL WHERE slug = ?', S(main), j(temps), order, slug);
    } else {
      insert('items', { category_id: catId, name, slug, short_desc: short, description: long, price, image: S(main), tags: j(tags), temps: j(temps), sort_order: order });
    }
  }
  // Earlier placeholder drinks without a matching photo go to Trash (restorable from the admin).
  run("UPDATE items SET deleted_at = ? WHERE slug IN ('espresso', 'cold-brew') AND deleted_at IS NULL", now());
  run('UPDATE categories SET image = ? WHERE slug = ?', S('cup-c6'), 'coffee');
  for (let n = 1; n <= 10; n++) if (!get('SELECT id FROM media WHERE path = ?', S('cup-c' + n))) insert('media', { path: S('cup-c' + n), mime: 'image/webp', size: 0 });
  for (let n = 1; n <= 3; n++) if (!get('SELECT id FROM media WHERE path = ?', S('cup-h' + n))) insert('media', { path: S('cup-h' + n), mime: 'image/webp', size: 0 });
  run("INSERT INTO settings (k, v) VALUES ('content_v4', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}

// ---- Content v5: prices in Pakistani rupees ---------------------------------------------------
// Converts the demo dollar prices to rupees (about 280 PKR per USD, rounded to the nearest 50) once.
export function applyContentV5() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v5'")) return;
  const pkr = (usd) => Math.max(50, Math.round((Number(usd) * 280) / 50) * 50);
  for (const it of all('SELECT id, price, sale_price, variants, temps FROM items')) {
    const conv = (arr) => JSON.stringify(JSON.parse(arr || '[]').map((r) => ({ ...r, price: r.price === '' || r.price == null ? r.price : pkr(r.price) })));
    run('UPDATE items SET price = ?, sale_price = ?, variants = ?, temps = ? WHERE id = ?', pkr(it.price), it.sale_price ? pkr(it.sale_price) : null, conv(it.variants), conv(it.temps), it.id);
  }
  run("INSERT INTO settings (k, v) VALUES ('currency', 'PKR') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
  run("INSERT INTO settings (k, v) VALUES ('content_v5', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}

// ---- Content v6: the green Esspology cups, split into hot and cold coffee folders --------------
// Swaps every older cup photo for the ones in client/src/assets/coffee/{hot,cold} coffee (copied to uploads/seed/{hot,cold}-coffee-N.webp).
export function applyContentV6() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v6'")) return;
  const map = {
    'cup-c1': 'hot-coffee-1', 'cup-c2': 'hot-coffee-2', 'cup-c6': 'hot-coffee-6', 'cup-h1': 'hot-coffee-6', 'cup-h2': 'hot-coffee-7',
    'cup-c3': 'cold-coffee-3', 'cup-c4': 'cold-coffee-4', 'cup-c5': 'cold-coffee-5', 'cup-c7': 'cold-coffee-7', 'cup-c8': 'cold-coffee-8', 'cup-c9': 'cold-coffee-9', 'cup-c10': 'cold-coffee-10',
  };
  const swap = (v) => (v == null ? v : Object.entries(map).reduce((s, [a, b]) => s.replaceAll(S(a), S(b)), v));
  for (const it of all('SELECT id, image, temps, images FROM items')) run('UPDATE items SET image = ?, temps = ?, images = ? WHERE id = ?', swap(it.image), swap(it.temps), swap(it.images), it.id);
  for (const c of all('SELECT id, image FROM categories')) run('UPDATE categories SET image = ? WHERE id = ?', swap(c.image), c.id);
  for (const s of all('SELECT id, data FROM sections')) run('UPDATE sections SET data = ? WHERE id = ?', swap(s.data), s.id);
  // There is no green hot-chocolate photo, so that drink goes to Trash (restorable from the admin).
  run("UPDATE items SET deleted_at = ? WHERE slug = 'hot-chocolate' AND deleted_at IS NULL", now());
  run("DELETE FROM media WHERE path LIKE 'uploads/seed/cup-%'");
  for (const n of Object.values(map)) if (!get('SELECT id FROM media WHERE path = ?', S(n))) insert('media', { path: S(n), mime: 'image/webp', size: 0 });
  run("INSERT INTO settings (k, v) VALUES ('content_v6', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}

// ---- Content v7: every coffee photo shares the Flat White's soft grey backdrop -----------------
// The photos were re-exported with that backdrop as uploads/seed/{hot,cold}-coffee-N-g.webp (new names, so browsers drop the cached ones).
export function applyContentV7() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v7'")) return;
  const names = ['hot-coffee-1', 'hot-coffee-2', 'hot-coffee-7', 'cold-coffee-3', 'cold-coffee-4', 'cold-coffee-5', 'cold-coffee-7', 'cold-coffee-8', 'cold-coffee-9', 'cold-coffee-10'];
  const swap = (v) => (v == null ? v : names.reduce((s, n) => s.replaceAll(S(n), S(n + '-g')), v));
  for (const it of all('SELECT id, image, temps, images FROM items')) run('UPDATE items SET image = ?, temps = ?, images = ? WHERE id = ?', swap(it.image), swap(it.temps), swap(it.images), it.id);
  for (const c of all('SELECT id, image FROM categories')) run('UPDATE categories SET image = ? WHERE id = ?', swap(c.image), c.id);
  for (const s of all('SELECT id, data FROM sections')) run('UPDATE sections SET data = ? WHERE id = ?', swap(s.data), s.id);
  for (const n of names) {
    run('DELETE FROM media WHERE path = ?', S(n));
    if (!get('SELECT id FROM media WHERE path = ?', S(n + '-g'))) insert('media', { path: S(n + '-g'), mime: 'image/webp', size: 0 });
  }
  run("INSERT INTO settings (k, v) VALUES ('content_v7', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}

// ---- Content v8: the latest green-cup photos (hot-coffee-v2-N, cold-coffee-v2-N), matched drink by drink --
export function applyContentV8() {
  if (get("SELECT 1 AS x FROM settings WHERE k = 'content_v8'")) return;
  const H = (n) => S('hot-coffee-v2-' + n), C = (n) => S('cold-coffee-v2-' + n);
  // slug -> [main photo, { temperature name: photo }]
  const plan = {
    'flat-white': [H(2), { Hot: H(2), Iced: C(6) }],
    cappuccino: [H(4), { Hot: H(4) }],
    'iced-vanilla-latte': [C(3), { Iced: C(3), Hot: H(2) }],
    'pour-over-filter': [H(1), { Hot: H(1) }],
    'caramel-macchiato': [C(2), { Iced: C(2), Hot: H(3) }],
    'matcha-latte': [C(1), { Iced: C(1) }],
    'rose-latte': [C(7), { Iced: C(7) }],
    'mocha-frappe': [C(5), { Iced: C(5) }],
    'tiramisu-frappe': [C(4), { Iced: C(4) }],
    'hot-chocolate': [H(5), { Hot: H(5) }],
  };
  for (const [slug, [main, byTemp]] of Object.entries(plan)) {
    const it = get('SELECT id, temps FROM items WHERE slug = ?', slug);
    if (!it) continue;
    const temps = JSON.parse(it.temps || '[]').map((t) => ({ ...t, image: byTemp[t.name] || t.image }));
    run('UPDATE items SET image = ?, temps = ?, deleted_at = NULL WHERE id = ?', main, j(temps), it.id);
  }
  run('UPDATE categories SET image = ? WHERE slug = ?', H(2), 'coffee');
  for (const f of fs.readdirSync(path.join(UPLOAD_DIR, 'seed')).filter((f) => /^(hot|cold)-coffee-(\d+)(-g)?(-t)?\.webp$/.test(f))) {
    run('DELETE FROM media WHERE path = ?', 'uploads/seed/' + f);
    fs.rmSync(path.join(UPLOAD_DIR, 'seed', f), { force: true });
  }
  for (const [k, n] of [['hot', 5], ['cold', 7]]) for (let i = 1; i <= n; i++) if (!get('SELECT id FROM media WHERE path = ?', S(`${k}-coffee-v2-${i}`))) insert('media', { path: S(`${k}-coffee-v2-${i}`), mime: 'image/webp', size: 0 });
  run("INSERT INTO settings (k, v) VALUES ('content_v8', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v");
}
