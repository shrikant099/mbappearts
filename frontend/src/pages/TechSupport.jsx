import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Mail,
  Phone,
  Headphones,
  Zap,
  Shield,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function TechSupport() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle different contact methods
  const handleContactClick = (type, index) => {
    setClickedCard(index);
    
    setTimeout(() => {
      switch (type) {
        case 'whatsapp':
          window.open('https://wa.me/+917597722920', '_blank');
          break;
        case 'email':
          window.open('mailto:info@techbro24.com', '_blank');
          break;
        case 'phone':
          window.open('tel:+917597722920', '_blank');
          break;
        default:
          break;
      }
      setClickedCard(null);
    }, 300);
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Chat with us',
      description: 'Get instant support through WhatsApp. Quick responses and real-time assistance.',
      color: 'from-green-500 to-green-600',
      action: 'whatsapp',
      hoverColor: 'hover:shadow-green-500/20',
      buttonText: 'Open WhatsApp'
    },
    {
      icon: Mail,
      title: 'Send us an email',
      description: 'Detailed technical support via email. Perfect for complex issues and documentation.',
      color: 'from-blue-500 to-blue-600',
      action: 'email',
      hoverColor: 'hover:shadow-blue-500/20',
      buttonText: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Call our hotline',
      description: 'Speak directly with our technical experts for immediate and effective voice assistance.',
      color: 'from-purple-500 to-purple-600',
      action: 'phone',
      hoverColor: 'hover:shadow-purple-500/20',
      buttonText: 'Call Now'
    },
  ];

  const features = [
    { icon: Clock, text: '24/7 Support Available' },
    { icon: Shield, text: 'Premium Security' },
    { icon: Zap, text: 'Lightning Fast Response' },
    { icon: CheckCircle, text: '100% Issue Resolution' },
  ];

  return (
    <div className="lg:w-[calc(100vw-256px)] w-full min-h-screen lg:h-[100vh] bg-black text-[#FFD700] px-4 relative overflow-y-scroll hidescroll">
      {/* Animated Background - Updated to match theme */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD700] rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD700] rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#FFD700] rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto py-12">
        {/* Enhanced Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block p-4 bg-gradient-to-r from-[#FFD700] to-yellow-400 rounded-full mb-6 animate-spin-slow shadow-2xl shadow-[#FFD700]/30">
            <Headphones className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] bg-clip-text text-transparent animate-text-glow">
            Welcome to TechBro24 Premium Support
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our dedicated team is here to help you resolve any technical issue quickly and efficiently.
            Experience premium support like never before.
          </p>
        </div>

        {/* Enhanced Features */}
        <div className={`flex justify-center flex-wrap gap-4 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#FFD700]/20 group cursor-pointer"
            >
              <feature.icon className="w-5 h-5 text-[#FFD700] group-hover:animate-pulse" />
              <span className="text-sm text-gray-300 group-hover:text-[#FFD700] transition-colors duration-300">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Enhanced Contact Cards */}
        <div className="flex flex-col items-center md:flex-row md:justify-center md:space-x-8 space-y-8 md:space-y-0 mb-16">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className={`w-[320px] h-[450px] flex-shrink-0 group cursor-pointer transition-all duration-700 delay-${index * 200} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              } ${clickedCard === index ? 'animate-click-pulse' : ''}`}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              onClick={() => handleContactClick(option.action, index)}
            >
              <div className={`bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border-2 border-gray-700 hover:border-[#FFD700] transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden shadow-2xl ${option.hoverColor} hover:shadow-2xl`}>
                
                {/* Animated background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                
                {/* Golden border animation */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-0.5 animate-border-spin">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* Enhanced Icon */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg group-hover:shadow-xl`}>
                      <option.icon className="w-8 h-8 text-white group-hover:animate-bounce" />
                    </div>
                    
                    {/* Enhanced Title */}
                    <h3 className="text-xl font-bold text-center mb-4 text-[#FFD700] group-hover:text-white transition-colors duration-300 group-hover:animate-pulse">
                      {option.title}
                    </h3>
                    
                    {/* Enhanced Description */}
                    <p className="text-sm text-center text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Enhanced Action Button */}
                  <div className={`text-center mt-6 transition-all duration-500 ${activeCard === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <button className="bg-gradient-to-r from-[#FFD700] to-yellow-400 text-black px-6 py-3 rounded-full text-sm font-bold hover:from-yellow-400 hover:to-[#FFD700] transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-[#FFD700]/30 animate-button-glow">
                      {option.buttonText}
                    </button>
                  </div>
                </div>

                {/* Enhanced Decorative Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#FFD700]/20 to-transparent rounded-bl-full transform transition-all duration-500 group-hover:scale-150 group-hover:rotate-45"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#FFD700]/10 to-transparent rounded-tr-full transform transition-all duration-500 group-hover:scale-125 group-hover:-rotate-45"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom Section */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-500 max-w-2xl mx-auto shadow-2xl hover:shadow-[#FFD700]/10 group">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FFD700] mb-4 group-hover:animate-pulse">
              Why Choose TechBro24?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 group-hover:text-white leading-relaxed mb-6 transition-colors duration-300">
              We're not just another tech support service. We're your technology partners, committed to providing
              exceptional service with cutting-edge solutions and unmatched expertise.
            </p>
            <div className="flex justify-center flex-wrap gap-3">
              {['Expert Team', 'Fast Response', 'Premium Quality', '24/7 Available'].map((tag, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 border-2 border-[#FFD700] bg-[#FFD700]/10 hover:bg-[#FFD700]/20 rounded-full text-[#FFD700] text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg hover:shadow-[#FFD700]/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information Display */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-[#FFD700]/20 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-[#FFD700] mb-3">Quick Contact</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-[#FFD700]" />
                <span>+91 7597722920</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-[#FFD700]" />
                <span>info@techbro24.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
          50% { text-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
        }
        
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes border-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes click-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }
        
        .animate-button-glow {
          animation: button-glow 2s ease-in-out infinite;
        }
        
        .animate-border-spin {
          animation: border-spin 3s linear infinite;
        }
        
        .animate-click-pulse {
          animation: click-pulse 0.3s ease-in-out;
        }
        
        .hidescroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .hidescroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}