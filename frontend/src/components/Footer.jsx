import React from 'react';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer 
      className="relative"
      style={{ backgroundColor: 'var(--darkest-brown)' }}
    >
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4 text-white">AIzamo</h3>
            <p 
              className="text-lg mb-6 max-w-md"
              style={{ color: 'var(--light-brown)' }}
            >
              Transform your small business with intelligent AI solutions. 
              From automated workflows to lead conversion optimization, 
              we help you save time and increase revenue.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail size={18} className="mr-3" style={{ color: 'var(--medium-brown)' }} />
                <span style={{ color: 'var(--light-brown)' }}>hello@aizamo.com</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-3" style={{ color: 'var(--medium-brown)' }} />
                <span style={{ color: 'var(--light-brown)' }}>+1 (403) 800-3135</span>
              </div>
              <div className="flex items-center">
                <MapPin size={18} className="mr-3" style={{ color: 'var(--medium-brown)' }} />
                <span style={{ color: 'var(--light-brown)' }}>Remote Services Globally</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:opacity-80 transition-opacity text-left"
                  style={{ color: 'var(--light-brown)' }}
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:opacity-80 transition-opacity text-left"
                  style={{ color: 'var(--light-brown)' }}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="hover:opacity-80 transition-opacity text-left"
                  style={{ color: 'var(--light-brown)' }}
                >
                  Client Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('roadmap')}
                  className="hover:opacity-80 transition-opacity text-left"
                  style={{ color: 'var(--light-brown)' }}
                >
                  Our Process
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:opacity-80 transition-opacity text-left"
                  style={{ color: 'var(--light-brown)' }}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Services</h4>
            <ul className="space-y-2">
              <li style={{ color: 'var(--light-brown)' }}>AI Automations</li>
              <li style={{ color: 'var(--light-brown)' }}>Website Management</li>
              <li style={{ color: 'var(--light-brown)' }}>SEO Optimization</li>
              <li style={{ color: 'var(--light-brown)' }}>Ad Management</li>
              <li style={{ color: 'var(--light-brown)' }}>Lead Conversion</li>
              <li style={{ color: 'var(--light-brown)' }}>AI Agents</li>
              <li style={{ color: 'var(--light-brown)' }}>Business Automation</li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div 
          className="mt-12 pt-8 border-t"
          style={{ borderColor: 'var(--dark-brown)' }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold mb-4 text-white">
              Stay Updated with AI Trends
            </h4>
            <p 
              className="mb-6"
              style={{ color: 'var(--light-brown)' }}
            >
              Get the latest insights on AI automation and business growth strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-2 bg-transparent focus:outline-none focus:border-medium-brown transition-colors text-white placeholder-gray-400"
                style={{ borderColor: 'var(--dark-brown)' }}
              />
              <button 
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--medium-brown)',
                  color: 'white'
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t py-6"
        style={{ borderColor: 'var(--dark-brown)' }}
      >
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p style={{ color: 'var(--light-brown)' }}>
            © {currentYear} AIzamo. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <button 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--light-brown)' }}
            >
              Privacy Policy
            </button>
            <button 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--light-brown)' }}
            >
              Terms of Service
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <ArrowUp size={20} color="white" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;