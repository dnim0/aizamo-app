import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockData } from '../data/mock';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === mockData.testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === mockData.testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? mockData.testimonials.length - 1 : prevIndex - 1
    );
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={20}
        fill={i < rating ? 'var(--medium-brown)' : 'none'}
        color={i < rating ? 'var(--medium-brown)' : 'var(--light-brown)'}
      />
    ));
  };

  return (
    <section 
      id="testimonials" 
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
            What Our Clients Think
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
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
            className="bg-gradient-to-br p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, var(--cream) 0%, var(--light-brown) 100%)` 
            }}
          >
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110 z-10"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <ChevronLeft size={24} color="white" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110 z-10"
              style={{ backgroundColor: 'var(--medium-brown)' }}
            >
              <ChevronRight size={24} color="white" />
            </button>

            {/* Testimonial Content */}
            <div className="text-center px-12">
              {/* Stars */}
              <div className="flex justify-center items-center mb-6">
                {renderStars(mockData.testimonials[currentIndex].rating)}
              </div>

              {/* Review Text */}
              <blockquote 
                className="text-xl md:text-2xl font-medium mb-8 leading-relaxed"
                style={{ color: 'var(--darkest-brown)' }}
              >
                "{mockData.testimonials[currentIndex].review}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center justify-center">
                <img
                  src={mockData.testimonials[currentIndex].image}
                  alt={mockData.testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full mr-4 object-cover border-3"
                  style={{ borderColor: 'var(--medium-brown)' }}
                />
                <div className="text-left">
                  <h4 
                    className="text-lg font-bold"
                    style={{ color: 'var(--darkest-brown)' }}
                  >
                    {mockData.testimonials[currentIndex].name}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {mockData.testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center mt-8 space-x-3">
            {mockData.testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === currentIndex 
                    ? 'var(--medium-brown)' 
                    : 'var(--light-brown)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Secondary Reviews Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {mockData.testimonials.slice(0, 3).map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="p-6 rounded-2xl border-2 hover:shadow-lg transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--cream)',
                borderColor: 'var(--light-brown)'
              }}
            >
              {/* Stars */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Short Review */}
              <p 
                className="text-sm mb-4 line-clamp-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                "{testimonial.review.substring(0, 120)}..."
              </p>
              
              {/* Client */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h5 
                    className="text-sm font-semibold"
                    style={{ color: 'var(--darkest-brown)' }}
                  >
                    {testimonial.name}
                  </h5>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-light)' }}
                  >
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;