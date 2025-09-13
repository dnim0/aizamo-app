// frontend/src/pages/SolutionsIndex.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { solutions } from '@/data/solutions';

export default function SolutionsIndex() {
  const core = solutions.filter(s => s.group === 'core');
  const plug = solutions.filter(s => s.group === 'plug');

  return (
    <section
      id="solutions-index"
      className="section"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      <div className="container page-pad space-y-10">
        {/* Header — match Industries/About/Get Started */}
        <header className="text-center mb-4">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Automation Solutions
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Modular building blocks and bundled systems to speed up lead response, reduce no-shows, and grow reviews.
          </p>
        </header>

        {/* Core */}
        {core.length > 0 && (
          <section className="space-y-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--darkest-brown)' }}
            >
              Core
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {core.map((s) => (
                <Link
                  key={s.slug}
                  to={`/solutions/${s.slug}`}
                  className="block rounded-2xl border-2 p-5 hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs inline-flex px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)' }}>Core</span>
                    <span className="font-semibold" style={{ color: 'var(--darkest-brown)' }}>{s.title}</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {s.outcomes || s.summary}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm" style={{ color: 'var(--medium-brown)' }}>
                    Learn more →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Plug-and-Play */}
        {plug.length > 0 && (
          <section className="space-y-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--darkest-brown)' }}
            >
              Plug-and-Play
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plug.map((s) => (
                <Link
                  key={s.slug}
                  to={`/solutions/${s.slug}`}
                  className="block rounded-2xl border-2 p-5 hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs inline-flex px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)' }}>Plug</span>
                    <span className="font-semibold" style={{ color: 'var(--darkest-brown)' }}>{s.title}</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {s.summary || s.outcomes}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm" style={{ color: 'var(--medium-brown)' }}>
                    Learn more →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer CTAs */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/get-started"
            className="px-5 py-3 rounded-xl text-white"
            style={{ background: 'var(--medium-brown)' }}
          >
            Get Started
          </Link>
          <Link
            to="/pricing"
            className="px-5 py-3 rounded-xl border"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
