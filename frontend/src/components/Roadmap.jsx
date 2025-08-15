import React from 'react';
import { Search, Lightbulb, Cog, Rocket, ArrowDown } from 'lucide-react';
import { mockData } from '../data/mock';

const Roadmap = () => {
  const iconMap = {
    Search: Search,
    Lightbulb: Lightbulb,
    Cog: Cog,
    Rocket: Rocket
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="roadmap" 
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
            Our Process
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            A proven 4-step approach to transform your business with AI automation
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-transparent via-medium-brown to-transparent"
              style={{ 
                height: 'calc(100% - 200px)',
                top: '100px',
                background: `linear-gradient(to bottom, transparent 0%, var(--medium-brown) 20%, var(--medium-brown) 80%, transparent 100%)`
              }}
            ></div>

            {mockData.roadmap.map((step, index) => {
              const IconComponent = iconMap[step.icon];
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center mb-16 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`w-5/12 ${isEven ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div 
                      className="p-6 rounded-2xl shadow-lg border-2"
                      style={{ 
                        backgroundColor: 'var(--cream)',
                        borderColor: 'var(--light-brown)'
                      }}
                    >
                      <div 
                        className={`text-sm font-bold mb-2 ${isEven ? 'text-right' : 'text-left'}`}
                        style={{ color: 'var(--medium-brown)' }}
                      >
                        {step.duration}
                      </div>
                      <h3 
                        className={`text-2xl font-bold mb-3 ${isEven ? 'text-right' : 'text-left'}`}
                        style={{ color: 'var(--darkest-brown)' }}
                      >
                        {step.title}
                      </h3>
                      <p 
                        className={`text-lg ${isEven ? 'text-right' : 'text-left'}`}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {step.description}
                      </p>
                      <div 
                        className={`text-xs font-medium mt-3 px-3 py-1 rounded-full inline-block ${
                          isEven ? 'float-right' : 'float-left'
                        }`}
                        style={{ 
                          backgroundColor: 'var(--light-brown)',
                          color: 'var(--darkest-brown)'
                        }}
                      >
                        {step.phase}
                      </div>
                    </div>
                  </div>

                  {/* Icon Circle */}
                  <div className="w-2/12 flex justify-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 bg-white relative z-10"
                      style={{ borderColor: 'var(--medium-brown)' }}
                    >
                      <IconComponent size={32} style={{ color: 'var(--medium-brown)' }} />
                    </div>
                  </div>

                  {/* Empty space for opposite side */}
                  <div className="w-5/12"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h4 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--darkest-brown)' }}
            >
              No Upfront Costs
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Free consultation and analysis to understand your needs
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h4 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--darkest-brown)' }}
            >
              Custom Solutions
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Tailored AI automation designed specifically for your business
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h4 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--darkest-brown)' }}
            >
              Ongoing Support
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Continuous monitoring and optimization for maximum results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;