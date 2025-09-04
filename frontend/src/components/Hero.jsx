import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  const particlesRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  const fullText = "The future of business is automated. Transform your organization with intelligent systems that work for you. From automated workflows to lead conversion optimization, we have you covered.";
  
  // Animated counter hook
  const useCounter = (end, duration = 2000, start = 0) => {
    const [count, setCount] = useState(start);
    const [shouldStart, setShouldStart] = useState(false);

    useEffect(() => {
      if (!shouldStart) return;
      
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOutCubic * (end - start) + start);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [shouldStart, end, duration, start]);

    return [count, setShouldStart];
  };

  const [hoursCount, setHoursStart] = useCounter(15, 2000);
  const [conversionCount, setConversionStart] = useCounter(40, 2200);
  const [roiCount, setRoiStart] = useCounter(60, 2400);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;
    
    let index = 0;
    let animationFrame;
    let lastTime = 0;
    const typingSpeed = 30; // Reduced from 50ms for smoother typing
    
    const typeNextCharacter = (currentTime) => {
      if (currentTime - lastTime >= typingSpeed) {
        if (index < fullText.length) {
          setTypewriterText(fullText.slice(0, index + 1));
          index++;
          lastTime = currentTime;
        } else {
          setTypewriterComplete(true); // Mark typewriter as complete
          // Trigger stats animation after typewriter completes
          setTimeout(() => {
            setStatsAnimated(true);
            setHoursStart(true);
            setTimeout(() => setConversionStart(true), 200);
            setTimeout(() => setRoiStart(true), 400);
          }, 500); // Small delay after typewriter finishes
          return; // Stop the animation loop
        }
      }
      animationFrame = requestAnimationFrame(typeNextCharacter);
    };
    
    animationFrame = requestAnimationFrame(typeNextCharacter);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible]);

  // Enhanced particle system
  useEffect(() => {
    const createAdvancedParticle = () => {
      if (!particlesRef.current) return;

      const particle = document.createElement('div');
      const particleType = Math.random();
      
      // Different particle types for variety
      if (particleType < 0.6) {
        // Regular particles
        particle.className = 'advanced-particle regular';
      } else if (particleType < 0.85) {
        // Glow particles
        particle.className = 'advanced-particle glow';
      } else {
        // Sparkle particles
        particle.className = 'advanced-particle sparkle';
      }
      
      // Random properties for dynamic behavior
      const size = Math.random() * 4 + 1;
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = startX + (Math.random() - 0.5) * 40;
      const endY = startY - Math.random() * 60 - 20;
      const duration = Math.random() * 4 + 6;
      const delay = Math.random() * 3;
      const rotation = Math.random() * 360;
      
      // Use CSS custom properties for GPU optimization
      particle.style.cssText = `
        position: absolute;
        left: ${startX}%;
        top: ${startY}%;
        width: ${size}px;
        height: ${size}px;
        --end-x: ${endX}%;
        --end-y: ${endY}%;
        --rotation: ${rotation}deg;
        will-change: transform, opacity;
        backface-visibility: hidden;
        transform: translate3d(0, 0, 0);
        animation: advancedFloat ${duration}s ease-out ${delay}s forwards;
      `;
      
      particlesRef.current.appendChild(particle);
      
      // Remove particle after animation with cleanup
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, (duration + delay) * 1000);
    };

    // Optimize particle creation timing
    const createBurst = () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(createAdvancedParticle, i * 100);
      }
    };

    // Initial burst
    createBurst();
    
    // Continue creating particles with optimized intervals
    const interval = setInterval(createAdvancedParticle, 600);

    return () => clearInterval(interval);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Stats animation will now be triggered by typewriter completion
          }
        });
      },
      { threshold: 0.3 }
    );

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32"
      style={{ 
        background: `
          radial-gradient(circle at 20% 80%, rgba(219, 193, 172, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(150, 114, 89, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(236, 224, 209, 0.4) 0%, transparent 50%),
          linear-gradient(135deg, var(--cream) 0%, var(--light-brown) 100%)
        `
      }}
    >
      {/* Enhanced Animated Particles Background */}
      <div ref={particlesRef} className="particles-container"></div>
      
      {/* Interactive Geometric Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-20 left-10 w-32 h-32 rounded-full interactive-bg-element"
          style={{ background: 'var(--medium-brown)' }}
        ></div>
        <div 
          className="absolute top-40 right-20 w-20 h-20 rotate-45 interactive-bg-element"
          style={{ background: 'var(--dark-brown)' }}
        ></div>
        <div 
          className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full interactive-bg-element"
          style={{ background: 'var(--medium-brown)' }}
        ></div>
        <div 
          className="absolute bottom-20 right-1/3 w-24 h-24 rotate-12 interactive-bg-element"
          style={{ background: 'var(--dark-brown)' }}
        ></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enhanced Main Heading with New Slogan */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 enhanced-fade-in-up">
            <div className="flex flex-col items-center">
              <span style={{ color: 'var(--medium-brown)' }}>Automate the Ordinary</span>
              
              {/* Stylish Dividing Line */}
              <div className="flex items-center my-4 w-full max-w-md">
                <div 
                  className="flex-grow h-px opacity-40"
                  style={{ background: 'linear-gradient(to right, transparent, var(--medium-brown), transparent)' }}
                ></div>
                <div className="px-4">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--medium-brown)' }}
                  ></div>
                </div>
                <div 
                  className="flex-grow h-px opacity-40"
                  style={{ background: 'linear-gradient(to right, var(--medium-brown), var(--medium-brown), transparent)' }}
                ></div>
              </div>
              
              <span style={{ color: 'var(--darkest-brown)' }}>Scale the Extraordinary</span>
            </div>
          </h1>

          {/* Typewriter Effect Subheading */}
          <div 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto min-h-[120px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p className="typewriter-container">
              {typewriterText}
              {!typewriterComplete && <span className="typewriter-cursor">|</span>}
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center enhanced-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            <button
              onClick={scrollToContact}
              className="btn btn-primary text-lg py-4 group enhanced-hover"
              style={{ 
                padding: '16px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                minWidth: '200px',
                whiteSpace: 'nowrap'
              }}
            >
              Get Started
              <ArrowRight 
                size={20} 
                className="group-hover:translate-x-2 transition-transform duration-300" 
                style={{ flexShrink: 0 }}
              />
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-secondary-dark text-lg px-8 py-4 enhanced-hover"
            >
              View Our Services
            </button>
          </div>

          {/* Animated Stats */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 enhanced-fade-in-up"
            style={{ animationDelay: '1s' }}
          >
            <div className="text-center stats-card">
              <div 
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ 
                  color: 'var(--medium-brown)',
                  transform: statsAnimated ? 'scale(1)' : 'scale(0.8)',
                  opacity: statsAnimated ? 1 : 0.5
                }}
              >
                {hoursCount}+
              </div>
              <div style={{ color: 'var(--text-light)' }}>Hours Saved Weekly</div>
            </div>
            <div className="text-center stats-card">
              <div 
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ 
                  color: 'var(--medium-brown)',
                  transform: statsAnimated ? 'scale(1)' : 'scale(0.8)',
                  opacity: statsAnimated ? 1 : 0.5
                }}
              >
                {conversionCount}%
              </div>
              <div style={{ color: 'var(--text-light)' }}>Increase in Conversions</div>
            </div>
            <div className="text-center stats-card">
              <div 
                className="text-4xl font-bold mb-2 transition-all duration-1000"
                style={{ 
                  color: 'var(--medium-brown)',
                  transform: statsAnimated ? 'scale(1)' : 'scale(0.8)',
                  opacity: statsAnimated ? 1 : 0.5
                }}
              >
                {roiCount}%
              </div>
              <div style={{ color: 'var(--text-light)' }}>Better ROI on Ads</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;