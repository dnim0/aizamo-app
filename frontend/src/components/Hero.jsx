// frontend/src/components/Hero.jsx
import React, { useEffect, useRef, useState } from 'react';
import CTAButton from './CTAButton';

export default function Hero({
  kicker = '',
  titleTop = 'Automate the Ordinary',
  titleBottom = 'Scale the Extraordinary',
  typewriter = 'The future of business is automated. Transform your organization with intelligent systems that work for you. From automated workflows to lead conversion optimization, we have you covered.',
  // Defaults now use routes instead of scroll targets
  primaryCta = { label: 'Get Started', to: '/get-started' },
  secondaryCta = { label: 'View Solutions', to: '/solutions' },
}) {
  const particlesRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [typed, setTyped] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  const useCounter = (end, duration = 2000, start = 0) => {
    const [count, setCount] = useState(start);
    const [shouldStart, setShouldStart] = useState(false);
    useEffect(() => {
      if (!shouldStart) return;
      let startTime;
      const animate = (t) => {
        if (!startTime) startTime = t;
        const progress = Math.min((t - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * (end - start) + start));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [shouldStart, end, duration, start]);
    return [count, setShouldStart];
  };

  const [hoursCount, setHoursStart] = useCounter(15, 2000);
  const [conversionCount, setConversionStart] = useCounter(40, 2200);
  const [roiCount, setRoiStart] = useCounter(60, 2400);

  useEffect(() => {
    if (!isVisible) return;
    let i = 0, raf, last = 0;
    const speed = 30;
    const step = (t) => {
      if (t - last >= speed) {
        if (i < typewriter.length) {
          setTyped(typewriter.slice(0, i + 1));
          i++; last = t;
        } else {
          setTypewriterComplete(true);
          setTimeout(() => {
            setStatsAnimated(true);
            setHoursStart(true);
            setTimeout(() => setConversionStart(true), 200);
            setTimeout(() => setRoiStart(true), 400);
          }, 500);
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [isVisible, typewriter, setHoursStart, setConversionStart, setRoiStart]);

  useEffect(() => {
    const createAdvancedParticle = () => {
      if (!particlesRef.current) return;
      const el = document.createElement('div');
      const p = Math.random();
      el.className = p < 0.6 ? 'advanced-particle regular' : p < 0.85 ? 'advanced-particle glow' : 'advanced-particle sparkle';
      const size = Math.random() * 4 + 1;
      const sx = Math.random() * 100, sy = Math.random() * 100;
      const ex = sx + (Math.random() - 0.5) * 40;
      const ey = sy - Math.random() * 60 - 20;
      const dur = Math.random() * 4 + 6;
      const delay = Math.random() * 3;
      const rot = Math.random() * 360;
      el.style.cssText = `
        position:absolute;left:${sx}%;top:${sy}%;width:${size}px;height:${size}px;
        --end-x:${ex}%;--end-y:${ey}%;--rotation:${rot}deg;
        will-change:transform,opacity;backface-visibility:hidden;transform:translate3d(0,0,0);
        animation:advancedFloat ${dur}s ease-out ${delay}s forwards;
      `;
      particlesRef.current.appendChild(el);
      setTimeout(() => el.parentNode && el.parentNode.removeChild(el), (dur + delay) * 1000);
    };
    const burst = () => { for (let i = 0; i < 3; i++) setTimeout(createAdvancedParticle, i * 100); };
    burst();
    const interval = setInterval(createAdvancedParticle, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setIsVisible(true)),
      { threshold: 0.3 }
    );
    const el = document.getElementById('hero');
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  // Resolve labels/links (allows you to override via props if needed)
  const primaryLabel = primaryCta?.label || 'Get Started';
  const primaryTo = primaryCta?.to || '/get-started';
  const secondaryLabel = secondaryCta?.label || 'View Solutions';
  const secondaryTo = secondaryCta?.to || '/solutions';

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(219, 193, 172, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(150, 114, 89, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(236, 224, 209, 0.4) 0%, transparent 50%),
          linear-gradient(135deg, var(--cream) 0%, var(--light-brown) 100%)
        `
      }}
    >
      <div ref={particlesRef} className="particles-container"></div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full interactive-bg-element" style={{ background: 'var(--medium-brown)' }}></div>
        <div className="absolute top-40 right-20 w-20 h-20 rotate-45 interactive-bg-element" style={{ background: 'var(--dark-brown)' }}></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full interactive-bg-element" style={{ background: 'var(--medium-brown)' }}></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 rotate-12 interactive-bg-element" style={{ background: 'var(--dark-brown)' }}></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {kicker && (
            <div className="inline-flex items-center justify-center">
              <span className="px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide text-gray-600">
                {kicker}
              </span>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 enhanced-fade-in-up">
            <div className="flex flex-col items-center">
              <span style={{ color: 'var(--medium-brown)' }}>{titleTop}</span>
              <div className="flex items-center my-4 w-full max-w-md">
                <div className="flex-grow h-px opacity-40" style={{ background: 'linear-gradient(to right, transparent, var(--medium-brown), transparent)' }}></div>
                <div className="px-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--medium-brown)' }}></div>
                </div>
                <div className="flex-grow h-px opacity-40" style={{ background: 'linear-gradient(to right, var(--medium-brown), var(--medium-brown), transparent)' }}></div>
              </div>
              <span style={{ color: 'var(--darkest-brown)' }}>{titleBottom}</span>
            </div>
          </h1>

          <div
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto min-h-[120px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p className="typewriter-container">
              {typed}
              {!typewriterComplete && <span className="typewriter-cursor">|</span>}
            </p>
          </div>

          {/* CTAs — dark primary and light secondary (Services page styling) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CTAButton
              label={primaryLabel}
              to={primaryTo}
              variant="dark"
              size="lg"
            />
            <CTAButton
              label={secondaryLabel}
              to={secondaryTo}
              variant="light"
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center stats-card">
              <div
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ color: 'var(--medium-brown)', transform: statsAnimated ? 'scale(1)' : 'scale(0.8)', opacity: statsAnimated ? 1 : 0.5 }}
              >
                {hoursCount}+
              </div>
              <div style={{ color: 'var(--text-light)' }}>Hours Saved Weekly</div>
            </div>
            <div className="text-center stats-card">
              <div
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ color: 'var(--medium-brown)', transform: statsAnimated ? 'scale(1)' : 'scale(0.8)', opacity: statsAnimated ? 1 : 0.5 }}
              >
                {conversionCount}%
              </div>
              <div style={{ color: 'var(--text-light)' }}>Increase in Conversions</div>
            </div>
            <div className="text-center stats-card">
              <div
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ color: 'var(--medium-brown)', transform: statsAnimated ? 'scale(1)' : 'scale(0.8)', opacity: statsAnimated ? 1 : 0.5 }}
              >
                {roiCount}%
              </div>
              <div style={{ color: 'var(--text-light)' }}>Better ROI on Ads</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
