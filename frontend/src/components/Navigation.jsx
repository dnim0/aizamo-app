// frontend/src/components/Navigation.jsx
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { solutions as SOLUTIONS } from '../data/solutions';
import { industries as INDUSTRIES } from '../data/industries';
import CTAButton from '@/components/CTAButton';

const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(null); // 'solutions' | 'industries' | 'resources' | null
  const location = useLocation();
  const navigate = useNavigate();

  // Refs
  const navRef = useRef(null);
  const solutionsBtnRef = useRef(null);
  const solutionsMenuRef = useRef(null);
  const industriesBtnRef = useRef(null);
  const industriesMenuRef = useRef(null);
  const resourcesBtnRef = useRef(null);
  const resourcesMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Dropdown positions (fixed; viewport-relative)
  const [solutionsPos, setSolutionsPos] = useState({ top: 0, left: 0, width: 0 });
  const [industriesPos, setIndustriesPos] = useState({ top: 0, left: 0, width: 0 });
  const [resourcesPos, setResourcesPos] = useState({ top: 0, left: 0, width: 0 });

  const closeAll = useCallback(() => {
    setOpen(null);
    setIsMobileMenuOpen(false);
  }, []);

  // Outside click + ESC
  useEffect(() => {
    const handlePointer = (e) => {
      const containers = [
        solutionsBtnRef.current, solutionsMenuRef.current,
        industriesBtnRef.current, industriesMenuRef.current,
        resourcesBtnRef.current, resourcesMenuRef.current,
        mobileMenuRef.current,
      ].filter(Boolean);
      const clickedInside = containers.some(el => el.contains(e.target));
      if (!clickedInside) closeAll();
    };
    const handleKey = (e) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [closeAll]);

  // Close on route change
  useEffect(() => { closeAll(); }, [location.pathname, closeAll]);

  // Scroll styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const core = SOLUTIONS.filter(s => s.group === 'core');
  const plug = SOLUTIONS.filter(s => s.group === 'plug');

  const activeTop = {
    solutions: location.pathname.startsWith('/solutions'),
    industries: location.pathname.startsWith('/industries'),
    resources: location.pathname.startsWith('/resources'),
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('hero');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      closeAll();
    }
  };

  const topLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg ${isScrolled ? 'hover:bg-white/60' : 'hover:bg-white/20'} ${isActive ? 'font-semibold underline underline-offset-4' : ''}`;

  // Positioning (anchor to trigger; prevent overflow). Fixed menus use viewport coords (no scrollY).
  const computeAnchoredPos = useCallback((btnEl, rawWidth) => {
    const vw = window.innerWidth;
    const margin = 8;
    const width = Math.min(rawWidth, Math.floor(vw * 0.96));
    if (!btnEl) return { top: 0, left: margin, width };
    const r = btnEl.getBoundingClientRect();
    const maxLeft = vw - width - margin;
    const left = clamp(Math.floor(r.left), margin, maxLeft);
    const top = Math.floor(r.bottom + margin);
    return { top, left, width };
  }, []);

  // Compute on open (layout pass) to avoid jump/glitch
  useLayoutEffect(() => {
    if (open === 'solutions') setSolutionsPos(computeAnchoredPos(solutionsBtnRef.current, 900));
    if (open === 'industries') setIndustriesPos(computeAnchoredPos(industriesBtnRef.current, 560));
    if (open === 'resources') setResourcesPos(computeAnchoredPos(resourcesBtnRef.current, 480));
  }, [open, computeAnchoredPos]);

  // Recompute while open on resize/scroll
  useEffect(() => {
    const onResizeScroll = () => {
      if (open === 'solutions') setSolutionsPos(computeAnchoredPos(solutionsBtnRef.current, 900));
      if (open === 'industries') setIndustriesPos(computeAnchoredPos(industriesBtnRef.current, 560));
      if (open === 'resources') setResourcesPos(computeAnchoredPos(resourcesBtnRef.current, 480));
    };
    if (open) {
      window.addEventListener('resize', onResizeScroll);
      window.addEventListener('scroll', onResizeScroll, { passive: true });
    }
    return () => {
      window.removeEventListener('resize', onResizeScroll);
      window.removeEventListener('scroll', onResizeScroll);
    };
  }, [open, computeAnchoredPos]);

  // --- NEW: click again to go to index ---
  const handleTopButton = (key, path) => {
    if (open === key) {
      setOpen(null);
      navigate(path);
    } else {
      setOpen(key);
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'nav-scrolled' : 'nav-transparent'}`}
      style={
        isScrolled
          ? {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(150, 114, 89, 0.2)',
            }
          : {
              background: 'transparent',
              backdropFilter: 'none',
              borderBottom: '1px solid transparent'
            }
      }
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: isScrolled
            ? 'linear-gradient(90deg, transparent 0%, rgba(150,114,89,0.35) 50%, transparent 100%)'
            : 'transparent'
        }}
      />

      <div className="container-fluid page-pad-nav">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 group">
            <NavLink to="/" end onClick={handleHomeClick} className="flex items-center cursor-pointer">
              <h2
                className="text-3xl font-bold transition-all duration-500 hover:opacity-90 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #967259 0%, #634832 50%, #38220f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AIzamo
                {/* (decorative underline layers kept) */}
                <div className="absolute bottom-0 left-0 w-full">
                  <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-500" style={{ background: 'linear-gradient(90deg, transparent 0%, #967259 30%, #634832 50%, #967259 70%, transparent 100%)', width: '100%', opacity: '0.5' }} />
                  <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-700 ease-out transform origin-left scale-x-40 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg, transparent 10%, #967259 30%, #634832 50%, #967259 70%, transparent 90%)', width: '100%', opacity: '0.8', transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)', filter: 'drop-shadow(0 0 2px rgba(150, 114, 89, 0.3))' }} />
                  <div className="absolute bottom-0 left-0 h-1 transition-all duration-700 ease-out opacity-0 group-hover:opacity-60 transform -translate-y-0.5 origin-left scale-x-0 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(150, 114, 89, 0.3) 30%, rgba(99, 72, 50, 0.4) 50%, rgba(150, 114, 89, 0.3) 70%, transparent 100%)', width: '100%', filter: 'blur(1px)', transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)', transitionDelay: '100ms' }} />
                  <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-600 ease-out opacity-0 group-hover:opacity-100 transform origin-left scale-x-0 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(150, 114, 89, 0.9) 40%, rgba(99, 72, 50, 1) 50%, rgba(150, 114, 89, 0.9) 60%, transparent 80%)', width: '100%', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)', transitionDelay: '50ms', filter: 'brightness(1.1)' }} />
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #967259 0%, #634832 50%, #38220f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 8px rgba(150, 114, 89, 0.4))' }}>
                  AIzamo
                </div>
              </h2>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" end onClick={handleHomeClick} className={topLinkClass}>
              Home
            </NavLink>

            {/* Solutions (fixed, anchored) */}
            <div className="relative">
              <button
                ref={solutionsBtnRef}
                aria-haspopup="menu"
                aria-expanded={open === 'solutions'}
                aria-controls="menu-solutions"
                aria-current={activeTop.solutions ? 'page' : undefined}
                title="Open menu; click again to view all Solutions"
                className={`px-3 py-2 rounded-lg ${isScrolled ? 'hover:bg-white/60' : 'hover:bg-white/20'} flex items-center gap-1 ${activeTop.solutions ? 'font-semibold underline underline-offset-4' : ''}`}
                onClick={() => handleTopButton('solutions', '/solutions')}
              >
                Solutions <ChevronDown size={16} />
              </button>

              {open === 'solutions' && (
                <div
                  id="menu-solutions"
                  ref={solutionsMenuRef}
                  role="menu"
                  className="fixed z-[60] rounded-xl border bg-white p-4 shadow-xl"
                  style={{
                    top: `${solutionsPos.top}px`,
                    left: `${solutionsPos.left}px`,
                    width: `${solutionsPos.width}px`,
                    maxWidth: '96vw',
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500 px-2">Core</div>
                      {core.map(s => (
                        <Link key={s.slug} to={`/solutions/${s.slug}`} className="block px-2 py-2 rounded-md hover:bg-gray-50">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-gray-600">{s.outcomes}</div>
                        </Link>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500 px-2">Plug-and-Play</div>
                      {plug.map(s => (
                        <Link key={s.slug} to={`/solutions/${s.slug}`} className="block px-2 py-2 rounded-md hover:bg-gray-50">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-gray-600">{s.summary}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 text-right px-2">
                    <NavLink to="/solutions" className="text-sm text-blue-600 hover:underline">
                      Browse all solutions →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Industries (fixed, anchored) */}
            <div className="relative">
              <button
                ref={industriesBtnRef}
                aria-haspopup="menu"
                aria-expanded={open === 'industries'}
                aria-controls="menu-industries"
                aria-current={activeTop.industries ? 'page' : undefined}
                title="Open menu; click again to view all Industries"
                className={`px-3 py-2 rounded-lg ${isScrolled ? 'hover:bg-white/60' : 'hover:bg-white/20'} flex items-center gap-1 ${activeTop.industries ? 'font-semibold underline underline-offset-4' : ''}`}
                onClick={() => handleTopButton('industries', '/industries')}
              >
                Industries <ChevronDown size={16} />
              </button>
              {open === 'industries' && (
                <div
                  id="menu-industries"
                  ref={industriesMenuRef}
                  role="menu"
                  className="fixed z-[60] rounded-xl border bg-white p-4 shadow-xl"
                  style={{
                    top: `${industriesPos.top}px`,
                    left: `${industriesPos.left}px`,
                    width: `${industriesPos.width}px`,
                    maxWidth: '96vw',
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {INDUSTRIES.map(i => (
                      <Link key={i.slug} to={`/industries/${i.slug}`} className="block px-2 py-2 rounded-md hover:bg-gray-50">
                        <div className="font-medium">{i.title}</div>
                        <div className="text-xs text-gray-600">{i.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 text-right px-2">
                    <NavLink to="/industries" className="text-sm text-blue-600 hover:underline">
                      View all industries →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Top-level pages */}
            <NavLink to="/pricing" className={topLinkClass}>Pricing</NavLink>
            <NavLink to="/case-studies" className={topLinkClass}>Case Studies</NavLink>
            <NavLink to="/about" className={topLinkClass}>About</NavLink>

            {/* Resources (fixed, anchored) */}
            <div className="relative">
              <button
                ref={resourcesBtnRef}
                aria-haspopup="menu"
                aria-expanded={open === 'resources'}
                aria-controls="menu-resources"
                aria-current={activeTop.resources ? 'page' : undefined}
                title="Open menu; click again to view all Resources"
                className={`px-3 py-2 rounded-lg ${isScrolled ? 'hover:bg-white/60' : 'hover:bg-white/20'} flex items-center gap-1 ${activeTop.resources ? 'font-semibold underline underline-offset-4' : ''}`}
                onClick={() => handleTopButton('resources', '/resources')}
              >
                Resources <ChevronDown size={16} />
              </button>
              {open === 'resources' && (
                <div
                  id="menu-resources"
                  ref={resourcesMenuRef}
                  role="menu"
                  className="fixed z-[60] rounded-xl border bg-white p-4 shadow-xl"
                  style={{
                    top: `${resourcesPos.top}px`,
                    left: `${resourcesPos.left}px`,
                    width: `${resourcesPos.width}px`,
                    maxWidth: '96vw',
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources">Overview</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/blog">Blog</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/playbooks">Playbooks</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/templates">Templates</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/roi-calculator">ROI Calculator</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/webinars">Webinars</NavLink>
                    <NavLink className="px-2 py-2 rounded-md hover:bg-gray-50" to="/resources/help-center">Help Center</NavLink>
                  </div>
                  <div className="mt-3 text-right px-2">
                    <NavLink to="/resources" className="text-sm text-blue-600 hover:underline">
                      View all resources →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <CTAButton
              label="Get Started"
              to="/get-started"
              variant="dark"
              size="md"
              useNavLink
              className="ml-2"
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="p-3 rounded-lg transition-all duration-300 hover:bg-white hover:bg-opacity-30"
              style={{ color: 'var(--text-primary)' }}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="md:hidden mobile-menu-slide-down"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '0 0 16px 16px',
              border: '1px solid rgba(150, 114, 89, 0.2)',
              boxShadow: '0 8px 32px rgba(150, 114, 89, 0.3)',
            }}
          >
            <div className="flex flex-col space-y-1 p-4">
              <NavLink to="/" end onClick={(e) => { handleHomeClick(e); }} className="block px-2 py-2 rounded-md hover:bg-gray-50">
                Home
              </NavLink>

              <details open className="px-1">
                <summary className="py-2 cursor-pointer">Solutions</summary>
                <div className="pl-2">
                  {[...core, ...plug].map(s => (
                    <NavLink
                      key={s.slug}
                      to={`/solutions/${s.slug}`}
                      className="block px-2 py-2 rounded-md hover:bg-gray-50"
                      onClick={closeAll}
                    >
                      {s.title}
                    </NavLink>
                  ))}
                </div>
                <div className="pl-2 pt-1">
                  <NavLink to="/solutions" className="text-sm text-blue-600 underline" onClick={closeAll}>
                    View all solutions →
                  </NavLink>
                </div>
              </details>

              <details className="px-1">
                <summary className="py-2 cursor-pointer">Industries</summary>
                <div className="pl-2">
                  {INDUSTRIES.map(i => (
                    <NavLink
                      key={i.slug}
                      to={`/industries/${i.slug}`}
                      className="block px-2 py-2 rounded-md hover:bg-gray-50"
                      onClick={closeAll}
                    >
                      {i.title}
                    </NavLink>
                  ))}
                </div>
                <div className="pl-2 pt-1">
                  <NavLink to="/industries" className="text-sm text-blue-600 underline" onClick={closeAll}>
                    View all industries →
                  </NavLink>
                </div>
              </details>

              <NavLink to="/pricing" className="block px-2 py-2" onClick={closeAll}>Pricing</NavLink>
              <NavLink to="/case-studies" className="block px-2 py-2" onClick={closeAll}>Case Studies</NavLink>
              <NavLink to="/about" className="block px-2 py-2" onClick={closeAll}>About</NavLink>

              <details className="px-1">
                <summary className="py-2 cursor-pointer">Resources</summary>
                <div className="pl-2">
                  {['', 'blog', 'playbooks', 'templates', 'roi-calculator', 'webinars', 'help-center'].map(p => (
                    <NavLink
                      key={p || 'overview'}
                      to={`/resources/${p}`}
                      className="block px-2 py-2 rounded-md hover:bg-gray-50"
                      onClick={closeAll}
                    >
                      {p ? p.replaceAll('-', ' ').replace(/\b\w/g, m => m.toUpperCase()) : 'Overview'}
                    </NavLink>
                  ))}
                </div>
                <div className="pl-2 pt-1">
                  <NavLink to="/resources" className="text-sm text-blue-600 underline" onClick={closeAll}>
                    View all resources →
                  </NavLink>
                </div>
              </details>

              <CTAButton
                label="Get Started"
                to="/get-started"
                variant="dark"
                size="md"
                useNavLink
                onClick={closeAll}
                className="w-full mt-4"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
