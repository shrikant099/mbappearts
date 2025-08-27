import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Clock, User, FileText, Headphones, Shield, Search, ArrowRight, CheckCircle, AlertCircle, Info, HelpCircle } from 'lucide-react';

const SupportCenter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const supportOptions = [
    {
      id: 1,
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Get instant help from our furniture experts",
      status: "Online",
      response: "Average response: 2-3 minutes",
      action: "Start Chat",
      color: "from-green-500 to-green-600",
      available: true
    },
    {
      id: 2,
      icon: Phone,
      title: "Phone Support",
      description: "Talk directly to our customer care team",
      status: "Available 9 AM - 9 PM",
      response: "+91 96945 20525",
      action: "Call Now",
      color: "from-blue-500 to-blue-600",
      available: true
    },
    {
      id: 3,
      icon: Mail,
      title: "Email Support",
      description: "Send us your queries via email",
      status: "24/7 Available",
      response: "Average response: 4-6 hours",
      action: "Send Email",
      color: "from-purple-500 to-purple-600",
      available: true
    },
    {
      id: 4,
      icon: FileText,
      title: "Submit Ticket",
      description: "Create a detailed support ticket",
      status: "Professional Support",
      response: "Response within 24 hours",
      action: "Create Ticket",
      color: "from-orange-500 to-orange-600",
      available: true
    }
  ];

  const quickHelp = [
    {
      icon: CheckCircle,
      title: "Order Status",
      description: "Track your furniture delivery",
      link: "/track-order"
    },
    {
      icon: Shield,
      title: "Warranty Claims",
      description: "File warranty and repair requests",
      link: "/warranty"
    },
    {
      icon: AlertCircle,
      title: "Return & Exchange",
      description: "Process returns and exchanges",
      link: "/returns"
    },
    {
      icon: User,
      title: "Account Help",
      description: "Manage your account settings",
      link: "/account-help"
    },
    {
      icon: Info,
      title: "Product Information",
      description: "Get detailed product specifications",
      link: "/product-info"
    },
    {
      icon: HelpCircle,
      title: "Assembly Guide",
      description: "Step-by-step furniture assembly",
      link: "/assembly-guide"
    }
  ];

  const stats = [
    { number: "98%", label: "Customer Satisfaction", icon: "😊" },
    { number: "24/7", label: "Support Available", icon: "🕐" },
    { number: "< 5 min", label: "Average Response", icon: "⚡" },
    { number: "50K+", label: "Issues Resolved", icon: "✅" }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-yellow-400/8 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-yellow-600/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-yellow-400/20 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-yellow-500/20 rounded-full animate-bounce delay-700" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Mbappe Arts Support Center
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're here to help you with all your furniture needs. Get expert assistance 24/7 from our dedicated support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mb-12 transition-all duration-800 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-yellow-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-gray-900/60 border border-yellow-400/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/80 backdrop-blur-sm transition-all duration-300 text-lg"
            />
          </div>
        </div>

        {/* Support Options */}
        <div className={`mb-16 transition-all duration-800 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Choose Your Support Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105 ${activeCard === option.id ? 'scale-105' : ''}`}
                  onMouseEnter={() => setActiveCard(option.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 h-full hover:border-yellow-400/60 hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300">
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-300 transition-colors duration-300">
                      {option.title}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {option.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${option.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {option.status}
                      </div>
                      <p className="text-xs text-gray-400">{option.response}</p>
                    </div>
                    <button className={`w-full bg-gradient-to-r ${option.color} text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg active:scale-95`}>
                      {option.action}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Help Section */}
        <div className={`mb-16 transition-all duration-800 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickHelp.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-yellow-400 text-sm group-hover:gap-3 transition-all duration-300">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mb-16 transition-all duration-800 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-3xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className={`text-center transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-sm border border-red-400/30 rounded-3xl p-8">
            <div className="inline-block p-4 bg-red-500/20 backdrop-blur-sm rounded-full mb-6 animate-pulse border border-red-400/30">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-red-400">
              Emergency Support
            </h2>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              For urgent delivery issues, damaged products, or critical problems
            </p>
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-400/30 active:scale-95">
              Call Emergency Hotline: +91 96945 20525
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .animate-bounce.delay-300 {
          animation-delay: 0.3s;
        }
        .animate-bounce.delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

export default SupportCenter;
