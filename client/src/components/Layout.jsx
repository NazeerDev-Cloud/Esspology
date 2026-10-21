import { FadeUp, Split } from './Motion.jsx';

/** Page-width container. `pad` adds the standard vertical rhythm used by every section. */
export function Wrap({ children, className = '', narrow = false, pad = false }) {
  return <div className={`mx-auto px-5 md:px-10 ${narrow ? 'max-w-[900px]' : 'max-w-[1500px]'} ${pad ? 'py-24 md:py-36' : ''} ${className}`}>{children}</div>;
}

/** Small uppercase label with a leading rule. */
export function Eyebrow({ children, className = '' }) {
  if (!children) return null;
  return <FadeUp className={`eyebrow mb-5 opacity-80 ${className}`}>{children}</FadeUp>;
}

export const TITLE = 'font-display text-[clamp(2rem,4.5vw,4.33rem)] font-medium leading-[0.98]';

/** Eyebrow + headline + optional sub text, with an optional action (button) aligned to the right. */
export function SectionHead({ eyebrow, title, sub, action, className = '', split = true }) {
  return (
    <header className={`mb-12 flex flex-wrap items-end justify-between gap-8 md:mb-16 ${className}`}>
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        {title && (split ? <Split text={title} className={TITLE} /> : <h2 className={TITLE}>{title}</h2>)}
        {sub && <FadeUp delay={0.1}><p className="mt-5 max-w-[52ch] text-lg opacity-70 md:text-xl">{sub}</p></FadeUp>}
      </div>
      {action && <FadeUp>{action}</FadeUp>}
    </header>
  );
}
