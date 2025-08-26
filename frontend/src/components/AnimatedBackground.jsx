import React, { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce'; // Add lodash as dependency if not already present

const AnimatedBackground = React.memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Debounced mouse move handler
  const handleMouseMove = useCallback(
    debounce((e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      handleMouseMove.cancel();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 opacity-20 pointer-events-none">
      <div
        className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full filter blur-3xl animate-pulse transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x * 0.1}%`,
          top: `${mousePosition.y * 0.1}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute w-72 h-72 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full filter blur-3xl animate-pulse delay-1000 transition-all duration-1000 ease-out"
        style={{
          right: `${(100 - mousePosition.x) * 0.1}%`,
          bottom: `${(100 - mousePosition.y) * 0.1}%`,
          transform: 'translate(50%, 50%)',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(25)].map((_, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;