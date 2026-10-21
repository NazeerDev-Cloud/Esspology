import { src, thumb } from '../lib/utils.js';

/** Responsive image with explicit dimensions (no layout shift). Falls back to an on-brand tile when empty. */
export default function Img({ path, alt = '', className = '', w = 1200, h = 900, eager = false, sizes = '(max-width: 768px) 100vw, 50vw', ...rest }) {
  if (!path) {
    return <div className={className} style={{ aspectRatio: `${w}/${h}` }} role="img" aria-label={alt}><div className="h-full w-full bg-dim" /></div>;
  }
  const isWebp = path.endsWith('.webp');
  return (
    <img src={src(path)} srcSet={isWebp ? `${thumb(path)} 640w, ${src(path)} 1800w` : undefined} sizes={isWebp ? sizes : undefined}
      alt={alt} width={w} height={h} className={className} decoding="async" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} {...rest} />
  );
}
