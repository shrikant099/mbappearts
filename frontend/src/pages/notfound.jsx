import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Notfound = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-4 h-4 bg-[#FFD700] rounded-full opacity-20 animate-float-${i + 1}`}
      style={{
        left: `${10 + i * 15}%`,
        top: `${20 + (i % 3) * 20}%`,
        animationDelay: `${i * 0.5}s`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-[#FFD700] relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-[#FFD700] rounded-full blur-3xl opacity-10 animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}%`,
            top: `${mousePosition.y * 0.1}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-yellow-300 rounded-full blur-3xl opacity-5 animate-pulse"
          style={{
            right: `${mousePosition.x * 0.05}%`,
            bottom: `${mousePosition.y * 0.05}%`,
            animationDelay: '1s',
          }}
        />
        
        {/* Floating elements */}
        {floatingElements}
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-8 mx-auto max-w-screen-xl text-center">
        <div className={`transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}>
          
          {/* 404 Number with Glitch Effect */}
          <div className="relative mb-8">
            <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tight text-[#FFD700] relative">
              <span className="relative z-10 inline-block animate-bounce-slow">4</span>
              <span className="relative z-10 inline-block animate-bounce-slow animation-delay-200">0</span>
              <span className="relative z-10 inline-block animate-bounce-slow animation-delay-400">4</span>
              
              {/* Glitch layers */}
              <span className="absolute inset-0 text-red-500 opacity-30 animate-glitch-1">404</span>
              <span className="absolute inset-0 text-blue-500 opacity-30 animate-glitch-2">404</span>
            </h1>
            
            {/* Decorative elements around 404 */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-[#FFD700] animate-spin-slow"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-[#FFD700] animate-spin-slow-reverse"></div>
          </div>

          {/* Main Message */}
          <div className={`mb-8 transition-all duration-1000 delay-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              <span className="inline-block animate-type">
                Oops! Page Not Found
              </span>
            </h2>
            
            <p className="mb-6 text-lg md:text-xl font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
              The page you're looking for seems to have vanished into the digital void. 
              Don't worry though – our fashion collection is still waiting for you!
            </p>
          </div>

          {/* Interactive Elements */}
          <div className={`mb-8 transition-all duration-1000 delay-500 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#FFD700] to-yellow-400 text-black font-bold rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#FFD700]/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Home
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-[#FFD700] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => navigate('/products')}
                className="group px-8 py-4 bg-transparent border-2 border-[#FFD700] text-[#FFD700] font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:bg-[#FFD700] hover:text-black hover:shadow-2xl hover:shadow-[#FFD700]/30"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 18V9h2v9h-2z" clipRule="evenodd" />
                  </svg>
                  Browse Products
                </span>
              </button>
            </div>

            {/* Auto-redirect countdown */}
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Auto-redirecting to home in <span className="text-[#FFD700] font-bold">{countdown}</span> seconds</span>
            </div>
          </div>

          {/* Fun Interactive Element */}
          <div className={`transition-all duration-1000 delay-700 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="relative group cursor-pointer inline-block">
              <div className="text-6xl md:text-8xl opacity-20 group-hover:opacity-40 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                🏠
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#FFD700]/30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                  <p className="text-[#FFD700] text-sm font-semibold whitespace-nowrap">
                    Click me to go home!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(90deg); }
          75% { transform: translateY(8px) rotate(270deg); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40% { transform: translateY(-12px) rotate(144deg); }
          80% { transform: translateY(6px) rotate(288deg); }
        }
        
        @keyframes float-5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          60% { transform: translateY(-18px) rotate(216deg); }
        }
        
        @keyframes float-6 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-7px) rotate(108deg); }
          70% { transform: translateY(7px) rotate(252deg); }
        }
        
        @keyframes type {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-glitch-1 {
          animation: glitch-1 2s infinite;
        }
        
        .animate-glitch-2 {
          animation: glitch-2 2s infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-float-1 { animation: float-1 6s infinite ease-in-out; }
        .animate-float-2 { animation: float-2 5s infinite ease-in-out; }
        .animate-float-3 { animation: float-3 7s infinite ease-in-out; }
        .animate-float-4 { animation: float-4 4s infinite ease-in-out; }
        .animate-float-5 { animation: float-5 8s infinite ease-in-out; }
        .animate-float-6 { animation: float-6 6s infinite ease-in-out; }
        
        .animate-type {
          overflow: hidden;
          border-right: 3px solid #FFD700;
          white-space: nowrap;
          animation: type 2s steps(20, end), blink 1s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 8s linear infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        @keyframes blink {
          0%, 50% { border-color: #FFD700; }
          51%, 100% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default Notfound;
