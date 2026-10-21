import Hero from './Hero.jsx';
import { MarqueeSection, TextImage, FeatureList, FeaturedItems, Stats, CtaBanner, MapHours, RichText, Faq, Team } from './Blocks.jsx';
import { CategoryShowcase, Testimonials, GalleryStrip } from './Showcase.jsx';
import { SignatureCoffee } from './Signature.jsx';
import { useIsMobile } from '../lib/useMobile.js';

const MAP = {
  hero: Hero, marquee: MarqueeSection, text_image: TextImage, feature_list: FeatureList, featured_items: FeaturedItems,
  category_showcase: CategoryShowcase, stats: Stats, testimonials: Testimonials, gallery_strip: GalleryStrip,
  signature_coffee: SignatureCoffee, cta_banner: CtaBanner, map_hours: MapHours, rich_text: RichText, faq: Faq, team: Team,
};

export const BG = { cream: 'bg-cream text-ink', dim: 'bg-dim text-ink', wine: 'on-dark bg-wine text-cream', black: 'on-dark bg-black text-cream' };

/** Renders a page's visible sections in order. Sections overlap slightly with rounded tops for a layered, card-stack feel. */
export default function Sections({ sections, layerFirst = false }) {
  const mobile = useIsMobile();
  // Per-device visibility set in the page builder ("Show on phones / desktop").
  const list = sections.filter((s) => MAP[s.type] && !(mobile ? s.hide_mobile : s.hide_desktop));
  return list.map((s, i) => {
    const C = MAP[s.type];
    const prev = list[i - 1];
    const layered = (i > 0 || layerFirst) && s.type !== 'marquee' && (i === 0 || prev.type !== 'marquee');
    return (
      <section key={s.id} id={`section-${s.id}`} style={layered ? { zIndex: i } : undefined} className={`relative ${layered ? 'layer' : ''} ${BG[s.bg] || BG.cream}`}>
        <C d={s.data} />
      </section>
    );
  });
}
