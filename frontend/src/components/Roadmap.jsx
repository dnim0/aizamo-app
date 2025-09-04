// File: frontend/src/components/Roadmap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Search, Lightbulb, Cog, Rocket } from 'lucide-react';
import { mockData } from '../data/mock';

const iconMap = { Search, Lightbulb, Cog, Rocket };

/** Sticky progress bar with a fixed overlay that fades/slides in while section is in view. */
function StickyProgressBar({ containerRef, labels = [], activeIndex = 0 }) {
  const inlineBarRef = useRef(null);
  const [fixed, setFixed] = useState(false);
  const [dims, setDims] = useState({ left: 0, width: 0, top: 0 });
  const [mounted, setMounted] = useState(false); // fade in on first paint

  const navOffset = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 80;
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onTick = () => {
      if (!containerRef.current || !inlineBarRef.current) return;

      const topOffset = navOffset() + 8;
      const contRect = containerRef.current.getBoundingClientRect();

      // Section bounds check for sticky activation
      const sectionEl = containerRef.current.closest('section') ?? containerRef.current;
      const secRect = sectionEl.getBoundingClientRect();
      const inlineHeight = inlineBarRef.current.offsetHeight || 0;

      const inView = secRect.top <= topOffset && secRect.bottom - topOffset >= inlineHeight;

      setFixed(inView);
      setDims({
        left: contRect.left + window.scrollX,
        width: contRect.width,
        top: topOffset
      });
    };

    onTick();
    const ro = new ResizeObserver(onTick);
    containerRef.current && ro.observe(containerRef.current);
    inlineBarRef.current && ro.observe(inlineBarRef.current);
    window.addEventListener('scroll', onTick, { passive: true });
    window.addEventListener('resize', onTick);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onTick);
      window.removeEventListener('resize', onTick);
    };
  }, [containerRef]);

  const progressPct = labels.length > 1 ? (activeIndex / (labels.length - 1)) * 100 : 0;

  const BarShell = ({ className = '', style }) => (
    <div
      ref={inlineBarRef}
      className={[
        'rounded-full p-3 shadow-sm backdrop-blur',
        'bg-white/80 ring-1 ring-black/5',
        'transition-all duration-300 ease-out',
        className
      ].join(' ')}
      style={style}
    >
      <div className="relative h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
        <div
          className={[
            'absolute top-0 left-0 h-2 rounded-full',
            'transition-[width,opacity] duration-700 ease-[cubic-bezier(.22,.61,.36,1)]'
          ].join(' ')}
          style={{
            width: `${progressPct}%`,
            backgroundColor: 'var(--medium-brown)',
            opacity: mounted ? 1 : 0.6
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold">
        {labels.map((_, i) => (
          <span
            key={i}
            className="transition-colors duration-300"
            style={{
              color: i === activeIndex ? 'var(--medium-brown)' : 'var(--darkest-brown)',
              opacity: i === activeIndex ? 1 : 0.6
            }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Inline placeholder keeps layout height; fades when overlay is active */}
      <div
        className="sticky z-20 transition-opacity duration-300"
        style={{ top: `calc(${navOffset()}px + 8px)`, opacity: fixed ? 0 : 1 }}
      >
        <BarShell />
      </div>

      {/* Fixed overlay aligned to container; fades/slides in */}
      <div
        className={['pointer-events-none fixed z-30', 'transition-all duration-300 ease-out'].join(' ')}
        style={{
          top: `${dims.top}px`,
          left: `${dims.left}px`,
          width: `${dims.width}px`,
          opacity: fixed ? 1 : 0,
          transform: `translateY(${fixed ? '0px' : '-6px'})`
        }}
        aria-hidden
      >
        <BarShell className="shadow-md" />
      </div>
    </>
  );
}

/** Compute active step using a top "probe line" below the nav. Monotonic, no flicker between cards. */
function useStableScrollSpy(ids) {
  const [active, setActive] = useState(0);

  const getNavH = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 80;
  };

  useEffect(() => {
    const getEls = () => ids.map((id) => document.getElementById(id)).filter(Boolean);

    const computeProbeY = () => {
      const navH = getNavH();
      // probe ~1/3 down the viewport, capped so it stays near the top
      const extra = Math.min(window.innerHeight * 0.33, 220);
      return navH + 8 + extra; // same +8 used by the sticky bar
    };

    let els = getEls();

    const onScroll = () => {
      if (!els.length) els = getEls();
      const probe = computeProbeY();
      let next = 0;
      for (let i = 0; i < els.length; i++) {
        const rect = els[i].getBoundingClientRect();
        if (rect.top <= probe) next = i; // switch only when next top crosses the probe
      }
      setActive(next);
    };

    const onResize = () => {
      els = getEls();
      onScroll();
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [ids.join('|')]);

  return active;
}

export default function Roadmap() {
  const containerRef = useRef(null);

  // stable, no-bounce active index
  const stepIds = mockData.roadmap.map((s) => `step-${s.id}`);
  const active = useStableScrollSpy(stepIds);

  return (
    <section id="roadmap" className="section" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Our Process
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A proven 4-step approach to transform your business with AI automation
          </p>
        </div>

        {/* Sticky/fixed progress bar */}
        <div className="max-w-4xl mx-auto" ref={containerRef}>
          <StickyProgressBar
            containerRef={containerRef}
            labels={mockData.roadmap.map((s) => s.title)}
            activeIndex={active}
          />
        </div>

        {/* Timeline */}
        <Timeline />
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Center line (desktop only) */}
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 w-1"
          style={{
            height: 'calc(100% - 200px)',
            top: '100px',
            background:
              'linear-gradient(to bottom, transparent 0%, var(--medium-brown) 20%, var(--medium-brown) 80%, transparent 100%)'
          }}
        />
        {mockData.roadmap.map((step, index) => (
          <Step key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

function Step({ step, index }) {
  const Icon = iconMap[step.icon];
  const isEven = index % 2 === 0;
  const deliverable = step.deliverable;
  const impact = step.impact;

  return (
    <div id={`step-${step.id}`} className="mb-10 md:mb-16 anchor-offset">
      {/* MOBILE: compact single-column */}
      <div className="md:hidden grid grid-cols-[2.75rem,1fr] gap-4">
        <div className="relative flex justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 bg-white"
            style={{ borderColor: 'var(--medium-brown)' }}
          >
            <Icon size={20} style={{ color: 'var(--medium-brown)' }} />
          </div>
          {index !== mockData.roadmap.length - 1 && (
            <span
              className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%+2.5rem)]"
              style={{ backgroundColor: 'var(--light-brown)' }}
            />
          )}
        </div>

        <div
          className="p-5 rounded-2xl shadow-lg border-2"
          style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--light-brown)' }}
        >
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--medium-brown)' }}>
            {step.duration} • {step.phase}
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--darkest-brown)' }}>
            {step.title}
          </h3>
          <p className="text-base line-clamp-5" style={{ color: 'var(--text-secondary)' }}>
            {step.description}
          </p>

          {/* Outcome chips */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {deliverable && (
              <span className="px-2 py-1 rounded-full border" style={{ borderColor: 'var(--light-brown)' }}>
                Deliverable: {deliverable}
              </span>
            )}
            <span className="px-2 py-1 rounded-full border" style={{ borderColor: 'var(--light-brown)' }}>
              Time: {step.duration}
            </span>
            {impact && (
              <span
                className="px-2 py-1 rounded-full border"
                style={{
                  backgroundColor: 'var(--light-brown)',
                  color: 'var(--darkest-brown)',
                  borderColor: 'var(--light-brown)'
                }}
              >
                Impact: {impact}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP: alternating layout */}
      <div className={`hidden md:flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-5/12 ${isEven ? 'text-right pr-8' : 'text-left pl-8'}`}>
          <div
            className="p-6 rounded-2xl shadow-lg border-2"
            style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--light-brown)' }}
          >
            <div className={`text-sm font-bold mb-2 ${isEven ? 'text-right' : 'text-left'}`} style={{ color: 'var(--medium-brown)' }}>
              {step.duration}
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${isEven ? 'text-right' : 'text-left'}`} style={{ color: 'var(--darkest-brown)' }}>
              {step.title}
            </h3>
            <p className={`text-lg ${isEven ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-secondary)' }}>
              {step.description}
            </p>

            {/* Outcome chips */}
            <div className={`mt-4 flex flex-wrap gap-2 text-xs ${isEven ? 'justify-end' : 'justify-start'}`}>
              {deliverable && (
                <span className="px-2 py-1 rounded-full border" style={{ borderColor: 'var(--light-brown)' }}>
                  Deliverable: {deliverable}
                </span>
              )}
              <span className="px-2 py-1 rounded-full border" style={{ borderColor: 'var(--light-brown)' }}>
                Time: {step.duration}
              </span>
              {impact && (
                <span
                  className="px-2 py-1 rounded-full border"
                  style={{ backgroundColor: 'var(--light-brown)', color: 'var(--darkest-brown)', borderColor: 'var(--light-brown)' }}
                >
                  Impact: {impact}
                </span>
              )}
            </div>

            <div
              className={`text-xs font-medium mt-3 px-3 py-1 rounded-full inline-block ${isEven ? 'float-right' : 'float-left'}`}
              style={{ backgroundColor: 'var(--light-brown)', color: 'var(--darkest-brown)' }}
            >
              {step.phase}
            </div>
          </div>
        </div>

        <div className="w-2/12 flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 bg-white relative z-10"
            style={{ borderColor: 'var(--medium-brown)' }}
          >
            <Icon size={32} style={{ color: 'var(--medium-brown)' }} />
          </div>
        </div>

        <div className="w-5/12" />
      </div>
    </div>
  );
}
