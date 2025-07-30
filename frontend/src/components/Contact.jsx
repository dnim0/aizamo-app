import React, { useState } from 'react';
import { Send, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { mockData } from '../data/mock';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Use environment variable for backend URL on Emergent platform
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitting(false);
        setSubmitMessage('Thank you! We\'ll get back to you within 12 hours.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          phone: '',
          service: '',
          message: ''
        });
        
        // Clear message after 8 seconds
        setTimeout(() => {
          setSubmitMessage('');
        }, 8000);
      } else {
        throw new Error(data.detail || 'Failed to submit form');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      setSubmitMessage(`Error: ${error.message}. Please try again or contact us directly at hello@aizamo.com`);
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 10000);
    }
  };

  const scheduleCall = () => {
    // Mock calendar booking action
    alert('Calendar booking would open here. Integration with Calendly or similar service will be added in backend development.');
  };

  return (
    <section 
      id="contact" 
      className="section"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Let's Get Started
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ready to transform your business with AI? Get in touch and let's discuss 
            how we can help you achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div 
            className="p-8 rounded-2xl"
            style={{ backgroundColor: 'var(--white)' }}
          >
            <h3 
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--darkest-brown)' }}
            >
              Send us a message
            </h3>
            
            {submitMessage && (
              <div 
                className="p-4 rounded-lg mb-6 border"
                style={{ 
                  backgroundColor: 'var(--light-brown)',
                  borderColor: 'var(--medium-brown)',
                  color: 'var(--darkest-brown)'
                }}
              >
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                    style={{ 
                      backgroundColor: 'var(--cream)',
                      borderColor: 'var(--light-brown)'
                    }}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                    style={{ 
                      backgroundColor: 'var(--cream)',
                      borderColor: 'var(--light-brown)'
                    }}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                  style={{ 
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--light-brown)'
                  }}
                  placeholder="john@company.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                    style={{ 
                      backgroundColor: 'var(--cream)',
                      borderColor: 'var(--light-brown)'
                    }}
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                    style={{ 
                      backgroundColor: 'var(--cream)',
                      borderColor: 'var(--light-brown)'
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Service Interest *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                  style={{ 
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--light-brown)'
                  }}
                >
                  <option value="">Select a service</option>
                  {mockData.contactFields.find(field => field.name === 'service').options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  We're listening - Start typing! *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors resize-vertical"
                  style={{ 
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--light-brown)'
                  }}
                  placeholder="What challenges are you hoping to solve?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Send Message</span>
                    <Send size={20} />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info & Calendar */}
          <div className="space-y-8">
            {/* Schedule Call */}
            <div 
              className="p-8 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--light-brown)' }}
            >
              <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--medium-brown)' }} />
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--darkest-brown)' }}
              >
                Schedule a Call
              </h3>
              <p 
                className="text-lg mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                Prefer to talk? Book a free 30-minute consultation call to discuss your AI automation needs.
              </p>
              <button
                onClick={scheduleCall}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Book Free Consultation
              </button>
            </div>

            {/* Contact Information */}
            <div 
              className="p-8 rounded-2xl"
              style={{ backgroundColor: 'var(--white)' }}
            >
              <h3 
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--darkest-brown)' }}
              >
                Get in Touch
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail size={20} className="mr-4" style={{ color: 'var(--medium-brown)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>hello@aizamo.com</span>
                </div>
                <div className="flex items-center">
                  <Phone size={20} className="mr-4" style={{ color: 'var(--medium-brown)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>+1 (403) 800-3135</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={20} className="mr-4" style={{ color: 'var(--medium-brown)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Remote Services Globally</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--light-brown)' }}>
                <h4 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--darkest-brown)' }}
                >
                  Response Time
                </h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We typically respond within 12 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;