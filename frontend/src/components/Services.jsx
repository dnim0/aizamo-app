// File: src/sections/Services.jsx  (REPLACE FILE)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Globe, Target, Users, ArrowRight, Zap, CalendarCheck, Workflow } from 'lucide-react';
import CTAButton from '../components/CTAButton';
import CalendlyButton from '../components/CalendlyButton';
import { mockData } from '../data/mock';

const iconMap = { Bot, Globe, Target, Users };

const track = (name, props = {}) => {
  try {
    window.gtag?.('event', name, props);
    window.plausible?.(name, { props });
    window.posthog?.capture?.(name, props);
  } catch {}
};

export default function Services() {
  const navigate = useNavigate();
  const calendlyUrl = 'https://calendly.com/dnizamov/aizamo-website-appointment-booking';

  const goGetStarted = (interest) => {
    const qs = interest ? `?source=services&interest=${encodeURIComponent(interest)}` : '';
    track('services_cta_click', { interest: interest || '(none)', from: 'services_section' });
    navigate(`/get-started${qs}`);
  };

  const goSolutions = (cardTitle) => {
    track('services_card_click', { card: cardTitle });
    navigate('/solutions');
  };

  return (
    <section id="services" className="section" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Our Services
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Practical AI to move the numbers—faster lead response, fewer no-shows, and less manual work.
          </p>

          {/* Outcome chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--medium-brown)', background: 'var(--cream)' }}>
              <span className="inline-flex items-center gap-1 align-middle">
                <Zap size={14} /> Speed-to-lead ↑
              </span>
            </span>
            <span className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--medium-brown)', background: 'var(--cream)' }}>
              <span className="inline-flex items-center gap-1 align-middle">
                <CalendarCheck size={14} /> No-shows ↓
              </span>
            </span>
            <span className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--medium-brown)', background: 'var(--cream)' }}>
              <span className="inline-flex items-center gap-1 align-middle">
                <Workflow size={14} /> Busywork → Automated
              </span>
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {mockData.services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Bot;
            return (
              <div
                key={service.id}
                role="button"
                tabIndex={0}
                className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--light-brown)',
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={() => goSolutions(service.title)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goSolutions(service.title)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--medium-brown)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--light-brown)';
                }}
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--medium-brown)' }}
                >
                  <IconComponent size={32} color="white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--darkest-brown)' }}>
                  {service.title}
                </h3>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: 'var(--medium-brown)' }} />
                      <span style={{ color: 'var(--text-light)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA (kept as Get Started → /get-started) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goGetStarted(service.title);
                  }}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-md"
                  style={{
                    color: 'var(--medium-brown)',
                    borderColor: 'var(--medium-brown)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--medium-brown)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--medium-brown)';
                  }}
                  aria-label={`Get started with ${service.title}`}
                  title={`Get started with ${service.title}`}
                >
                  Get Started
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--light-brown)' }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--darkest-brown)' }}>
            Ready to Start Your AI Journey?
          </h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Discover how custom automation can work for you—let’s build your transformation plan together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CTAButton
              to="/get-started"
              label="Get Started"
              variant="dark"
              size="md"
              className="px-8 py-3 rounded-xl"
              onClick={() => track('services_bottom_get_started', { from: 'services_bottom_band' })}
            />
            <CalendlyButton
              url={calendlyUrl}
              className="btn btn-secondary-dark text-lg px-8 py-3 rounded-xl enhanced-hover"
              onClick={() => track('services_bottom_consult', { from: 'services_bottom_band' })}
            >
              Schedule Your Free Consultation
            </CalendlyButton>
          </div>
        </div>
      </div>
    </section>
  );
}
