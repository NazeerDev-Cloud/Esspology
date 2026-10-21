import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Img from './Img.jsx';
import { money } from '../lib/utils.js';
import { useSite } from '../lib/site.jsx';

/** Menu item card: image zoom + wine wash on hover, arrow button, tags, price beside the name. */
export default function ItemCard({ item, index = 0, temp = null }) {
  const { currency, site } = useSite();
  const tPrice = temp && temp.price !== "" && temp.price != null ? Number(temp.price) : null;
  const sale = !tPrice && item.sale_price != null && item.sale_price > 0 ? item.sale_price : null;
  const shownPrice = tPrice ?? item.price;
  const shownImage = temp?.image || item.image;
  const category = site.categories.find((c) => c.id === item.category_id);
  return (
    <motion.article layout="position" className="group h-full" data-cursor="View" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}>
      <Link to={`/menu/item/${item.slug}${temp ? "?temp=" + encodeURIComponent(temp.name) : ""}`} className="block h-full" aria-label={item.name + (temp ? " (" + temp.name + ")" : "")}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] bg-dim shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]">
          <Img path={shownImage} alt={item.name} w={640} h={800} sizes="(max-width:768px) 90vw, 25vw"
            className={`h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110 ${item.is_available ? '' : 'grayscale'}`} />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-wine/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {category && <span className="eyebrow absolute bottom-4 left-4 translate-y-3 text-[0.62rem] text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{category.name}</span>}
          <span className="absolute right-3 top-3 grid h-11 w-11 scale-50 place-items-center rounded-full bg-cream text-lg text-wine opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100" aria-hidden="true">↗</span>
          {!item.is_available && <span className="absolute bottom-3 left-3 rounded-full bg-black px-3 py-1 text-xs text-cream">Sold out</span>}
          {item.is_available && item.tags.length > 0 && (
            <ul className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 2).map((t) => <li key={t} className="eyebrow rounded-full bg-cream/90 px-3 py-1 text-[0.62rem] text-wine backdrop-blur">{t}</li>)}
            </ul>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-0.5 border-b border-current/15 pb-2 md:mt-5 md:flex-row md:items-baseline md:justify-between md:gap-4 md:pb-3">
          <h3 className="font-display text-[1.15rem] font-medium leading-tight md:text-[1.7rem]">{item.name}</h3>
          <span className="font-display shrink-0 text-base italic text-wine md:text-xl">{sale ? <><s className="mr-1.5 text-sm not-italic opacity-50">{money(shownPrice, currency)}</s>{money(sale, currency)}</> : money(shownPrice, currency)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs opacity-70 md:mt-3 md:text-sm">{item.short_desc}</p>
        {item.temps?.length > 0 && <p className="eyebrow mt-3 text-[0.62rem] text-wine">{temp ? temp.name : item.temps.map((t) => t.name).join(" · ")}</p>}
      </Link>
    </motion.article>
  );
}
