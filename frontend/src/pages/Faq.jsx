import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Package, Truck, CreditCard, Shield, Home, Star } from 'lucide-react';

const FAQ = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [animatedItems, setAnimatedItems] = useState(new Set());

  useEffect(() => {
    setIsVisible(true);
    // Stagger animations for FAQ items
    faqData.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedItems(prev => new Set([...prev, index]));
      }, 200 + index * 100);
    });
  }, []);

  const toggleItem = (index) => {
    setActiveItem(activeItem === index ? null : index);
  };

  const faqData = [
    {
      id: 1,
      category: "Orders & Shipping",
      icon: Package,
      question: "How long does furniture delivery take?",
      answer: "Standard delivery takes 7-14 business days for most furniture items. Custom pieces may take 3-6 weeks. We'll provide tracking information once your order ships from our warehouse in Rajasthan."
    },
    {
      id: 2,
      category: "Orders & Shipping",
      icon: Truck,
      question: "Do you offer free delivery?",
      answer: "Yes! We offer free delivery on all orders across India. Our professional delivery team will handle assembly and placement in your desired room at no extra charge."
    },
    {
      id: 3,
      category: "Orders & Shipping",
      icon: Package,
      question: "Can I track my furniture order?",
      answer: "Absolutely! Once your order ships, you'll receive a tracking number via email and SMS. You can also track your order status in your account dashboard on our website."
    },
    {
      id: 4,
      category: "Payment",
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, EMI options, and cash on delivery (for select locations). We also offer 0% EMI on orders above ₹25,000."
    },
    {
      id: 5,
      category: "Payment",
      icon: Shield,
      question: "Is it safe to pay online?",
      answer: "Yes, your payment is 100% secure. We use industry-standard SSL encryption and partner with trusted payment gateways like Razorpay to ensure your financial information is protected."
    },
    {
      id: 6,
      category: "Products",
      icon: Home,
      question: "What materials are used in your furniture?",
      answer: "We use premium materials including solid wood (teak, sheesham, mango wood), engineered wood, high-grade metal, genuine leather, and eco-friendly finishes. Each product page lists detailed material specifications."
    },
    {
      id: 7,
      category: "Products",
      icon: Star,
      question: "Do you offer customization services?",
      answer: "Yes! We offer customization for most furniture pieces including size modifications, color changes, and material upgrades. Contact our design team for a personalized quote."
    },
    {
      id: 8,
      category: "Products",
      icon: Shield,
      question: "What warranty do you provide?",
      answer: "All furniture comes with a 1-2 year warranty covering manufacturing defects. Premium pieces have extended warranties up to 5 years. Warranty terms vary by product category."
    },
    {
      id: 9,
      category: "Assembly & Care",
      icon: Home,
      question: "Do you provide assembly service?",
      answer: "Yes, our expert team provides free assembly service for all furniture deliveries. We'll set up your furniture exactly where you want it and remove all packaging materials."
    },
    {
      id: 10,
      category: "Assembly & Care",
      icon: Star,
      question: "How should I care for my wooden furniture?",
      answer: "Dust regularly with a soft cloth, avoid direct sunlight, use coasters for beverages, and apply wood polish every 3-6 months. Detailed care instructions are included with every purchase."
    },
    {
      id: 11,
      category: "Returns & Exchange",
      icon: Package,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Furniture must be in original condition with minimal use. Custom/personalized items are non-returnable unless defective."
    },
    {
      id: 12,
      category: "Returns & Exchange",
      icon: Truck,
      question: "Who handles return pickup?",
      answer: "We arrange free return pickup for eligible items. Our team will inspect the furniture and process your refund within 7-10 business days after successful pickup."
    }
  ];

  const categories = [...new Set(faqData.map(item => item.category))];

  const filteredFAQs = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFAQs = categories.map(category => ({
    category,
    items: filteredFAQs.filter(item => item.category === category)
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-yellow-600/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-yellow-400/20 rounded-full animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-yellow-500/20 rounded-full animate-float delay-700" />
        <div className="absolute top-1/4 right-1/6 w-3 h-3 bg-yellow-400/30 rounded-full animate-float delay-1400" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about Mbappe Arts furniture, delivery, payments, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mb-12 transition-all duration-800 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-900/50 border border-yellow-400/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/80 backdrop-blur-sm transition-all duration-300"
            />
          </div>
        </div>

        {/* FAQ Categories and Items */}
        <div className="space-y-8">
          {groupedFAQs.map((group, groupIndex) => (
            <div
              key={group.category}
              className={`transition-all duration-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: `${500 + groupIndex * 200}ms` }}
            >
              {/* Category Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  {group.category}
                </h2>
                <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent rounded-full max-w-xs"></div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {group.items.map((item, index) => {
                  const globalIndex = faqData.findIndex(faq => faq.id === item.id);
                  const IconComponent = item.icon;
                  const isActive = activeItem === globalIndex;
                  const isAnimated = animatedItems.has(globalIndex);

                  return (
                    <div
                      key={item.id}
                      className={`bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/10 transform ${
                        isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
                      } ${isActive ? 'scale-[1.02] border-yellow-400/60' : 'hover:scale-[1.01]'}`}
                    >
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-6 text-left transition-all duration-300 hover:bg-yellow-400/5 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center transition-transform duration-300 ${isActive ? 'rotate-12 scale-110' : ''}`}>
                            <IconComponent className="w-6 h-6 text-black" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300">
                            {item.question}
                          </h3>
                        </div>

                        <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-6 h-6 text-yellow-400" />
                        </div>
                      </button>

                      <div
                        className={`transition-all duration-500 ease-in-out ${
                          isActive
                            ? 'max-h-96 opacity-100'
                            : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-6 pl-22">
                          <div className="bg-black/30 rounded-xl p-6 border-l-4 border-yellow-400">
                            <p className="text-gray-300 leading-relaxed text-base">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-4">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any FAQs matching "{searchTerm}". Try different keywords or browse our categories above.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-3xl p-8 sm:p-12">
            <div className="inline-block p-4 bg-yellow-400/20 backdrop-blur-sm rounded-full mb-6 animate-pulse border border-yellow-400/30">
              <Shield className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our furniture experts are here to help you find the perfect pieces for your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95">
                Contact Support
              </button>
              <button className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95">
                Call +91 96945 20525
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) translateX(5px) rotate(5deg);
          }
          50% {
            transform: translateY(0px) translateX(10px) rotate(0deg);
          }
          75% {
            transform: translateY(10px) translateX(5px) rotate(-5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float.delay-700 {
          animation-delay: 0.7s;
        }

        .animate-float.delay-1400 {
          animation-delay: 1.4s;
        }

        /* Smooth scrollbar for overflow */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 112, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 112, 0.7);
        }
      `}</style>
    </div>
  );
};

export default FAQ;
