import React, { useState, useEffect } from 'react';

const LogoLoadingScreen = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Create pixels and start animation
    const container = document.getElementById('pixel-loading-container');
    if (container) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        createWavePixelFormation(container);
      });
    }

    // Complete loading after animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (onComplete) {
        onComplete();
      }
      // Cleanup animations after completion
      setTimeout(cleanupAnimations, 100);
    }, 8000);

    return () => {
      clearTimeout(timer);
      cleanupAnimations();
    };
  }, [onComplete]);

  const createWavePixelFormation = (container) => {
    const pixelCount = 100;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Clear existing pixels and styles
    container.innerHTML = '';
    const existingStyle = document.getElementById('wave-pixel-animations');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create style element once
    const styleSheet = document.createElement('style');
    styleSheet.id = 'wave-pixel-animations';
    document.head.appendChild(styleSheet);

    // Logo letter positions for targeting
    const logoLetterPositions = [
      {x: 40, y: 50, width: 12, height: 20}, // A
      {x: 55, y: 50, width: 8, height: 20},  // I
      {x: 67, y: 50, width: 12, height: 20}, // z
      {x: 82, y: 50, width: 12, height: 20}, // a
      {x: 97, y: 50, width: 15, height: 20}, // m
      {x: 115, y: 50, width: 12, height: 20} // o
    ];

    // Create document fragment for batch DOM operations
    const fragment = document.createDocumentFragment();
    let animationRules = '';

    for (let i = 0; i < pixelCount; i++) {
      const pixel = document.createElement('div');
      pixel.className = 'wave-pixel';
      
      // Wave formation - pixels flow from left edge
      const wavePhase = (i / pixelCount) * Math.PI * 4;
      const startX = -20;
      const startY = centerY + Math.sin(wavePhase) * 60;

      // Target positions (logo formation)
      const letterIndex = i % logoLetterPositions.length;
      const letterPos = logoLetterPositions[letterIndex];
      const offsetX = (Math.random() - 0.5) * letterPos.width;
      const offsetY = (Math.random() - 0.5) * letterPos.height;
      
      const targetX = (letterPos.x / 100) * containerRect.width + offsetX;
      const targetY = (letterPos.y / 100) * containerRect.height + offsetY;

      // Use transforms instead of left/top for better performance
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      // Set initial position using transform
      pixel.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${Math.random() * 2 + 2}px;
        height: ${Math.random() * 2 + 2}px;
        will-change: transform, opacity;
        backface-visibility: hidden;
        transform: translate3d(0, 0, 0) scale(0.5);
        opacity: 0;
      `;

      // Create optimized animation
      const animationName = `wavePixel-${i}`;
      const delay = i * 10; // Reduced delay for smoother stagger
      
      animationRules += `
        @keyframes ${animationName} {
          0% {
            transform: translate3d(0, 0, 0) scale(0.5);
            opacity: 1;
          }
          20% {
            transform: translate3d(${deltaX * 0.1}px, ${deltaY * 0.1}px, 0) scale(1);
            opacity: 1;
          }
          85% {
            transform: translate3d(${deltaX}px, ${deltaY}px, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.8);
            opacity: 0;
          }
        }
      `;
      
      pixel.style.animation = `${animationName} 3.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms forwards`;
      fragment.appendChild(pixel);
    }

    // Add all animations at once and append all pixels
    styleSheet.textContent = animationRules;
    container.appendChild(fragment);
  };

  // Cleanup function to remove old animations
  const cleanupAnimations = () => {
    const existingStyle = document.getElementById('wave-pixel-animations');
    if (existingStyle) {
      existingStyle.remove();
    }
  };

  if (!isAnimating) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #ece0d1 0%, #dbc1ac 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Pixel Container */}
      <div 
        id="pixel-loading-container"
        className="relative w-full h-full"
        style={{ maxWidth: '800px', maxHeight: '400px' }}
      ></div>

      {/* Logo that appears after pixels */}
      <div 
        className="absolute text-6xl font-bold"
        style={{ 
          color: '#38220f',
          opacity: 0,
          animation: 'cleanFadeIn 1s ease-out 2.5s forwards'
        }}
      >
        AIzamo
        
        {/* Classic Sweep Underline - matches navigation logo */}
        <div className="absolute bottom-0 left-0 w-full">
          {/* Base classic line - always visible after logo appears */}
          <div 
            className="absolute bottom-0 left-0 h-0.5"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, #967259 30%, #634832 50%, #967259 70%, transparent 100%)',
              width: '100%',
              opacity: '0',
              animation: 'baseLineReveal 0.3s ease-out 3.0s forwards'
            }}
          ></div>
          
          {/* Classic sweep effect - animated entrance */}
          <div 
            className="absolute bottom-0 left-0 h-0.5 transform origin-left scale-x-0"
            style={{ 
              background: 'linear-gradient(90deg, transparent 10%, #967259 30%, #634832 50%, #967259 70%, transparent 90%)',
              width: '100%',
              opacity: '0.8',
              filter: 'drop-shadow(0 0 2px rgba(150, 114, 89, 0.3))',
              animation: 'classicSweepIntro 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) 3.0s forwards'
            }}
          ></div>

          {/* Professional glow enhancement */}
          <div 
            className="absolute bottom-0 left-0 h-1 transform origin-left scale-x-0"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(150, 114, 89, 0.3) 30%, rgba(99, 72, 50, 0.4) 50%, rgba(150, 114, 89, 0.3) 70%, transparent 100%)',
              width: '100%',
              filter: 'blur(1px)',
              transform: 'translateY(-2px)',
              opacity: '0.6',
              animation: 'glowSweepIntro 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) 3.4s forwards'
            }}
          ></div>
        </div>
      </div>

      {/* Loading Text */}
      <div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-lg"
        style={{ 
          color: '#634832',
          opacity: 0,
          animation: 'loadingTextFade 3.5s ease forwards'
        }}
      >
        Powering Up Workflows...
      </div>

      {/* Optimized Progress Bar */}
      <div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden"
      >
        <div 
          className="h-full rounded-full relative"
          style={{ 
            background: 'linear-gradient(90deg, #967259, #634832)',
            width: '100%',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
            animation: 'optimizedProgressFill 4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        ></div>
      </div>

      <style jsx>{`
        .wave-pixel {
          position: absolute;
          background: #967259;
          border-radius: 1px;
          opacity: 0;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
        
        @keyframes cleanFadeIn {
          0% { 
            opacity: 0;
            transform: scale(0.95);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes baseLineReveal {
          0% { 
            opacity: 0;
          }
          100% { 
            opacity: 0.5;
          }
        }

        @keyframes classicSweepIntro {
          0% { 
            transform: scaleX(0);
            opacity: 0.8;
          }
          100% { 
            transform: scaleX(1);
            opacity: 0.8;
          }
        }

        @keyframes glowSweepIntro {
          0% { 
            transform: translateY(-2px) scaleX(0);
            opacity: 0;
          }
          100% { 
            transform: translateY(-2px) scaleX(1);
            opacity: 0.6;
          }
        }
        
        @keyframes optimizedProgressFill {
          0% { 
            transform: scaleX(0);
            opacity: 0.8;
          }
          5% {
            opacity: 1;
          }
          100% { 
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        @keyframes loadingTextFade {
          0% { opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LogoLoadingScreen;