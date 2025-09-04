// File: frontend/src/components/Testimonials.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockData } from '../data/mock';

/* why: detect mobile so only mobile gets fixed height */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange);
    return () =>
      mql.removeEventListener ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange);
  }, [breakpoint]);
  return isMobile;
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ---- NEW: stable height on mobile ----
  const isMobile = useIsMobile(768);
  const cardRef = useRef(null);
  const measureRef = useRef(null);
  const [fixedHeight, setFixedHeight] = useState(null);

  // measure tallest slide at current width (mobile only)
  useLayoutEffect(() => {
    if (!isMobile) {
      setFixedHeight(null);
      return;
    }
    const measure = () => {
      if (!cardRef.current || !measureRef.current) return;
      // match widths so wrapping is identical
      const w = cardRef.current.clientWidth;
      measureRef.current.style.width = `${w}px`;
      // compute max slide height
      const max = Array.from(measureRef.current.children).reduce((acc, el) => {
        const h = el.offsetHeight || 0;
        return h > acc ? h : acc;
      }, 0);
      if (max > 0) setFixedHeight(max);
    };

    // measure now, on resize, and after fonts load
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(cardRef.current);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [isMobile, mockData.testimonials.length]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === mockData.testimonials.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === mockData.testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? mockData.testimonials.length - 1 : prev - 1
    );
  };

  const renderStars = (rating) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={20}
          fill={i < rating ? 'var(--medium-brown)' : 'none'}
          color={i < rating ? 'var(--medium-brown)' : 'var(--light-brown)'}
        />
      ));

  // single slide content (reused for visible + measurement)
  const Slide = ({ t }) => (
    <div className="text-center px-6 sm:px-10 md:px-12">
      <div className="flex justify-center items-center mb-6">
        {renderStars(t.rating)}
      </div>
      <blockquote
        className={
          // clamp on mobile for extra safety; desktop unchanged
          'text-xl md:text-2xl font-medium mb-8 leading-relaxed line-clamp-6 md:line-clamp-none'
        }
        style={{ color: 'var(--darkest-brown)' }}
      >
        “{t.review}”
      </blockquote>
      <div className="flex items-center justify-center">
        <img
          src={t.image}
          alt={t.name}
          className="w-16 h-16 rounded-full mr-4 object-cover border-3"
          style={{ borderColor: 'var(--medium-brown)' }}
          width={64}
          height={64}
        />
        <div className="text-left">
          <h4 className="text-lg font-bold" style={{ color: 'var(--darkest-brown)' }}>
            {t.name}
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t.company}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="testimonials" className="section" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            What Our Clients Think
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Real results from real businesses who've transformed with AI automation
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div
            ref={cardRef}
            className="bg-gradient-to-br p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, var(--cream) 0%, var(--light-brown) 100%)`,
              // fix height on mobile to the tallest measured slide to prevent page shift
              height: isMobile && fixedHeight ? `${fixedHeight}px` : 'auto'
            }}
          >
            {/* Navigation Buttons (don’t affect height; absolutely positioned) */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110 z-10"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <ChevronLeft size={24} color="white" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110 z-10"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <ChevronRight size={24} color="white" />
            </button>

            {/* Visible slide */}
            <Slide t={mockData.testimonials[currentIndex]} />
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center mt-8 space-x-3">
            {mockData.testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === currentIndex ? 'var(--medium-brown)' : 'var(--light-brown)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Secondary Reviews Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {mockData.testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 rounded-2xl border-2 hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--light-brown)' }}
            >
              <div className="flex items-center mb-4">{renderStars(testimonial.rating)}</div>
              <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                “{testimonial.review.substring(0, 120)}…”
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                  width={40}
                  height={40}
                />
                <div>
                  <h5 className="text-sm font-semibold" style={{ color: 'var(--darkest-brown)' }}>
                    {testimonial.name}
                  </h5>
                  <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offscreen measurer (no layout impact) */}
        <div
          ref={measureRef}
          aria-hidden
          style={{
            position: 'absolute',
            left: '-10000px',
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none'
          }}
        >
          {mockData.testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-gradient-to-br p-8 md:p-12 rounded-3xl shadow-xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, var(--cream) 0%, var(--light-brown) 100%)` }}
            >
              <Slide t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
