import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useSite, useSeo } from '../lib/site.jsx';
import { money } from '../lib/utils.js';
import Img from '../components/Img.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { FadeUp, Split, EASE } from '../components/Motion.jsx';
import Sections from '../sections/index.jsx';
import { SignatureCoffee } from '../sections/Signature.jsx';
import { PageHero, NotFound } from './shared.jsx';

function Tabs({ cats, active, onPick }) {
  return (
    <div className="sticky top-[76px] z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-xl">
      <div role="tablist" aria-label="Menu categories" className="no-scrollbar mx-auto flex max-w-[1500px] gap-8 overflow-x-auto px-5 md:px-10">
        <LayoutGroup id="tabs">
          {[{ slug: 'all', name: 'All' }, ...cats].map((c) => (
            <button key={c.slug} role="tab" aria-selected={active === c.slug} onClick={() => onPick(c.slug)}
              className={`relative whitespace-nowrap py-5 text-[0.95rem] font-medium transition-opacity ${active === c.slug ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
              {c.name}
              {active === c.slug && <motion.span layoutId="tab-underline" className="absolute inset-x-0 bottom-0 h-[3px] rounded bg-wine" transition={{ duration: 0.5, ease: EASE }} />}
            </button>
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
}

export function MenuPage() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const { site, page } = useSite();
  const active = cat && site.categories.some((c) => c.slug === cat) ? cat : 'all';
  const current = site.categories.find((c) => c.slug === active);
  const p = page('menu');
  const [sp, setSp] = useSearchParams();
  const isCoffee = current?.slug === 'coffee';
  const type = isCoffee && ['hot', 'cold'].includes(sp.get('type')) ? sp.get('type') : 'all';
  const pick = { hot: (t) => /hot/i.test(t.name), cold: (t) => /ice|cold/i.test(t.name) };
  const inCat = site.items.filter((i) => active === 'all' || i.category_id === current?.id);
  const items = type === 'all' ? inCat : inCat.filter((i) => (i.temps || []).some(pick[type]));
  const counts = { all: inCat.length, hot: inCat.filter((i) => (i.temps || []).some(pick.hot)).length, cold: inCat.filter((i) => (i.temps || []).some(pick.cold)).length };

  useSeo({
    title: current ? `${current.name} — Menu` : p?.seo_title || 'Menu', description: current?.description || p?.seo_description, image: current?.image || p?.og_image,
    jsonld: { '@context': 'https://schema.org', '@type': 'Menu', name: 'Menu', hasMenuSection: site.categories.map((c) => ({ '@type': 'MenuSection', name: c.name, hasMenuItem: site.items.filter((i) => i.category_id === c.id).map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.short_desc, offers: { '@type': 'Offer', price: String(i.sale_price || i.price) } })) })) },
  });
  if (cat && !current) return <NotFound />;

  return (
    <>
      <PageHero eyebrow="Menu" title={current ? current.name : p?.title || 'Menu'} lead={current?.description || 'Breakfast, sandwiches, salads and coffee — made fresh to order.'} kicker={current ? 'Collection' : 'Our menu'} image={current?.image || site.categories[0]?.image} image2={site.items.find((i) => i.image && (!current || i.category_id === current.id))?.image} crumbs={current ? [['Menu', '/menu'], [current.name]] : [['Menu']]}>
        <ul className="flex flex-wrap gap-2" aria-label="Jump to a collection">
          {site.categories.map((c) => <li key={c.id}><Link to={'/menu/' + c.slug} className={'inline-block rounded-full border px-4 py-1.5 text-sm transition-colors ' + (current?.id === c.id ? 'border-cream bg-cream text-wine' : 'border-cream/30 hover:bg-cream hover:text-wine')}>{c.name}</Link></li>)}
        </ul>
      </PageHero>
      {(active === 'all') && (
        <section className="layer relative bg-cream" style={{ zIndex: 2 }}><div className="mx-auto max-w-[1500px] px-5 pt-20 md:px-10 md:pt-28"><SignatureCoffee bare d={{ eyebrow: 'Signature coffee', title: 'Brewed to be remembered', subtitle: 'Our most-loved drinks, hot or iced.', limit: 8 }} /></div></section>
      )}
      <section className="layer bg-cream pb-32" style={{ zIndex: 2 }}>
        <Tabs cats={site.categories} active={active} onPick={(s) => navigate(s === 'all' ? '/menu' : `/menu/${s}`, { replace: false })} />
        <div className="mx-auto max-w-[1500px] px-5 pt-12 md:px-10">
          {isCoffee && (
            <div role="tablist" aria-label="Hot or cold coffee" className="mb-10 inline-flex gap-1 rounded-full bg-wine/10 p-1.5">
              {[['all', 'All coffee'], ['hot', 'Hot coffee'], ['cold', 'Cold coffee']].map(([k, label]) => (
                <button key={k} role="tab" aria-selected={type === k} onClick={() => setSp(k === 'all' ? {} : { type: k })} className={'relative rounded-full px-6 py-3 text-sm font-medium transition-colors ' + (type === k ? 'text-cream' : 'text-wine hover:bg-wine/10')}>
                  {type === k && <motion.span layoutId="coffee-type" className="absolute inset-0 rounded-full bg-wine" transition={{ duration: 0.45, ease: EASE }} />}
                  <span className="relative">{label} <span className="opacity-60">{counts[k]}</span></span>
                </button>
              ))}
            </div>
          )}
          {isCoffee && type === 'all' ? (
            <div className="flex flex-col gap-20">
              {[['hot', 'Hot coffee', 'Served steaming, straight from the machine.'], ['cold', 'Cold coffee', 'Iced, blended and chilled.']].map(([k, label, note]) => {
                const group = inCat.filter((i) => (i.temps || []).some(pick[k]));
                if (!group.length) return null;
                return (
                  <div key={k} id={k + '-coffee'}>
                    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink/15 pb-4">
                      <h2 className="font-display text-[clamp(1.83rem,3.5vw,3rem)] font-medium leading-none">{label}</h2>
                      <p className="text-sm opacity-60">{group.length} {group.length === 1 ? 'drink' : 'drinks'} · {note}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
                      {group.map((it, i) => <ItemCard key={it.id + k} item={it} index={i} temp={(it.temps || []).find(pick[k])} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {items.map((it, i) => (
                  <motion.div layout key={it.id + type} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.55, ease: EASE }}>
                    <ItemCard item={it} index={i} temp={type === 'all' ? null : (it.temps || []).find(pick[type])} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          {!items.length && <p className="py-20 text-center opacity-60">Nothing here yet. Please check back soon.</p>}
        </div>
      </section>
      {p && <Sections sections={p.sections} />}
    </>
  );
}

export function ItemPage() {
  const { slug } = useParams();
  const { site, currency } = useSite();
  const item = site.items.find((i) => i.slug === slug);
  const cat = item && site.categories.find((c) => c.id === item.category_id);
  const [shown, setShown] = useState(null);
  const [ti, setTi] = useState(0);
  const [qs] = useSearchParams();
  const want = (qs.get('temp') || '').toLowerCase();
  useEffect(() => { setShown(null); const k = item ? (item.temps || []).findIndex((t) => t.name.toLowerCase() === want) : -1; setTi(k > 0 ? k : 0); }, [slug, want]); // eslint-disable-line react-hooks/exhaustive-deps
  useSeo({ title: item ? `${item.name} — ${cat?.name}` : 'Not found', description: item?.short_desc, image: item?.image,
    jsonld: item && { '@context': 'https://schema.org', '@type': 'MenuItem', name: item.name, description: item.short_desc, offers: { '@type': 'Offer', price: String(item.sale_price || item.price) } } });
  if (!item) return <NotFound />;
  const related = site.items.filter((i) => i.category_id === item.category_id && i.id !== item.id).slice(0, 4);
  const gallery = [item.image, ...item.images.map((x) => x.path)].filter(Boolean);
  const temps = item.temps || [];
  const temp = temps[ti] || null;
  const cover = shown || temp?.image || item.image;
  const base = temp && temp.price !== "" && temp.price != null ? Number(temp.price) : null;
  const sale = !base && item.sale_price > 0 ? item.sale_price : null;
  const price = base ?? item.price;
  return (
    <>
      <article className="bg-cream px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <div className="mx-auto grid max-w-[1500px] gap-12 md:grid-cols-2 md:gap-20">
          <div className="md:sticky md:top-28 md:self-start">
            <motion.div initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(-90px -90px -90px -90px)' }} transition={{ duration: 1.3, ease: EASE, delay: 0.2 }} className="overflow-hidden rounded-[2rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={cover} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                  <Img path={cover} alt={item.name + (temp ? " (" + temp.name + ")" : "")} eager w={1000} h={1100} sizes="(max-width:768px) 100vw, 50vw" className="aspect-[10/11] w-full object-cover" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            {gallery.length > 1 && <div className="mt-3 flex gap-3">{gallery.map((g) => <button key={g} onClick={() => setShown(g)} aria-label="Show image" className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${(cover === g) ? 'border-wine' : 'border-transparent'}`}><Img path={g} alt="" w={160} h={160} sizes="80px" className="h-full w-full object-cover" /></button>)}</div>}
          </div>
          <div className="md:pt-8">
            <nav aria-label="Breadcrumb" className="eyebrow mb-6 opacity-60"><Link to="/menu" className="link-u">Menu</Link> / <Link to={`/menu/${cat?.slug}`} className="link-u">{cat?.name}</Link></nav>
            <Split as="h1" gate text={item.name} className="font-display text-[clamp(2.33rem,4.99vw,4.99rem)] font-medium leading-[0.95]" />
            <FadeUp delay={0.2} className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-display text-4xl italic text-wine">{sale && <s className="mr-2 text-2xl opacity-50">{money(price, currency)}</s>}{money(sale || price, currency)}</span>
              {!item.is_available && <span className="rounded-full bg-black px-3 py-1 text-xs text-cream">Currently unavailable</span>}
              {item.tags.map((t) => <span key={t} className="eyebrow rounded-full bg-wine/10 px-3 py-1 text-[0.65rem] text-wine">{t}</span>)}
            </FadeUp>
            {item.short_desc && <FadeUp delay={0.25}><p className="mt-8 text-xl">{item.short_desc}</p></FadeUp>}
            <FadeUp delay={0.3}><p className="mt-5 max-w-[52ch] text-lg leading-relaxed opacity-70">{item.description}</p></FadeUp>
            {temps.length > 1 && (
              <FadeUp delay={0.33} className="mt-10">
                <h2 className="eyebrow mb-3 opacity-60">Serve it</h2>
                <div role="radiogroup" aria-label="Temperature" className="inline-flex gap-1 rounded-full bg-wine/10 p-1.5">
                  {temps.map((t, k) => (
                    <button key={t.name} type="button" role="radio" aria-checked={k === ti} onClick={() => { setTi(k); setShown(null); }}
                      className={"relative rounded-full px-7 py-3 text-sm font-medium transition-colors " + (k === ti ? "text-cream" : "text-wine hover:bg-wine/10")}>
                      {k === ti && <motion.span layoutId="temp-pill" className="absolute inset-0 rounded-full bg-wine" transition={{ duration: 0.45, ease: EASE }} />}
                      <span className="relative">{t.name}</span>
                    </button>
                  ))}
                </div>
              </FadeUp>
            )}
            {item.variants.length > 0 && (
              <FadeUp delay={0.35} className="mt-10 max-w-md"><h2 className="eyebrow mb-3 opacity-60">Sizes &amp; options</h2>
                <ul>{item.variants.map((v) => <li key={v.name} className="flex justify-between border-b border-ink/15 py-3"><span>{v.name}</span><span className="tabular-nums">{money(v.price, currency)}</span></li>)}</ul></FadeUp>
            )}
            <FadeUp delay={0.4} className="mt-10"><Link to={`/menu/${cat?.slug}`} className="btn btn-outline">← Back to {cat?.name}</Link></FadeUp>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section className="bg-dim px-5 py-24 md:px-10"><div className="mx-auto max-w-[1500px]">
          <Split text="You may also like" className="font-display mb-12 text-[clamp(1.83rem,3.82vw,3.33rem)] font-medium" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">{related.map((i, k) => <ItemCard key={i.id} item={i} index={k} />)}</div>
        </div></section>
      )}
    </>
  );
}

