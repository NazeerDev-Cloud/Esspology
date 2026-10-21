import { useState } from 'react';
import { useSite, useSeo } from '../lib/site.jsx';
import { api } from '../lib/api.js';
import { FadeUp, Magnetic } from '../components/Motion.jsx';
import Sections from '../sections/index.jsx';
import { PageHero } from './shared.jsx';

export default function ContactPage() {
  const { s, site, page } = useSite();
  const p = page('contact');
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [errs, setErrs] = useState({}), [state, setState] = useState('idle'), [msg, setMsg] = useState('');
  useSeo({ title: p?.seo_title || 'Contact', description: p?.seo_description });
  const wa = (s.whatsapp || '').replace(/\D+/g, '');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setState('busy'); setErrs({}); setMsg('');
    try { await api('/contact', { method: 'POST', body: f }); setState('done'); setF({ name: '', email: '', phone: '', subject: '', message: '', website: '' }); }
    catch (err) { setState('idle'); setErrs(err.data?.errors || {}); setMsg(err.data?.errors ? '' : err.message); }
  };
  const field = (k, label, type = 'text', extra = {}) => (
    <div className="relative">
      <input id={`c-${k}`} type={type} value={f[k]} onChange={set(k)} placeholder=" " aria-invalid={!!errs[k]} {...extra}
        className={`peer w-full rounded-2xl border bg-white px-5 pb-3 pt-7 text-base outline-none transition-colors focus:border-wine ${errs[k] ? 'border-wine' : 'border-ink/15'}`} />
      <label htmlFor={`c-${k}`} className="pointer-events-none absolute left-5 top-5 origin-left text-ink/55 transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75">{label}</label>
      {errs[k] && <p className="mt-1 px-2 text-sm text-wine" role="alert">{errs[k]}</p>}
    </div>
  );
  return (
    <>
      <PageHero eyebrow="Contact" title={p?.title || 'Contact'} kicker="Get in touch" lead="Questions, bookings for bigger groups, or just saying hello — we read everything." image={site.gallery[0]?.path} image2={site.gallery[3]?.path}>
        <p className="flex flex-wrap gap-3">
          {s.phone && <a href={'tel:' + s.phone.replace(/[^\d+]/g, '')} className="btn btn-light">Call {s.phone}</a>}
          {s.email && <a href={'mailto:' + s.email} className="btn btn-outline">Email us</a>}
        </p>
      </PageHero>
      <section className="layer bg-cream px-5 py-20 md:px-10 md:py-28" style={{ zIndex: 2 }}><div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-[1fr_1.15fr]">
        <FadeUp>
          <h2 className="font-display text-5xl font-light italic md:text-6xl">Say hello.</h2>
          <address className="mt-6 text-lg not-italic">{s.address}{s.city ? `, ${s.city}` : ''}</address>
          <ul className="mt-8 space-y-5">
            {s.phone && <li><span className="eyebrow block opacity-60">Phone</span><a className="link-u font-display text-3xl" href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a></li>}
            {s.email && <li><span className="eyebrow block opacity-60">Email</span><a className="link-u font-display text-3xl" href={`mailto:${s.email}`}>{s.email}</a></li>}
          </ul>
          {wa && <p className="mt-8"><Magnetic><a className="btn btn-primary" href={`https://wa.me/${wa}`} target="_blank" rel="noopener">Chat on WhatsApp</a></Magnetic></p>}
        </FadeUp>
        <FadeUp delay={0.15}>
          {state === 'done' ? (
            <div className="rounded-[2rem] bg-wine p-10 text-cream" role="status"><p className="font-display text-4xl italic">Thank you.</p><p className="mt-3 opacity-80">Your message is on its way. We will get back to you soon.</p>
              <button className="btn btn-light mt-6" onClick={() => setState('idle')}>Send another</button></div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4">
              {msg && <p className="rounded-2xl bg-wine/10 p-4 text-wine" role="alert">{msg}</p>}
              {field('name', 'Your name', 'text', { autoComplete: 'name', maxLength: 120 })}
              <div className="grid gap-4 sm:grid-cols-2">{field('email', 'Email', 'email', { autoComplete: 'email' })}{field('phone', 'Phone (optional)', 'tel', { autoComplete: 'tel' })}</div>
              {field('subject', 'Subject (optional)')}
              <div className="relative">
                <textarea id="c-message" rows={6} value={f.message} onChange={set('message')} placeholder=" " maxLength={5000} aria-invalid={!!errs.message}
                  className={`peer w-full rounded-2xl border bg-white px-5 pb-3 pt-7 outline-none focus:border-wine ${errs.message ? 'border-wine' : 'border-ink/15'}`} />
                <label htmlFor="c-message" className="pointer-events-none absolute left-5 top-5 origin-left text-ink/55 transition-all peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75">Message</label>
                {errs.message && <p className="mt-1 px-2 text-sm text-wine" role="alert">{errs.message}</p>}
              </div>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div><Magnetic><button className="btn btn-primary" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send message'} <span aria-hidden="true">→</span></button></Magnetic></div>
            </form>
          )}
        </FadeUp>
      </div></section>
      {p && <Sections sections={p.sections} />}
    </>
  );
}

