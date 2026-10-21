import { useParams } from 'react-router-dom';
import { useSite, useSeo } from '../lib/site.jsx';
import Sections from '../sections/index.jsx';
import { PageHero, NotFound, useFirstTone } from './shared.jsx';
import MobileHome from './MobileHome.jsx';
import { useIsMobile } from '../lib/useMobile.js';

export default function PageView({ slug: fixed }) {
  const { slug: param } = useParams();
  const slug = fixed || param;
  const { page } = useSite();
  const p = page(slug);
  const mobile = useIsMobile();
  useSeo({ title: p?.seo_title || p?.title, description: p?.seo_description, image: p?.og_image });
  useFirstTone(slug === 'home' && !mobile ? p : null);
  if (!p) return <NotFound />;
  // Phones get their own app-style home page (see MobileHome); desktop/tablet keep the section-based home.
  if (slug === 'home' && mobile) return <MobileHome page={p} />;
  return (
    <>
      {slug !== 'home' && <PageHero eyebrow={p.title} title={p.title} kicker="Esspology" image={p.sections.find((x) => x.data?.image)?.data.image} />}
      <Sections sections={p.sections} layerFirst={slug !== 'home'} />
      {!p.sections.length && slug !== 'home' && <section className="bg-cream px-5 py-32 text-center opacity-60">This page is being prepared. Please check back soon.</section>}
    </>
  );
}

