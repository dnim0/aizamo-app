// File: frontend/src/components/About.jsx
import React from 'react';
import { Award, Users, Zap } from 'lucide-react';

const About = () => {
  return (
    <section
      id="about"
      className="section"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      {/* add mobile gutters; desktop unchanged */}
      <div className="container page-pad">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            About AIzamo
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your trusted partner in AI-powered business transformation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Professional Headshot */}
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
              {/* Centered image on all screens */}
              <img
                src="/images/daneel-headshot.jpg"
                alt="Daneel Nizamov headshot"
                className="absolute inset-0 w-full h-full object-cover object-center"
                width={1000}
                height={1250}
                loading="lazy"
              />
              {/* Optional fallback overlay for no-image cases */}
              <figcaption className="sr-only">Daneel Nizamov — Creator and Founder</figcaption>
            </figure>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="mb-8">
              <h3
                className="text-3xl font-bold mb-6"
                style={{ color: 'var(--darkest-brown)' }}
              >
                Where My Journey Meets Yours
              </h3>
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
                  "I've seen the inside of small businesses where everything feels like chaos—manual tasks, unclear systems, too much to manage. That's where I started. Inspired by the potential of AI to fix these very issues, I launched AIzamo. Now, I work with business owners across industries and regions to replace chaos with clarity—using smart automation to make day-to-day work faster, simpler, and more scalable."
                </p>
                <p
                  className="text-sm mt-4 font-medium"
                  style={{ color: 'var(--medium-brown)' }}
                >
                  - Daneel Nizamov, Creator and Founder
                </p>
              </div>
            </div>

            {/* Values/Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--medium-brown)' }}
                >
                  <Award size={24} color="white" />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Expert-Level
                </h4>
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
                <h4 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Client-Focused
                </h4>
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
                <h4 className="font-semibold mb-2" style={{ color: 'var(--darkest-brown)' }}>
                  Results-Driven
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                  Measurable impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
