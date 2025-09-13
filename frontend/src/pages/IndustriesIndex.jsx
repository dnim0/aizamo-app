import React from 'react';
import { Link } from 'react-router-dom';
import { industries } from '@/data/industries';
import CTAButton from '@/components/CTAButton';

export default function IndustriesIndex() {
  return (
    <section id="industries-index" className="section" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container page-pad">
        {/* Header (matches About styling) */}
        <div className="text-center mb-12 md:mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Industries We Serve
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Deploy what already works in businesses like yours—without the guesswork.
          </p>
        </div>

        {/* Industry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {industries.map((i) => (
            <Link
              key={i.slug}
              to={`/industries/${i.slug}`}
              className="block p-6 rounded-2xl border-2 hover:shadow-xl transition-all"
              style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
            >
              <div
                className="text-xs inline-flex px-2 py-0.5 rounded-full border"
                style={{ borderColor: 'var(--light-brown)' }}
              >
                Industry
              </div>
              <h2 className="text-2xl font-bold mt-3" style={{ color: 'var(--darkest-brown)' }}>
                {i.title}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                {i.subtitle}
              </p>
              <div
                className="mt-4 text-sm underline underline-offset-4"
                style={{ color: 'var(--medium-brown)' }}
              >
                View details →
              </div>
            </Link>
          ))}
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <CTAButton
            to="/get-started"
            label="Get Started"
            variant="dark"
            size="md"
            className="px-8 py-3 rounded-xl"
          />
          <Link to="/solutions" className="px-8 py-3 rounded-xl border">
            Browse Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}