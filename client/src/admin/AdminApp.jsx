import logoLight from '../assets/logo/site-logo-light.png';
import logoDark from '../assets/logo/logo.png';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Btn, Icon, ToastProvider, inputCls, useToast } from './ui.jsx';
import { ResourceForm, ResourceList } from './Lists.jsx';
import { PageBuilder, SectionEditor } from './Builder.jsx';
import { Account, Activity, Dashboard, Media, Messages, Settings, Trash } from './Misc.jsx';
import MobileEditor from './MobileEditor.jsx';

const MetaCtx = createContext(null);
export const useMeta = () => useContext(MetaCtx);

function Login({ onDone }) {
  const toast = useToast();
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('/auth/login', { method: 'POST', body: { email, password: pw } }); onDone(r.user); } catch (e2) { setErr(e2.message); toast(e2.message, 'err'); }
    setBusy(false);
  };
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="on-dark relative hidden flex-col justify-between overflow-hidden bg-[#1b302d] p-12 text-white lg:flex">
        <span aria-hidden="true" className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/[0.04]" />
        <span aria-hidden="true" className="absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full bg-[#2f524d]" />
        <img src={logoLight} alt="Esspology" className="relative h-10 w-auto self-start" />
        <div className="relative max-w-md">
          <p className="eyebrow mb-3 text-white/60">Site management</p>
          <h2 className="font-display text-4xl">Everything on your café site, in one place.</h2>
          <ul className="mt-6 grid gap-3 text-white/80">
            {['Edit the menu, prices and photos', 'Design desktop and mobile home pages', 'Read messages and manage the gallery'].map((t) => <li key={t} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Icon name="check" className="h-3.5 w-3.5" /></span>{t}</li>)}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">© Esspology · Kohsar Market, Islamabad</p>
      </section>
      <section className="grid place-items-center bg-white p-6">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
          <img src={logoDark} alt="Esspology" className="mb-8 h-9 w-auto lg:hidden" />
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="mb-7 mt-1.5 text-sm text-black/55">Sign in to manage your website.</p>
          {err && <p className="mb-4 rounded-lg border border-[#f1c5c0] bg-[#fef3f2] p-3 text-sm text-[#b42318]" role="alert">{err}</p>}
          <label htmlFor="em" className="mb-1.5 block text-sm font-semibold">Email</label>
          <input id="em" type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mb-4`} />
          <label htmlFor="pw" className="mb-1.5 block text-sm font-semibold">Password</label>
          <input id="pw" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${inputCls} mb-6`} />
          <Btn type="submit" disabled={busy} className="w-full !py-3">{busy ? 'Signing in…' : 'Sign in'}</Btn>
          <p className="mt-6 text-center"><Link to="/" className="text-sm text-black/55 hover:text-wine">← Back to website</Link></p>
        </motion.form>
      </section>
    </main>
  );
}

const SUBTITLES = {
  '': 'Overview of your website at a glance.', categories: 'Organise how the menu is grouped.', items: 'Manage dishes, drinks, prices and photos.', pages: 'Edit pages, their sections and SEO.',
  testimonials: 'Guest reviews shown on the site.', team: 'The people behind the counter.', gallery: 'Photos shown in the gallery.', nav: 'Links in the header and footer.',
  mobile: 'Design the home page people see on phones.', settings: 'Contact details, hours, social links and SEO.', messages: 'Enquiries sent from the contact form.', media: 'Every image you have uploaded.',
  trash: 'Restore or permanently delete removed content.', activity: 'Who changed what, and when.', account: 'Change your password.', users: 'People who can sign in to this panel.',
};

function UserMenu({ user, onLogout, super_ }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);
  const initials = (user.name || user.email || '?').trim().slice(0, 1).toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-lg border border-transparent py-1 pl-1 pr-2 hover:border-[#e3e8ea] hover:bg-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-wine text-sm font-bold text-white">{initials}</span>
        <span className="hidden text-left leading-tight sm:block"><b className="block text-sm">{user.name}</b><small className="text-black/50">{super_ ? 'Super admin' : 'Editor'}</small></span>
        <Icon name="chevron" className="hidden h-4 w-4 text-black/40 sm:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[#e3e8ea] bg-white shadow-xl">
            <div className="border-b border-[#eef1f2] p-3.5"><b className="block text-sm">{user.name}</b><small className="break-all text-black/50">{user.email}</small></div>
            <Link role="menuitem" to="/admin/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-[#f4f6f8]"><Icon name="key" className="h-4 w-4" /> Change password</Link>
            <a role="menuitem" href="/" target="_blank" rel="noopener" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-[#f4f6f8]"><Icon name="external" className="h-4 w-4" /> View website</a>
            <button role="menuitem" type="button" onClick={onLogout} className="flex w-full items-center gap-2.5 border-t border-[#eef1f2] px-3.5 py-2.5 text-sm text-[#b42318] hover:bg-[#fef3f2]"><Icon name="logout" className="h-4 w-4" /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Shell({ user, onLogout }) {
  const meta = useMeta();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const link = ({ isActive }) => `relative flex items-center gap-3 rounded-lg px-3 py-2 text-[0.88rem] font-medium transition-colors duration-150 ${isActive ? 'text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'}`;
  const Nav = ({ to, end, icon, children }) => (
    <NavLink to={to} end={end} className={link}>
      {({ isActive }) => (<>
        {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white/[0.12]" transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}
        {isActive && <motion.span layoutId="nav-bar" className="absolute -left-4 bottom-2 top-2 w-1 rounded-r bg-[#7fd1c2]" transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}
        <Icon name={icon} className="relative h-[18px] w-[18px] shrink-0" /><span className="relative flex flex-1 items-center justify-between gap-2">{children}</span>
      </>)}
    </NavLink>
  );
  const Group = ({ title }) => <p className="eyebrow px-3 pb-1.5 pt-5 text-white/35">{title}</p>;
  const super_ = user.role === 'super';
  const content = meta.resources.filter((r) => r.key !== 'users');
  const titles = { mobile: 'Mobile Home', settings: 'Site Settings', messages: 'Messages', media: 'Media Library', trash: 'Trash', activity: 'Activity Log', account: 'My account' };
  const seg = loc.pathname.split('/')[2];
  const sub = loc.pathname.split('/')[3];
  const res = meta.resources.find((r) => r.key === seg);
  const inSections = loc.pathname.includes('/sections');
  const title = inSections ? 'Page sections' : (res && sub === 'new') ? `New ${res.singular}` : (res && sub) ? `Edit ${res.singular}` : !seg ? 'Dashboard' : titles[seg] || res?.label || (seg === 'sections' ? 'Edit section' : 'Admin');
  const subtitle = SUBTITLES[inSections ? 'pages' : seg || ''] || '';
  const crumb = seg ? (titles[seg] || res?.label || 'Pages') : null;

  return (
    <div className="admin min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <AnimatePresence>{open && <motion.button aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden" />}</AnimatePresence>
      <aside className={`on-dark admin-scroll fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col overflow-y-auto bg-[#1b302d] px-4 pb-4 pt-5 text-white transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <Link to="/admin" className="mb-2 flex items-center gap-3 px-2" aria-label="Dashboard"><img src={logoLight} alt="Esspology" className="h-8 w-auto" /><span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/70">Admin</span></Link>
        <nav aria-label="Admin" className="grid gap-0.5 pb-4"><LayoutGroup id="admin-nav">
          <Nav to="/admin" end icon="home">Dashboard</Nav>
          <Group title="Content" />
          {content.map((r) => <Nav key={r.key} to={`/admin/${r.key}`} icon={r.key}>{r.label}</Nav>)}
          <Nav to="/admin/mobile" icon="mobile"><span>Mobile Home</span><span className="rounded bg-[#7fd1c2]/20 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-[#9be4d6]">Phone</span></Nav>
          <Group title="Inbox & files" />
          <Nav to="/admin/messages" icon="messages"><span>Messages</span>{meta.unread > 0 && <span className="rounded-full bg-[#e5484d] px-2 py-0.5 text-[0.68rem] font-bold text-white">{meta.unread}</span>}</Nav>
          <Nav to="/admin/media" icon="media">Media Library</Nav>
          <Nav to="/admin/trash" icon="trash">Trash</Nav>
          {super_ && <><Group title="Administration" />
            <Nav to="/admin/settings" icon="settings">Site Settings</Nav><Nav to="/admin/users" icon="users">Users</Nav><Nav to="/admin/activity" icon="activity">Activity Log</Nav></>}
        </LayoutGroup></nav>
        <a href="/" target="_blank" rel="noopener" className="mt-auto flex items-center justify-between rounded-lg border border-white/15 px-3 py-2.5 text-sm text-white/80 hover:bg-white/10">View live website <Icon name="external" className="h-4 w-4" /></a>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#e3e8ea] bg-white/85 px-4 py-2.5 backdrop-blur md:px-8">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#e3e8ea] bg-white lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-black/50">
            <Link to="/admin" className="hover:text-wine">Admin</Link>
            {crumb && <><span aria-hidden="true">/</span><span className="truncate font-medium text-black/80">{crumb}</span></>}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <a href="/" target="_blank" rel="noopener" className="hidden items-center gap-2 rounded-lg border border-[#e3e8ea] bg-white px-3 py-1.5 text-sm font-medium hover:border-wine/50 sm:flex">View site <Icon name="external" className="h-3.5 w-3.5" /></a>
            <Link to="/admin/messages" aria-label={`Messages (${meta.unread} unread)`} className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-[#eef1f2]"><Icon name="bell" />{meta.unread > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e5484d] px-1 text-[0.6rem] font-bold text-white">{meta.unread}</span>}</Link>
            <UserMenu user={user} onLogout={onLogout} super_={super_} />
          </div>
        </header>
        <main id="content" className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 md:px-8">
          <div className="mb-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <h1 className="font-display text-[1.7rem]">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-black/55">{subtitle}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <Routes location={loc}>
              <Route index element={<Dashboard user={user} />} />
              <Route path="mobile" element={<MobileEditor />} />
              <Route path="settings" element={super_ ? <Settings /> : <Navigate to="/admin" />} />
              <Route path="messages" element={<Messages />} />
              <Route path="media" element={<Media />} />
              <Route path="trash" element={<Trash />} />
              <Route path="activity" element={super_ ? <Activity /> : <Navigate to="/admin" />} />
              <Route path="account" element={<Account />} />
              <Route path="pages/:id/sections" element={<PageBuilder />} />
              <Route path="sections/:id" element={<SectionEditor />} />
              <Route path=":key" element={<ResourceList />} />
              <Route path=":key/:id" element={<ResourceForm />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Authed({ user, setUser }) {
  const [meta, setMeta] = useState(null);
  const refresh = useCallback(() => api('/admin/meta').then(setMeta), []);
  useEffect(() => { refresh(); }, [refresh]);
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); };
  if (!meta) return <div className="admin grid min-h-screen place-items-center text-black/50">Loading admin…</div>;
  return <MetaCtx.Provider value={{ ...meta, refresh }}><Shell user={user} onLogout={logout} /></MetaCtx.Provider>;
}

export default function AdminApp() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { document.title = 'Admin · Esspology'; api('/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)); }, []);
  if (user === undefined) return <div className="admin grid min-h-screen place-items-center text-black/50">Loading…</div>;
  return (
    <ToastProvider>
      <div className="admin">{user ? <Authed user={user} setUser={setUser} /> : <Login onDone={setUser} />}</div>
    </ToastProvider>
  );
}
