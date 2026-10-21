import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSite, useSeo } from '../lib/site.jsx';
import { src } from '../lib/utils.js';
import Img from '../components/Img.jsx';
import { FadeUp, EASE } from '../components/Motion.jsx';
import Sections from '../sections/index.jsx';
import { PageHero } from './shared.jsx';

export default function GalleryPage() {
  const { site, page } = useSite();
  const p = page('gallery');
  const rows = site.gallery;
  const [open, setOpen] = useState(-1);
  useSeo({ title: p?.seo_title || 'Gallery', description: p?.seo_description });
  useEffect(() => {
    if (open < 0) return undefined;
    const key = (e) => { if (e.key === 'Escape') setOpen(-1); if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % rows.length); if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + rows.length) % rows.length); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [open, rows.length]);
  return (
    <>
      <PageHero eyebrow="Gallery" title={p?.title || 'Gallery'} kicker="Moments" lead="A look inside the café — the room, the plates and the pours." image={site.gallery[1]?.path} image2={site.gallery[2]?.path}>
        <p className="flex items-center gap-3 text-sm text-cream/75"><span className="font-display text-4xl text-cream">{site.gallery.length}</span> photos · tap any to enlarge</p>
      </PageHero>
      <section className="layer bg-cream px-5 py-20 md:px-10" style={{ zIndex: 2 }}><div className="mx-auto max-w-[1500px]">
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {rows.map((g, i) => (
            <FadeUp as="li" key={g.id} delay={(i % 3) * 0.08} className="mb-4 break-inside-avoid" data-cursor="View">
              <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-[1.6rem]" aria-label={`Open image: ${g.alt || g.caption || i + 1}`}>
                <Img path={g.path} alt={g.alt || g.caption} w={800} h={[600, 800, 700][i % 3]} sizes="(max-width:768px) 90vw, 33vw" className="w-full transition-transform duration-[1200ms] group-hover:scale-105" />
                {g.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-14 text-left text-sm text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">{g.caption}</span>}
              </button>
            </FadeUp>
          ))}
        </ul>
        {!rows.length && <p className="py-20 text-center opacity-60">Photos are coming soon.</p>}
      </div></section>
      {p && <Sections sections={p.sections} />}
      <AnimatePresence>
        {open >= 0 && (
          <motion.div className="on-dark fixed inset-0 z-[160] grid place-items-center bg-black/92 p-4" role="dialog" aria-modal="true" aria-label="Image viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(-1)}>
            <button className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-cream text-2xl text-wine" aria-label="Close" onClick={() => setOpen(-1)} autoFocus>×</button>
            <button className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-cream text-2xl text-wine" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + rows.length) % rows.length); }}>‹</button>
            <button className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-cream text-2xl text-wine" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % rows.length); }}>›</button>
            <motion.figure key={open} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }} className="max-w-[92vw] text-center text-cream" onClick={(e) => e.stopPropagation()}>
              <img src={src(rows[open].path)} alt={rows[open].alt || ''} className="max-h-[80svh] rounded-2xl object-contain" />
              {rows[open].caption && <figcaption className="mt-3 text-sm">{rows[open].caption}</figcaption>}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

