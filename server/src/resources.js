// Single source of truth for admin resources and page-builder section types.
// The server whitelists/coerces fields from these; the admin UI renders forms from them (via /api/admin/meta).

const vis = { name: 'is_visible', label: 'Visible on site', kind: 'bool', default: 1 };

export const RESOURCES = {
  categories: {
    table: 'categories', label: 'Categories', singular: 'category', title: 'name', sortable: true, soft: true, visible: 'is_visible',
    columns: [['image', 'Image', 'image'], ['name', 'Name'], ['slug', 'URL']],
    preview: (r) => `/menu/${r.slug}`,
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'slug', label: 'URL slug', kind: 'slug', from: 'name' },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'image', label: 'Image', kind: 'image' },
      vis,
    ],
  },
  items: {
    table: 'items', label: 'Menu Items', singular: 'menu item', title: 'name', sortable: true, soft: true, visible: 'is_visible',
    columns: [['image', 'Image', 'image'], ['name', 'Name'], ['category_name', 'Category'], ['price', 'Price', 'price'], ['is_featured', 'Home', 'bool']],
    filter: { column: 'category_id', optionsFrom: 'categories', label: 'All categories' },
    preview: (r) => `/menu/item/${r.slug}`,
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'slug', label: 'URL slug', kind: 'slug', from: 'name' },
      { name: 'category_id', label: 'Category', kind: 'select', optionsFrom: 'categories', required: true, int: true },
      { name: 'short_desc', label: 'Short description', kind: 'text' },
      { name: 'description', label: 'Long description', kind: 'textarea', rows: 5 },
      { name: 'price', label: 'Price', kind: 'price', required: true },
      { name: 'sale_price', label: 'Sale price (optional)', kind: 'price', nullable: true },
      { name: 'image', label: 'Main image', kind: 'image' },
      { name: 'tags', label: 'Tags', kind: 'tags', suggestions: ['Veg', 'Spicy', 'New', 'Bestseller'] },
      { name: 'variants', label: 'Sizes / variants', kind: 'repeater', fields: [
        { name: 'name', label: 'Name (e.g. Large)', kind: 'text' }, { name: 'price', label: 'Price', kind: 'price' }] },
      { name: 'temps', label: 'Hot / Cold options (each can have its own photo and price)', kind: 'repeater', fields: [
        { name: 'name', label: 'Name (Hot, Iced, Cold brew…)', kind: 'text' }, { name: 'image', label: 'Photo', kind: 'image' }, { name: 'price', label: 'Price (blank = same as main)', kind: 'price', nullable: true }] },
      { name: 'images', label: 'Extra images', kind: 'repeater', fields: [
        { name: 'path', label: 'Image', kind: 'image' }, { name: 'alt', label: 'Alt text', kind: 'text' }] },
      { name: 'is_featured', label: 'Featured on home page', kind: 'bool' },
      { name: 'is_available', label: 'Available (untick = sold out)', kind: 'bool', default: 1 },
      vis,
    ],
  },
  pages: {
    table: 'pages', label: 'Pages', singular: 'page', title: 'title', soft: true, visible: 'is_visible', protect: 'is_system',
    columns: [['title', 'Title'], ['slug', 'URL'], ['is_system', 'Built-in', 'bool']],
    preview: (r) => (r.slug === 'home' ? '/' : `/${r.slug}`),
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'slug', label: 'URL slug', kind: 'slug', from: 'title', lockSystem: true },
      { name: 'seo_title', label: 'SEO title', kind: 'text' },
      { name: 'seo_description', label: 'SEO description', kind: 'textarea' },
      { name: 'og_image', label: 'Social share image', kind: 'image' },
      { name: 'add_to_menu', label: 'Add to header menu', kind: 'bool', virtual: true, newOnly: true },
      vis,
    ],
  },
  testimonials: {
    table: 'testimonials', label: 'Testimonials', singular: 'testimonial', title: 'name', sortable: true, soft: true, visible: 'is_visible',
    columns: [['photo', 'Photo', 'image'], ['name', 'Name'], ['rating', 'Rating']],
    preview: () => '/',
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'text', label: 'Testimonial', kind: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1-5)', kind: 'number', min: 1, max: 5, default: 5 },
      { name: 'photo', label: 'Photo', kind: 'image' },
      vis,
    ],
  },
  team: {
    table: 'team', label: 'Team', singular: 'team member', title: 'name', sortable: true, soft: true, visible: 'is_visible',
    columns: [['photo', 'Photo', 'image'], ['name', 'Name'], ['role', 'Role']],
    preview: () => '/about',
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'role', label: 'Role', kind: 'text' },
      { name: 'photo', label: 'Photo', kind: 'image' },
      { name: 'bio', label: 'Bio', kind: 'textarea' },
      vis,
    ],
  },
  gallery: {
    table: 'gallery', label: 'Gallery', singular: 'image', title: 'caption', sortable: true, soft: true, visible: 'is_visible', multiUpload: true,
    columns: [['path', 'Image', 'image'], ['caption', 'Caption']],
    preview: () => '/gallery',
    fields: [
      { name: 'path', label: 'Image', kind: 'image', required: true },
      { name: 'caption', label: 'Caption', kind: 'text' },
      { name: 'alt', label: 'Alt text (accessibility)', kind: 'text' },
      vis,
    ],
  },
  nav: {
    table: 'nav_links', label: 'Navigation', singular: 'link', title: 'label', sortable: true, visible: 'is_visible',
    columns: [['label', 'Label'], ['location', 'Menu'], ['url', 'URL']],
    filter: { column: 'location', options: { header: 'Header', footer: 'Footer' }, label: 'Header & footer' },
    preview: () => '/',
    fields: [
      { name: 'location', label: 'Menu', kind: 'select', options: { header: 'Header', footer: 'Footer' } },
      { name: 'label', label: 'Label', kind: 'text', required: true },
      { name: 'page_id', label: 'Link to a page (overrides URL)', kind: 'select', optionsFrom: 'pages', nullable: true, int: true },
      { name: 'url', label: 'Custom URL', kind: 'text', default: '/' },
      { name: 'new_tab', label: 'Open in new tab', kind: 'bool' },
      vis,
    ],
  },
  users: {
    table: 'users', label: 'Users', singular: 'user', title: 'name', soft: true, superOnly: true,
    columns: [['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['last_login', 'Last login']],
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'email', label: 'Email', kind: 'text', required: true },
      { name: 'role', label: 'Role', kind: 'select', options: { editor: 'Editor (content only)', super: 'Super Admin (everything)' } },
      { name: 'password', label: 'Password (blank = keep)', kind: 'password', virtual: true },
    ],
  },
};

const eyebrowTitle = [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }];
const button = (p = 'btn') => [{ name: p + '_text', label: 'Button text', kind: 'text' }, { name: p + '_url', label: 'Button link', kind: 'text' }];

export const BACKGROUNDS = { cream: 'Cream', dim: 'Cream (alt)', wine: 'Wine', black: 'Black' };

export const SECTION_TYPES = {
  hero: { label: 'Hero', fields: [
    { name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Headline', kind: 'text' },
    { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, ...button('btn1'), ...button('btn2'),
    { name: 'image', label: 'Main image', kind: 'image' }, { name: 'image2', label: 'Second image', kind: 'image' }, { name: 'image3', label: 'Third image', kind: 'image' },
    { name: 'badge', label: 'Round badge text', kind: 'text' }] },
  marquee: { label: 'Marquee', fields: [{ name: 'items', label: 'Phrases (one per line)', kind: 'textarea' }] },
  text_image: { label: 'Text + Image', fields: [...eyebrowTitle, { name: 'body', label: 'Body (blank line = new paragraph)', kind: 'textarea', rows: 6 },
    { name: 'image', label: 'Image', kind: 'image' }, ...button(), { name: 'side', label: 'Image side', kind: 'select', options: { right: 'Right', left: 'Left' } }] },
  feature_list: { label: 'Feature List', fields: [...eyebrowTitle, { name: 'subtitle', label: 'Sub text', kind: 'textarea' },
    { name: 'items', label: 'Features', kind: 'repeater', fields: [{ name: 'icon', label: 'Number / year', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }, { name: 'text', label: 'Text', kind: 'textarea' }] }] },
  featured_items: { label: 'Featured Menu Items', fields: [...eyebrowTitle, { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, { name: 'limit', label: 'How many', kind: 'number' }, ...button()] },
  signature_coffee: { label: 'Signature Coffee (cup cards)', fields: [...eyebrowTitle, { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, { name: 'limit', label: 'How many drinks', kind: 'number' }, ...button()], note: 'Shows the drinks in your Coffee category, featured ones first.' },
  category_showcase: { label: 'Category Showcase (pinned scroll)', fields: eyebrowTitle },
  stats: { label: 'Stats', fields: [{ name: 'items', label: 'Counters', kind: 'repeater', fields: [
    { name: 'number', label: 'Number', kind: 'number' }, { name: 'suffix', label: 'Suffix (k+, %)', kind: 'text' }, { name: 'label', label: 'Label', kind: 'text' }] }] },
  testimonials: { label: 'Testimonials', fields: eyebrowTitle, note: 'Reviews are managed under Testimonials.' },
  gallery_strip: { label: 'Gallery Strip', fields: [...eyebrowTitle, { name: 'limit', label: 'How many', kind: 'number' }, ...button()], note: 'Photos are managed under Gallery.' },
  cta_banner: { label: 'CTA Banner', fields: [{ name: 'title', label: 'Title', kind: 'text' }, { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, ...button()] },
  map_hours: { label: 'Map / Hours', fields: [...eyebrowTitle, { name: 'subtitle', label: 'Sub text', kind: 'textarea' }], note: 'Address, hours and map come from Site Settings.' },
  rich_text: { label: 'Rich Text', fields: [{ name: 'title', label: 'Title', kind: 'text' }, { name: 'body', label: 'Body (blank line = new paragraph)', kind: 'textarea', rows: 8 }] },
  faq: { label: 'FAQ', fields: [{ name: 'title', label: 'Title', kind: 'text' }, { name: 'items', label: 'Questions', kind: 'repeater', fields: [
    { name: 'q', label: 'Question', kind: 'text' }, { name: 'a', label: 'Answer', kind: 'textarea' }] }] },
  team: { label: 'Team', fields: eyebrowTitle, note: 'People are managed under Team.' },
};

/**
 * Blocks of the phone-only home page, in default order. The admin "Mobile Home" screen can reorder,
 * hide and edit them; values are stored as JSON in settings.mobile_home = { order, hidden, data }.
 * Empty fields fall back to the matching desktop home section / site content.
 */
export const MOBILE_BLOCKS = {
  hero: { label: 'Hero', note: 'Leave a field empty to use the Home page hero.', fields: [
    { name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Headline', kind: 'text' },
    { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, ...button('btn1'), ...button('btn2'),
    { name: 'image', label: 'Main photo (arch)', kind: 'image' }, { name: 'image2', label: 'Second photo (capsule)', kind: 'image' },
    { name: 'badge', label: 'Round badge text', kind: 'text' }] },
  actions: { label: 'Quick buttons (Menu / Call / Directions / WhatsApp)', fields: [], note: 'Numbers and address come from Site Settings.' },
  facts: { label: 'Stats strip', fields: [{ name: 'items', label: 'Three numbers (leave empty for automatic: dishes, collections, rating)', kind: 'repeater', fields: [
    { name: 'number', label: 'Number', kind: 'text' }, { name: 'label', label: 'Label', kind: 'text' }] }] },
  categories: { label: 'Categories row', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }] },
  signature: { label: 'Signature coffee', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }, { name: 'limit', label: 'How many drinks', kind: 'number' }] },
  favourites: { label: 'Guest favourites (dishes)', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }, { name: 'limit', label: 'How many dishes', kind: 'number' }] },
  story: { label: 'Our story', note: 'Leave empty to use the Home page story section.', fields: [...eyebrowTitle, { name: 'body', label: 'Text', kind: 'textarea', rows: 5 }, { name: 'image', label: 'Photo', kind: 'image' }, ...button()] },
  reviews: { label: 'Reviews', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }] },
  gallery: { label: 'Gallery collage', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }, { name: 'limit', label: 'How many photos (up to 6)', kind: 'number' }] },
  visit: { label: 'Visit us card', fields: [{ name: 'eyebrow', label: 'Small label', kind: 'text' }, { name: 'title', label: 'Title', kind: 'text' }] },
  closing: { label: 'Closing call-to-action', note: 'Leave empty to use the Home page CTA banner.', fields: [{ name: 'title', label: 'Title', kind: 'text' }, { name: 'subtitle', label: 'Sub text', kind: 'textarea' }, ...button()] },
};
export const MOBILE_ORDER = Object.keys(MOBILE_BLOCKS);

export const SETTINGS_GROUPS = {
  Brand: [['cafe_name', 'Café name', 'text'], ['tagline', 'Tagline', 'text'], ['logo', 'Logo (optional)', 'image'], ['favicon', 'Favicon', 'image'], ['footer_text', 'Footer text', 'text'], ['currency', 'Currency symbol', 'text']],
  Contact: [['phone', 'Phone', 'text'], ['whatsapp', 'WhatsApp number (digits)', 'text'], ['email', 'Public email', 'text'], ['notify_email', 'Send contact messages to', 'text'],
    ['address', 'Street address', 'text'], ['city', 'City / area', 'text'], ['map_embed', 'Google Maps embed URL or iframe code', 'textarea']],
  Social: [['instagram', 'Instagram URL', 'text'], ['facebook', 'Facebook URL', 'text'], ['tiktok', 'TikTok URL', 'text']],
  'SEO & tracking': [['seo_title', 'Default SEO title', 'text'], ['seo_description', 'Default SEO description', 'textarea'], ['og_image', 'Default share image', 'image'], ['ga_id', 'Google Analytics ID', 'text']],
  Behaviour: [['preloader', 'Show first-visit preloader', 'bool'], ['cookie_notice', 'Show cookie notice', 'bool']],
};
