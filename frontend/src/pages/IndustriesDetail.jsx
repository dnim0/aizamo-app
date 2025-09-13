// frontend/src/pages/IndustriesDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { industries } from '@/data/industries';
import CTAButton from '@/components/CTAButton';
import NotFound from '@/pages/NotFound';

/* -------------------------------------------------------------------------- */
/* Analytics (safe no-op) — why: avoid runtime errors if trackers absent      */
/* -------------------------------------------------------------------------- */
const track = (name, props = {}) => {
  try {
    if (window?.gtag) window.gtag('event', name, props);
    if (window?.plausible) window.plausible(name, { props });
    if (window?.posthog?.capture) window.posthog.capture(name, props);
  } catch {}
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */
const IconChevronLeft = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconChevronRight = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function toBullets(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  const s = String(value).trim();
  if (!s) return [];
  if (s.includes('•')) return s.split('•').map(x => x.trim()).filter(Boolean);
  return s.split(/(?<=[.;])\s+|—|–|,|\u00B7/g).map(x => x.trim()).filter(x => x.length > 2);
}

/* -------------------------------------------------------------------------- */
/* Outcomes Rotator (single box; fixed width on desktop, full on mobile)      */
/* -------------------------------------------------------------------------- */
function OutcomesRotator({ items, interval = 3200 }) {
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [boxW, setBoxW] = useState(null);           // px width for desktop
  const spansRef = useRef([]);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect reduced motion + desktop
  useEffect(() => {
    const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const md = window.matchMedia?.('(min-width: 768px)');
    if (rm) {
      const onRM = (e) => setReduced(!!e.matches);
      setReduced(!!rm.matches);
      rm.addEventListener?.('change', onRM);
      rm.addListener?.(onRM);
      return () => {
        rm.removeEventListener?.('change', onRM);
        rm.removeListener?.(onRM);
      };
    }
  }, []);
  useEffect(() => {
    const md = window.matchMedia?.('(min-width: 768px)');
    if (!md) return;
    const apply = () => setIsDesktop(!!md.matches);
    apply();
    md.addEventListener?.('change', apply);
    md.addListener?.(apply);
    return () => {
      md.removeEventListener?.('change', apply);
      md.removeListener?.(apply);
    };
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!items?.length || reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items?.length, interval, reduced]);

  // Measure longest phrase width (desktop)
  const measure = () => {
    const widths = spansRef.current.map((el) => (el ? el.offsetWidth : 0));
    const max = widths.length ? Math.max(...widths) : 0;
    setBoxW(max ? max + 32 /* padding */ : null);
  };
  useEffect(() => {
    const r = new ResizeObserver(() => measure());
    spansRef.current.forEach((el) => el && r.observe(el));
    measure();
    return () => r.disconnect();
  }, [items?.length]);

  return (
    <div className="relative">
      {/* Hidden measurer — why: compute natural widths in current font */}
      <div className="absolute invisible -z-10 pointer-events-none whitespace-nowrap">
        {items?.map((t, i) => (
          <span
            key={`m-${i}`}
            ref={(el) => (spansRef.current[i] = el)}
            className="font-semibold text-base sm:text-lg px-4"
          >
            {t}
          </span>
        ))}
      </div>

      <div
        className="relative rounded-2xl border-2 p-5 sm:p-6 text-center overflow-hidden mx-auto"
        style={{
          borderColor: 'var(--light-brown)',
          background: 'var(--white)',
          minHeight: 88,
          width: isDesktop && boxW ? `${boxW}px` : '100%',
          maxWidth: 'min(100%, 680px)',
        }}
        aria-live="polite"
      >
        {items.map((text, i) => {
          const active = (i === idx) || (reduced && i === 0);
          return (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center px-4"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? 'translateY(0px)' : 'translateY(8px)',
                transition: reduced ? 'none' : 'opacity 400ms ease, transform 400ms ease',
                color: 'var(--darkest-brown)',
              }}
              aria-hidden={!active}
            >
              <div className="font-semibold text-base sm:text-lg">{text}</div>
            </div>
          );
        })}
        {/* SSR/no-JS fallback */}
        <noscript>
          <div className="font-semibold text-base sm:text-lg" style={{ color: 'var(--darkest-brown)' }}>
            {items?.[0]}
          </div>
        </noscript>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tech Stack (chips reveal desc on hover or tap)                             */
/* -------------------------------------------------------------------------- */
function TechStack({ items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((t, i) => {
        const isOpen = openIdx === i;
        const monogram = (t.name || '').trim().slice(0, 2).toUpperCase();
        return (
          <button
            key={`${t.name}-${i}`}
            type="button"
            onMouseEnter={() => setOpenIdx(i)}
            onMouseLeave={() => setOpenIdx((cur) => (cur === i ? null : cur))}
            onClick={() => setOpenIdx((cur) => (cur === i ? null : i))}
            aria-expanded={isOpen}
            className="group w-full text-left rounded-xl border transition-all focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: isOpen ? 'var(--medium-brown)' : 'var(--light-brown)',
              background: 'var(--white)',
              color: 'var(--darkest-brown)',
              boxShadow: isOpen ? '0 10px 28px rgba(150,114,89,0.16)' : '0 0 0 rgba(0,0,0,0)',
            }}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(150,114,89,0.12)', color: 'var(--medium-brown)' }}
                aria-hidden="true"
              >
                {monogram}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.name}</div>
                <div className="text-[11px] opacity-70 truncate" style={{ color: 'var(--text-light)' }}>
                  {t.desc}
                </div>
              </div>
            </div>
            <div
              className="px-3 pb-3 overflow-hidden transition-[max-height,opacity,transform]"
              style={{
                maxHeight: isOpen ? 200 : 0,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(-4px)',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="text-xs rounded-lg border p-3" style={{ borderColor: 'var(--light-brown)', background: 'var(--cream)' }}>
                {t.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ (upgraded accordion)                                                   */
/* -------------------------------------------------------------------------- */
function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {items.map((f, idx) => {
        const isOpen = open === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border transition-all"
            style={{
              borderColor: isOpen ? 'var(--medium-brown)' : 'var(--light-brown)',
              background: 'var(--white)',
              boxShadow: isOpen ? '0 12px 28px rgba(150,114,89,0.12)' : 'none',
            }}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 p-4 text-left focus:outline-none"
              aria-expanded={isOpen}
              aria-controls={`faq-pane-${idx}`}
              onClick={() => {
                setOpen((cur) => (cur === idx ? null : idx));
                track('faq_toggle', { question: f.q, open: !isOpen });
              }}
              style={{ color: 'var(--darkest-brown)' }}
            >
              <span className="font-medium">{f.q}</span>
              <span
                className="shrink-0 transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--medium-brown)' }}
              >
                <IconChevronDown />
              </span>
            </button>
            <div
              id={`faq-pane-${idx}`}
              role="region"
              className="px-4 pb-4 -mt-1 overflow-hidden transition-[max-height,opacity]"
              style={{ maxHeight: isOpen ? 400 : 0, opacity: isOpen ? 1 : 0, color: 'var(--text-secondary)' }}
            >
              <p className="text-sm leading-relaxed">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Action Frame (persuasive copy + two CTAs)                                  */
/* -------------------------------------------------------------------------- */
function ActionFrame({ slug }) {
  return (
    <section className="rounded-2xl border-2 p-6 md:p-8 text-center"
      style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}>
      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--darkest-brown)' }}>
        Ready to turn your workflow into wins?
      </h3>
      <p className="text-sm md:text-base max-w-2xl mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>
        See package details or get started now—your first improvements land in days, not months.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <CTAButton label="Get Started" to="/get-started" variant="dark" size="md" useNavLink />
        <Link to="/solutions" className="px-5 py-3 rounded-xl border"
          style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)', background: 'var(--cream)' }}>
          View All Solutions
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Automation Console (equal-height friendly)                                 */
/* -------------------------------------------------------------------------- */
function AutomationConsole({ seed, headline = 'Live Automation Console' }) {
  const [phase, setPhase] = useState('idle'); // idle | step | logs | done
  const [progress, setProgress] = useState(0);
  const [typedLines, setTypedLines] = useState([]);
  const [cursorOn, setCursorOn] = useState(true);
  const [pinned, setPinned] = useState(null);

  const stepCard = useMemo(
    () => ({
      title: seed?.title || 'Lead Intake & Routing',
      sub: seed?.sub || 'Form → GHL → Webhook → Normalize → Enrich → Route → CRM → Notify',
      est: seed?.est || '~4.1s execution',
    }),
    [seed]
  );

  const LINES = useMemo(() => {
    if (Array.isArray(seed?.lines) && seed.lines.length) return seed.lines;
    return [
      'POST / — webhook received (form or ad lead)',
      'GoHighLevel: contact upsert, opportunity created/updated, assigned user alerted, welcome SMS+email sent',
      'Normalize fields… ok',
      'Enrich email… ok',
      'Route lead (round-robin)… ok',
      'Write to CRM timeline + sheet… ok',
      'Set up email/SMS subscriptions… ok',
      'Execution finished — success',
    ];
  }, [seed]);

  useEffect(() => {
    const t = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== 'step') return;
    setProgress(0);
    const h = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(h);
          setPinned(stepCard);
          setTimeout(() => setPhase('logs'), 420);
          return 100;
        }
        const inc = p < 70 ? 6 : p < 90 ? 4 : 2;
        return Math.min(100, p + inc);
      });
    }, 150);
    return () => clearInterval(h);
  }, [phase, stepCard]);

  useEffect(() => {
    if (phase !== 'logs') return;
    setTypedLines([]);
    let i = 0;
    const push = () => {
      setTypedLines((prev) => [...prev, LINES[i]]);
      i++;
      if (i < LINES.length) {
        setTimeout(push, 650 + Math.random() * 300);
      } else {
        setPhase('done');
      }
    };
    setTimeout(push, 420);
  }, [phase, LINES]);

  const start = () => {
    setPhase('step');
    track('automation_console_start', { console: seed?.id || 'default' });
  };

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden h-full flex flex-col"
      style={{
        borderColor: 'var(--light-brown)',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #161616 100%)',
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(150,114,89,0.25)' }}>
        <div className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
          {headline}
        </div>
      </div>

      {pinned && (
        <div className="px-4 pt-4">
          <div className="rounded-xl border p-3 bg-white/5 backdrop-blur" style={{ borderColor: 'rgba(150,114,89,0.35)' }}>
            <div className="text-sm font-semibold" style={{ color: '#f0eae6' }}>{pinned.title}</div>
            <div className="text-xs mt-1" style={{ color: '#d7cfc9' }}>{pinned.sub}</div>
            <div className="text-[11px] mt-2" style={{ color: '#c1b6ae' }}>{pinned.est}</div>
          </div>
        </div>
      )}

      <div className="p-4 flex-1 flex">
        {phase === 'idle' && (
          <div className="m-auto">
            <button
              type="button"
              onClick={start}
              className="px-5 py-3 rounded-xl font-semibold transition-all hover:-translate-y-[1px]"
              style={{
                background: 'var(--medium-brown)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(150,114,89,0.35)',
              }}
            >
              Start Automation Workflow
            </button>
          </div>
        )}

        {phase === 'step' && (
          <div className="m-auto w-full max-w-md">
            <div className="rounded-xl border bg:white/10 backdrop-blur p-4" style={{ borderColor: 'rgba(150,114,89,0.35)', background: 'rgba(255,255,255,0.08)' }}>
              <div className="text-sm font-semibold mb-1" style={{ color: '#f0eae6' }}>{stepCard.title}</div>
              <div className="text-xs mb-3" style={{ color: '#d7cfc9' }}>{stepCard.sub}</div>
              <div className="w-full h-2 rounded-full" style={{ background: '#2a2a2a' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--medium-brown)' }} />
              </div>
              <div className="mt-2 text-[11px]" style={{ color: '#c1b6ae' }}>
                Initializing… {progress}%
              </div>
            </div>
          </div>
        )}

        {(phase === 'logs' || phase === 'done') && (
          <div className="rounded-lg border bg-black/30 p-3 font-mono text-[12px] leading-relaxed w-full" style={{ borderColor: 'rgba(150,114,89,0.25)', color: '#dcd7d3' }}>
            {typedLines.map((ln, i) => (
              <div key={i} className="whitespace-pre-wrap">{ln}</div>
            ))}
            <div className="opacity-70 mt-1">
              {phase !== 'done' ? (cursorOn ? '▍' : ' ') : '— end —'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Content (per industry) — unchanged data                                    */
/* -------------------------------------------------------------------------- */
const CONTENT = {
  'real-estate': {
    heroTitle: 'Automations that win more deals in Real Estate',
    heroSub: 'From lead capture to follow-up and bookings — done for you in weeks, not months.',
    outcomes: [
      'Sub-60s speed-to-lead with 24/7 replies',
      '+25–60% more booked appointments',
      '40–120 admin hours saved per month',
    ],
    packages: [/* ... unchanged ... */],
    timeline: [
      { w: 'Week 1 — Discover', before: 'Leads scattered, slow replies, mixed adoption.', after: 'Clear goals, mapped stack, audit + intake complete.' },
      { w: 'Week 2 — Design',   before: 'No shared flows or templates.',                 after: 'Approved flowchart + copy + booking play, roles set.' },
      { w: 'Week 3–4 — Build',  before: 'Manual follow-ups, missed handoffs.',           after: 'Automations live: instant reply, nurture, routing, reminders.' },
      { w: 'Week 5 — Launch',   before: 'No visibility on ROI.',                          after: 'Dashboards + training + 30-day optimization window.' },
    ],
    impact: { /* ... unchanged ... */ },
    tech: [ /* ... unchanged ... */ ],
    faq: [ /* ... unchanged ... */ ],
    consoleSeed: { /* ... unchanged ... */ },
  },
  'home-services': { /* ... unchanged structure & data ... */ },
  'childcare-education': { /* ... unchanged structure & data ... */ },
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function IndustriesDetail() {
  const { slug } = useParams();
  const meta = industries.find((i) => i.slug === slug);

  if (!meta) {
    return (
      <NotFound
        title="Industry not found"
        message="That industry doesn’t exist. Choose another vertical or request a proposal."
        backHref="/industries"
        backText="Browse Industries"
        actions={[{ href: '/get-started', label: 'Get Started', primary: true }]}
      />
    );
  }

  const content = CONTENT[slug];

  if (!content) {
    return (
      <article className="container mx-auto px-4 py-10 space-y-8">
        <nav className="text-base" style={{ color: 'var(--darkest-brown)' }}>
          <Link to="/industries" className="hover:underline" style={{ color: 'var(--darkest-brown)' }}>
            Industries
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span>{meta.title}</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--darkest-brown)' }}>
            {meta.title}
          </h1>
          {meta.subtitle && <p className="text-gray-600 max-w-2xl">{meta.subtitle}</p>}
        </header>
        <p style={{ color: 'var(--text-secondary)' }}>
          We’re preparing a tailored package for this industry. In the meantime, explore our{' '}
          <Link to="/solutions" className="underline">solutions</Link> or{' '}
          <Link to="/get-started" className="underline">get started</Link>.
        </p>
      </article>
    );
  }

  const tierHref = (tierKey) => `/industries/${slug}/package/${tierKey}`;

  return (
    <section id={`industry-${slug}`} className="section" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container page-pad space-y-10">
        {/* Breadcrumbs */}
        <nav className="pt-2 -mb-4">
          <div className="inline-flex items-center gap-2 text-base" style={{ color: 'var(--darkest-brown)' }}>
            <Link to="/industries" className="hover:underline" style={{ color: 'var(--darkest-brown)' }}>
              Industries
            </Link>
            <span className="text-gray-400">/</span>
            <span>{meta.title}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 section-header-underline animate-in" style={{ color: 'var(--darkest-brown)' }}>
            {content.heroTitle}
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {content.heroSub}
          </p>
        </header>

        {/* Outcomes — single rotating box */}
        <section>
          <OutcomesRotator items={content.outcomes} />
        </section>

        {/* Packages — “Click to view details” only */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--darkest-brown)' }}>Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.packages.map((p) => (
              <Link
                key={p.key}
                to={tierHref(p.key)}
                aria-label={`View ${p.name} package`}
                className="group block rounded-2xl border-2 p-6 transition-all will-change-transform focus:outline-none"
                style={{
                  borderColor: 'var(--light-brown)',
                  background: 'var(--white)',
                  boxShadow: '0 0 0 rgba(0,0,0,0)',
                  transform: 'translateY(0) scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 18px 44px rgba(150,114,89,0.20)';
                  e.currentTarget.style.borderColor = 'var(--medium-brown)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                  e.currentTarget.style.borderColor = 'var(--light-brown)';
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(0.985)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-semibold" style={{ color: 'var(--darkest-brown)' }}>{p.name}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'var(--light-brown)', color: 'var(--text-light)' }}>
                    {p.who}
                  </div>
                </div>
                <ul className="text-sm mb-3 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {p.outcomes.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
                <div className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>What’s included:</div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {p.includes.slice(0, 5).map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
                <div className="mt-4 text-sm flex items-center justify-between">
                  <span style={{ color: 'var(--text-light)' }}>Timeline: ~{p.weeks} weeks</span>
                  <span style={{ color: 'var(--darkest-brown)' }}>Setup {p.setup} · {p.monthly}/mo</span>
                </div>
                <div className="mt-5 pt-4 flex items-center justify-end border-t"
                  style={{ borderColor: 'var(--light-brown)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    Click to view details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Impact + Console (equal height) */}
        <section className="grid lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 h-full">
            <div className="rounded-2xl border-2 p-6 h-full min-h-[360px] md:min-h-[440px]"
              style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--darkest-brown)' }}>Impact Snapshot</h3>
              <div className="text-sm mb-2" style={{ color: 'var(--text-light)' }}>{content.impact.client}</div>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong>Problem:</strong> {content.impact.problem}</p>
                <p><strong>Solution:</strong> {content.impact.solution}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 my-4">
                {content.impact.metrics.map((m, i) => (
                  <div key={i} className="rounded-xl border p-3 text-center"
                    style={{ borderColor: 'var(--light-brown)', background: 'var(--cream)' }}>
                    <div className="text-lg font-bold" style={{ color: 'var(--darkest-brown)' }}>{m.v}</div>
                    <div className="text-xs" style={{ color: 'var(--text-light)' }}>{m.k}</div>
                  </div>
                ))}
              </div>
              <blockquote className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                “{content.impact.quote}”
              </blockquote>
              <div className="mt-3 text-xs" style={{ color: 'var(--text-light)' }}>{content.impact.note}</div>
            </div>
          </div>

          <div className="lg:col-span-2 h-full">
            <AutomationConsole seed={content.consoleSeed} />
          </div>
        </section>

        {/* Action Frame — moved here to funnel after console */}
        <ActionFrame slug={slug} />

        {/* Tech stack */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--darkest-brown)' }}>Tech Stack</h3>
          <TechStack items={content.tech} />
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--darkest-brown)' }}>FAQs</h3>
          <FAQ items={content.faq} />
        </section>

        {/* Removed: bottom CTAs (replaced by ActionFrame) */}
        {/* Removed: Timeline section as requested */}
      </div>
    </section>
  );
}
