import React from 'react';
import { Bot, Globe, Target, Users, ArrowRight } from 'lucide-react';
import { mockData } from '../data/mock';

const Services = () => {
  const iconMap = {
    Bot: Bot,
    Globe: Globe,
    Target: Target,
    Users: Users
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="services" 
      className="section"
      style={{ backgroundColor: 'var(--white)' }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Our Services
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Custom and comprehensive AI solutions designed to simplify workflows, enhance performance, and scale your impact.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {mockData.services.map((service, index) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div 
                key={service.id}
                className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--light-brown)',
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={scrollToContact}
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
                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ color: 'var(--darkest-brown)' }}
                >
                  {service.title}
                </h3>
                <p 
                  className="text-lg mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex}
                      className="flex items-center"
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: 'var(--medium-brown)' }}
                      ></div>
                      <span style={{ color: 'var(--text-light)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking button directly
                    scrollToContact();
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-300 hover:shadow-md"
                  style={{ 
                    color: 'var(--medium-brown)',
                    borderColor: 'var(--medium-brown)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--medium-brown)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--medium-brown)';
                  }}
                >
                  Learn More
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div 
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: 'var(--light-brown)' }}
        >
          <h3 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Ready to Start Your AI Journey?
          </h3>
          <p 
            className="text-lg mb-6 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Discover how custom automation can work for you—let's build your transformation plan together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToContact}
              className="btn btn-primary text-lg px-8 py-4"
            >
              Start Your AI Journey
            </button>
            <button
              onClick={scrollToContact}
              className="btn btn-secondary-dark text-lg px-8 py-4 enhanced-hover"
            >
              Schedule Your Free Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;