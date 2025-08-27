import React, { useState, useEffect } from 'react';
import { User, Package, CreditCard, Truck, RotateCcw, Shield, Settings, Bell, MessageCircle, Star, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const CustomerCareGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    // Auto-advance steps for demo
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const careGuideSteps = [
    {
      id: 1,
      icon: User,
      title: "Account Setup",
      description: "Create your account and complete your profile",
      details: "Set up your personal information, delivery addresses, and preferences for a seamless shopping experience."
    },
    {
      id: 2,
      icon: Package,
      title: "Browse & Shop",
      description: "Explore our furniture collections and add to cart",
      details: "Use filters to find perfect furniture pieces, read reviews, and compare products before making a decision."
    },
    {
      id: 3,
      icon: CreditCard,
      title: "Secure Payment",
      description: "Choose from multiple payment options",
      details: "Pay securely using credit/debit cards, UPI, net banking, or EMI options. All transactions are encrypted."
    },
    {
      id: 4,
      icon: Truck,
      title: "Track Delivery",
      description: "Monitor your order from warehouse to doorstep",
      details: "Get real-time updates via SMS and email. Track delivery progress and prepare for furniture assembly."
    },
    {
      id: 5,
      icon: Settings,
      title: "Assembly Service",
      description: "Professional assembly and setup included",
      details: "Our experts will assemble and place your furniture exactly where you want it, removing all packaging."
    },
    {
      id: 6,
      icon: Star,
      title: "Share Experience",
      description: "Rate and review your purchase",
      details: "Help other customers by sharing your honest feedback and photos of your new furniture setup."
    }
  ];

  const supportSections = [
    {
      title: "Order Management",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      items: [
        {
          title: "Placing an Order",
          content: "Add items to cart → Review cart → Enter delivery details → Choose payment method → Confirm order. You'll receive confirmation via email and SMS."
        },
        {
          title: "Modifying Orders",
          content: "Orders can be modified within 2 hours of placement. Contact customer care immediately for changes to delivery address, items, or cancellation."
        },
        {
          title: "Order Tracking",
          content: "Track your order using the order ID sent via email. Check real-time status: Confirmed → Processing → Shipped → Out for Delivery → Delivered."
        },
        {
          title: "Delivery Scheduling",
          content: "Our delivery team will call 24-48 hours before delivery to schedule a convenient time. Ensure someone is available to receive the furniture."
        }
      ]
    },
    {
      title: "Payment & Pricing",
      icon: CreditCard,
      color: "from-green-500 to-green-600",
      items: [
        {
          title: "Payment Methods",
          content: "We accept all major credit/debit cards, UPI payments, net banking, and cash on delivery (select locations). EMI options available on orders above ₹25,000."
        },
        {
          title: "Pricing & Discounts",
          content: "Prices include all taxes. Watch for seasonal sales, bulk discounts, and exclusive member offers. Subscribe to our newsletter for deal alerts."
        },
        {
          title: "Invoice & Receipt",
          content: "Digital invoice sent via email immediately after payment. Physical receipt included with delivery for warranty and service purposes."
        },
        {
          title: "Refunds & Cancellations",
          content: "Cancellations within 2 hours are fully refunded. Later cancellations may have processing fees. Refunds processed within 5-7 business days."
        }
      ]
    },
    {
      title: "Returns & Exchange",
      icon: RotateCcw,
      color: "from-purple-500 to-purple-600",
      items: [
        {
          title: "Return Policy",
          content: "30-day return policy for most items. Furniture must be in original condition with minimal use. Custom/personalized items are non-returnable unless defective."
        },
        {
          title: "Exchange Process",
          content: "Request exchange through your account or contact customer care. We'll arrange pickup of original item and delivery of replacement item."
        },
        {
          title: "Return Procedure",
          content: "Contact support → Schedule pickup → Our team inspects item → Refund processed within 7-10 business days after successful pickup."
        },
        {
          title: "Damaged Items",
          content: "Report damage within 24 hours of delivery with photos. We'll arrange immediate replacement or full refund, including pickup of damaged item."
        }
      ]
    },
    {
      title: "Product Care & Warranty",
      icon: Shield,
      color: "from-orange-500 to-orange-600",
      items: [
        {
          title: "Warranty Coverage",
          content: "1-2 year warranty on manufacturing defects. Premium pieces have extended warranties up to 5 years. Warranty cards included with delivery."
        },
        {
          title: "Care Instructions",
          content: "Dust regularly with soft cloth, avoid direct sunlight, use coasters for beverages. Specific care instructions provided with each furniture piece."
        },
        {
          title: "Maintenance Services",
          content: "Professional maintenance and repair services available. Schedule annual maintenance for wooden furniture to maintain appearance and durability."
        },
        {
          title: "Warranty Claims",
          content: "Contact support with warranty card details and photos of issue. Our technician will visit for assessment and provide repair/replacement as needed."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      method: "Live Chat",
      icon: MessageCircle,
      availability: "24/7 Available",
      responseTime: "2-3 minutes",
      bestFor: "Quick questions, order status",
      color: "from-green-500 to-green-600"
    },
    {
      method: "Phone Support",
      icon: Package,
      availability: "9 AM - 9 PM",
      responseTime: "Immediate",
      bestFor: "Urgent issues, complex problems",
      color: "from-blue-500 to-blue-600"
    },
    {
      method: "Email Support",
      icon: Bell,
      availability: "24/7 Available",
      responseTime: "4-6 hours",
      bestFor: "Detailed queries, documentation",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-br from-yellow-400/6 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-gradient-to-tl from-yellow-600/6 to-transparent rounded-full blur-3xl animate-pulse delay-1500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Customer Care Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your complete guide to shopping, support, and services at Mbappe Arts. Everything you need to know for an excellent furniture buying experience.
          </p>
        </div>

        {/* Journey Steps */}
        <div className={`mb-20 transition-all duration-800 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Your Furniture Journey</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-800 rounded-full hidden lg:block">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-1000"
                style={{ width: `${(activeStep + 1) * (100 / careGuideSteps.length)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4">
              {careGuideSteps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div
                    key={step.id}
                    className={`relative text-center transition-all duration-500 transform ${
                      isActive ? 'scale-110' : 'scale-100'
                    } hover:scale-105`}
                  >
                    <div className={`relative z-10 w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive || isCompleted
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                        : 'bg-gray-700 border-2 border-gray-600'
                    }`}>
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="w-6 h-6 text-black" />
                      ) : (
                        <IconComponent className={`w-6 h-6 ${isActive || isCompleted ? 'text-black' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      isActive ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isActive ? 'text-yellow-200' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                    {isActive && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-gray-900 border border-yellow-400/30 rounded-lg p-3 min-w-64 z-20 animate-fadeIn">
                        <p className="text-xs text-gray-300">{step.details}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Support Sections */}
        <div className={`mb-16 transition-all duration-800 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Comprehensive Support Guide</h2>
          <div className="space-y-8">
            {supportSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              const isExpanded = expandedSection === sectionIndex;
              
              return (
                <div
                  key={sectionIndex}
                  className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-yellow-400/40"
                >
                  <div
                    className="p-6 cursor-pointer flex items-center gap-4 hover:bg-yellow-400/5 transition-colors duration-300"
                    onClick={() => setExpandedSection(isExpanded ? null : sectionIndex)}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center`}>
                      <SectionIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{section.title}</h3>
                      <p className="text-gray-400">Click to explore detailed guidelines</p>
                    </div>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  
                  <div className={`transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-black/30 rounded-xl p-5 border border-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300"
                        >
                          <h4 className="text-lg font-semibold text-yellow-300 mb-3">{item.title}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Methods */}
        <div className={`text-center transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-12 text-yellow-400">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((contact, index) => {
              const ContactIcon = contact.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <ContactIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{contact.method}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Availability:</span>
                      <span className="text-green-400">{contact.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response:</span>
                      <span className="text-yellow-400">{contact.responseTime}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400">Best for: {contact.bestFor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerCareGuide;
