import { lazy, Suspense, useCallback, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SiteProvider, ToneProvider, IntroProvider, useSite } from './lib/site.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';
import Cursor from './components/Cursor.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import RevealLayout from './components/RevealLayout.jsx';
import Extras from './components/Extras.jsx';
import TabBar from './components/TabBar.jsx';
import Preloader from './components/Preloader.jsx';
import Transition from './components/Transition.jsx';
import PageView from './pages/PageView.jsx';
import { MenuPage, ItemPage } from './pages/MenuPages.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import { NotFound } from './pages/shared.jsx';

const Admin = lazy(() => import('./admin/AdminApp.jsx'));

function PublicShell() {
  const { site, error, s } = useSite();
  const location = useLocation();
  // The intro plays on every full page load / reload (not on in-app navigation).
  const [pre] = useState(true);
  const [ready, setReady] = useState(false);
  const showPre = pre && s.preloader !== '0';
  const done = useCallback(() => setReady(true), []);

  if (error) return <div className="grid min-h-screen place-items-center bg-cream p-8 text-center"><p>We’re having trouble loading the site. Please refresh in a moment.</p></div>;
  if (!site) return <div className="on-dark min-h-screen bg-wine" aria-busy="true" />;

  // /menu and /menu/:category share one page instance so tab changes animate in place.
  const key = /^\/menu(\/(?!item\/)[^/]+)?\/?$/.test(location.pathname) ? '/menu' : location.pathname;
  return (
    <IntroProvider value={{ ready: ready || !showPre }}>
      <div className="grain">
        <a href="#main" className="fixed left-4 top-[-4rem] z-[400] rounded-full bg-wine px-4 py-2 text-cream focus:top-4">Skip to content</a>
        <SmoothScroll />
        <Cursor />
        {showPre && <Preloader name={s.cafe_name || 'Esspology'} onReady={done} />}
        <Header />
        <RevealLayout footer={<Footer />}>
        <main id="main">
          <AnimatePresence mode="wait" initial={false}>
            <Transition key={key} skipIntro={showPre}>
              <Routes location={location}>
                <Route path="/" element={<PageView slug="home" />} />
                <Route path="/menu/item/:slug" element={<ItemPage />} />
                <Route path="/menu/:cat?" element={<MenuPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/:slug" element={<PageView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Transition>
          </AnimatePresence>
        </main>
        </RevealLayout>
        <Extras />
        <TabBar />
      </div>
    </IntroProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <ToneProvider>
          <Routes>
            <Route path="/admin/*" element={<Suspense fallback={<div className="grid min-h-screen place-items-center">Loading…</div>}><Admin /></Suspense>} />
            <Route path="*" element={<PublicShell />} />
          </Routes>
        </ToneProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}
