// frontend/src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <section
      id="about-page"
      className="section"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      <div className="container page-pad">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            About AIzamo
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your trusted partner in AI-powered business transformation
          </p>
        </div>

        {/* Two-column: photo + founder note */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Headshot */}
          <div className="order-2 lg:order-1">
            <figure
              className="
                relative w-full mx-auto
                aspect-[4/5] lg:aspect-square
                rounded-2xl border-4 overflow-hidden shadow-lg
                max-w-sm sm:max-w-md lg:max-w-none
              "
              style={{
                borderColor: 'var(--medium-brown)',
                backgroundColor: 'var(--light-brown)'
              }}
            >
              <img
                src="/images/daneel-headshot.jpg"
                alt="Daneel Nizamov headshot"
                className="absolute inset-0 w-full h-full object-cover object-center"
                width={1000}
                height={1250}
                loading="lazy"
              />
              <figcaption className="sr-only">
                Daneel Nizamov — Creator and Founder
              </figcaption>
            </figure>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: 'var(--darkest-brown)' }}
              >
                Where My Journey Meets Yours
              </h2>
              <div
                className="p-6 rounded-xl border-2 border-dashed"
                style={{
                  backgroundColor: 'var(--white)',
                  borderColor: 'var(--light-brown)'
                }}
              >
                <p
                  className="text-lg italic"
                  style={{ color: 'var(--text-light)' }}
                >
                  "I've seen the inside of small businesses where everything feels like
                  chaos—manual tasks, unclear systems, too much to manage. That's where I
                  started. Inspired by the potential of AI to fix these very issues, I
                  launched AIzamo. Now, I work with business owners across industries and
                  regions to replace chaos with clarity—using smart automation to make
                  day-to-day work faster, simpler, and more scalable."
                </p>
                <p
                  className="text-sm mt-4 font-medium"
                  style={{ color: 'var(--medium-brown)' }}
                >
                  – Daneel Nizamov, Creator and Founder
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--medium-brown)' }}
                >
                  <Award size={24} color="white" />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Expert-Level
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                  Proven AI solutions
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--medium-brown)' }}
                >
                  <Users size={24} color="white" />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Client-Focused
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                  Your success first
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--medium-brown)' }}
                >
                  <Zap size={24} color="white" />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Results-Driven
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                  Measurable impact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA footer */}
        <div className="mt-14 flex flex-wrap gap-3 justify-center">
          <Link
            to="/get-proposal"
            className="px-5 py-3 rounded-xl text-white"
            style={{ background: 'var(--medium-brown)' }}
          >
            Get a Proposal
          </Link>
          <Link
            to="/solutions"
            className="px-5 py-3 rounded-xl border"
          >
            See Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
