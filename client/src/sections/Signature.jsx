import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Img from '../components/Img.jsx';
import { FadeUp, EASE } from '../components/Motion.jsx';
import { Wrap, SectionHead } from '../components/Layout.jsx';
import { useSite } from '../lib/site.jsx';
import { money } from '../lib/utils.js';
import { A } from './Hero.jsx';

function CupCard({ item, index }) {
  const { currency, site } = useSite();
  const cat = site.categories.find((c) => c.id === item.category_id);
  const temps = (item.temps || []).map((t) => t.name).join(' / ') || 'Hot';
  const sale = item.sale_price > 0 ? item.sale_price : null;
  return (
    <motion.li className="flex w-[62vw] shrink-0 snap-start sm:w-[44vw] md:w-[calc((100%-4rem)/5)]" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.8, ease: EASE, delay: (index % 5) * 0.07 }}>
      <Link to={'/menu/item/' + item.slug} data-cursor="View" className="group flex h-full w-full flex-col rounded-[1.6rem] bg-wine/[0.09] p-3 transition-colors duration-500 hover:bg-wine/[0.16]" aria-label={item.name}>
        <div className="overflow-hidden rounded-[1.2rem] bg-dim">
          <Img path={item.image} alt={item.name} w={640} h={640} sizes="(max-width:768px) 60vw, 20vw" className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
        </div>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-5 text-center">
          <h3 className="font-display min-h-[3.6rem] text-[1.7rem] leading-tight text-wine">{item.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-ink/60">{item.short_desc}</p>
          <p className="font-display mt-auto pt-4 text-xl text-wine">{sale ? <><s className="mr-1.5 text-sm opacity-50">{money(item.price, currency)}</s>{money(sale, currency)}</> : money(item.price, currency)}</p>
          <div className="mt-3 flex items-center justify-between border-t border-wine/15 pt-3 text-sm text-ink/70"><span>{cat?.name || 'Coffee'}</span><span>{temps}</span></div>
        </div>
      </Link>
    </motion.li>
  );
}

/** Signature coffee rail: illustrated cups pop out of tinted cards. Featured coffees come first. */
export function SignatureCoffee({ d = {}, bare = false }) {
  const { site } = useSite();
  const ref = useRef(null);
  const coffeeId = site.categories.find((c) => /coffee/i.test(c.slug))?.id;
  const items = site.items.filter((i) => i.category_id === coffeeId).sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, Math.max(1, +d.limit || 8));
  if (!items.length) return null;
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  const body = (
    <>
      <SectionHead eyebrow={d.eyebrow ?? 'Signature coffee'} title={d.title ?? 'Brewed to be remembered'} sub={d.subtitle}
        action={<div className="flex items-center gap-3">
          {d.btn_text && <A href={d.btn_url || '/menu/coffee'} className="btn btn-outline">{d.btn_text} <span aria-hidden="true">→</span></A>}
          {items.length > 5 && <><button type="button" onClick={() => scroll(-1)} aria-label="Previous drinks" className="grid h-12 w-12 place-items-center rounded-full border border-current/30 transition-colors hover:bg-wine hover:text-cream">←</button>
            <button type="button" onClick={() => scroll(1)} aria-label="Next drinks" className="grid h-12 w-12 place-items-center rounded-full bg-wine text-cream transition-transform hover:scale-105">→</button></>}
        </div>} />
      <ul ref={ref} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-2 md:mx-0 md:px-0">
        {items.map((it, i) => <CupCard key={it.id} item={it} index={i} />)}
      </ul>
    </>
  );
  return bare ? <FadeUp>{body}</FadeUp> : <Wrap pad>{body}</Wrap>;
}
