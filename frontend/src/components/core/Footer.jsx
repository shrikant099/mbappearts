import React, { useState, useEffect } from "react";
import Container from "./Container";
import {
  FaFacebook,
  FaFacebookSquare,
  FaLinkedin,
  FaTwitter,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowUp,
  FaHeart,
  FaCouch,
  FaHome
} from "react-icons/fa";
import logo from "../../assets/images/LOGO.jpg"
import { FaSquareInstagram } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { clearFilters, updateFilter } from '../../slices/filterSlice';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialLinks = [
    { 
      icon: FaFacebookSquare, 
      name: 'Facebook', 
      color: 'hover:text-blue-500',
      link: '#',
      hoverBg: 'hover:bg-blue-500/20'
    },
    { 
      icon: FaTwitter, 
      name: 'Twitter', 
      color: 'hover:text-sky-400',
      link: '#',
      hoverBg: 'hover:bg-sky-400/20'
    },
    { 
      icon: FaSquareInstagram, 
      name: 'Instagram', 
      color: 'hover:text-pink-500',
      link: '#',
      hoverBg: 'hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20'
    },
    { 
      icon: FaLinkedin, 
      name: 'LinkedIn', 
      color: 'hover:text-blue-600',
      link: '#',
      hoverBg: 'hover:bg-blue-600/20'
    }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    
  ];

  const helpLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Support Center', href: '/support' },
    { name: 'Care Guide', href: '/care-guide' }
  ];

  const categoryLinks = [
    { 
      name: 'Living Room', 
      onClick: () => {
        dispatch(clearFilters());
        dispatch(updateFilter({
          type: "roomType",
          value: "Living Room",
          checked: true
        }));
        navigate('/products');
      }
    },
    { 
      name: 'Bedroom',
      onClick: () => {
        dispatch(clearFilters());
        dispatch(updateFilter({
          type: "roomType",
          value: "Bedroom",
          checked: true
        }));
        navigate('/products');
      }
    },
    { 
      name: 'Dining Room',
      onClick: () => {
        dispatch(clearFilters());
        dispatch(updateFilter({
          type: "roomType",
          value: "Dining Room",
          checked: true
        }));
        navigate('/products');
      }
    },
    { 
      name: 'Office Furniture',
      onClick: () => {
        dispatch(clearFilters());
        dispatch(updateFilter({
          type: "roomType",
          value: "Office",
          checked: true
        }));
        navigate('/products');
      }
    },
    { 
      name: 'Storage Solutions',
      onClick: () => {
        dispatch(clearFilters());
        dispatch(updateFilter({
          type: "material",
          value: "Wood",
          checked: true
        }));
        navigate('/products');
      }
    }
  ];

  return (
    <>
      <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black text-[#FFD700] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FFD700] rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#FFD700] rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Decorative Border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>

        <Container>
          <div className="py-16 px-4 md:px-8">
            {/* Main Footer Content */}
            <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-8 lg:gap-12">
              
              {/* Company Info Section */}
              <div className="lg:col-span-2 space-y-6 group">
                <div className="transform transition-all duration-500 group-hover:scale-105">
                  <img 
                    width={200} 
                    src={logo}
                    alt="Mbappe Arts Logo" 
                    className="filter invert rounded-full brightness-100 hover:invert-0 transition-all duration-500 transform hover:scale-110"
                  />
                </div>
                
                <p className="text-gray-300 leading-relaxed text-sm md:text-base transform transition-all duration-300 hover:text-[#FFD700]">
                  We are furniture artisans who bring your vision to life through
                  exquisite craftsmanship and timeless design. We understand your space, your style,
                  and your needs—then create every piece to reflect your personality.
                  From concept to delivery, we use premium materials and expert techniques
                  to transform your house into a home.
                </p>
                
                {/* Social Media Icons */}
                <div className="flex items-center gap-4">
                  {socialLinks.map((social, index) => (
                    <div
                      key={index}
                      className="relative group/social"
                      onMouseEnter={() => setHoveredSocial(index)}
                      onMouseLeave={() => setHoveredSocial(null)}
                    >
                      <a
                        href={social.link}
                        className={`p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[#FFD700]/20 text-[#FFD700] transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FFD700]/20 ${social.color} ${social.hoverBg} flex items-center justify-center`}
                      >
                        <social.icon className="text-xl transition-all duration-300 group-hover/social:animate-bounce" />
                      </a>
                      
                      {/* Tooltip */}
                      <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black text-[#FFD700] text-xs rounded-lg border border-[#FFD700]/30 transition-all duration-300 ${
                        hoveredSocial === index ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                      }`}>
                        {social.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Links */}
              <div className="space-y-6">
                <h3 className="font-bold text-2xl text-[#FFD700] relative group">
                  Company
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-yellow-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <nav className="space-y-3">
                  {companyLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="block text-gray-300 hover:text-[#FFD700] transition-all duration-300 transform hover:translate-x-2 hover:scale-105 py-1 px-2 rounded-lg hover:bg-[#FFD700]/5 group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                      </span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Furniture Categories */}
              <div className="space-y-6">
                <h3 className="font-bold text-2xl text-[#FFD700] relative group flex items-center gap-2">
                  <FaCouch className="text-lg" />
                  Categories
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-yellow-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <nav className="space-y-3">
                  {categoryLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={link.onClick}
                      className="w-full text-left block text-gray-300 hover:text-[#FFD700] transition-all duration-300 transform hover:translate-x-2 hover:scale-105 py-1 px-2 rounded-lg hover:bg-[#FFD700]/5 group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Help Section */}
              <div className="space-y-6">
                <h3 className="font-bold text-2xl text-[#FFD700] relative group">
                  Get Help
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-yellow-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <nav className="space-y-3">
                  {helpLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="block text-gray-300 hover:text-[#FFD700] transition-all duration-300 transform hover:translate-x-2 hover:scale-105 py-1 px-2 rounded-lg hover:bg-[#FFD700]/5 group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contact & Map Section */}
            <div className="mt-12 pt-8 border-t border-[#FFD700]/20">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="font-bold text-2xl text-[#FFD700] relative group flex items-center gap-2">
                    <FaHome className="text-lg" />
                    Visit Our Showroom
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-yellow-400 group-hover:w-full transition-all duration-500"></div>
                  </h3>
                  
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <a
                      href="tel:+919694520525"
                      className="flex items-center gap-4 text-gray-300 hover:text-[#FFD700] transition-all duration-300 transform hover:translate-x-2 p-3 rounded-xl hover:bg-[#FFD700]/5 group"
                    >
                      <div className="p-2 bg-gradient-to-br from-[#FFD700]/20 to-yellow-400/20 rounded-lg group-hover:scale-110 transition-all duration-300">
                        <FaPhone className="text-[#FFD700] group-hover:animate-pulse" />
                      </div>
                      <span className="font-medium">+91 96945 20525</span>
                    </a>
                    
                    <a
                      href="mailto:mbapearts@gmail.com"
                      className="flex items-center gap-4 text-gray-300 hover:text-[#FFD700] transition-all duration-300 transform hover:translate-x-2 p-3 rounded-xl hover:bg-[#FFD700]/5 group"
                    >
                      <div className="p-2 bg-gradient-to-br from-[#FFD700]/20 to-yellow-400/20 rounded-lg group-hover:scale-110 transition-all duration-300">
                        <FaEnvelope className="text-[#FFD700] group-hover:animate-pulse" />
                      </div>
                      <span className="font-medium">mbapearts@gmail.com</span>
                    </a>
                    
                    <div className="flex items-start gap-4 text-gray-300 p-3 rounded-xl group">
                      <div className="p-2 bg-gradient-to-br from-[#FFD700]/20 to-yellow-400/20 rounded-lg mt-1">
                        <FaMapMarkerAlt className="text-[#FFD700]" />
                      </div>
                      <div className="font-medium">
                        <p className="text-[#FFD700] font-semibold mb-1">Mbappe Arts</p>
                        <p>Ground Floor, Plot No 75</p>
                        <p>Post Udsar Lodera Teh Sardarshahar</p>
                        <p>Vikash Nagar Village Bholusar</p>
                        <p>Bholoosar, Churu District</p>
                        <p>Rajasthan 331403</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="relative group overflow-hidden rounded-2xl border-2 border-[#FFD700]/30 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <iframe
  src="https://www.google.com/maps?q=Ground+Floor,+Plot+No+75,+Post+Udsar+Lodera+Teh+Sardarshahar,+Vikash+Nagar+Village+Bholusar,+Bholoosar,+Churu+District,+Rajasthan+331403&output=embed"
  style={{ border: 0 }}
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  className="w-full h-64 transition-all duration-500 rounded-2xl shadow-xl"
  title="Mbappe Arts Location"
/>
                  <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#FFD700]/30">
                      <p className="text-[#FFD700] text-sm font-semibold">🏠 Visit Our Showroom</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="mt-16 pt-12 border-t border-[#FFD700]/20">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <h3 className="text-3xl font-bold text-[#FFD700] animate-pulse flex items-center justify-center gap-3">
                  <FaCouch className="text-2xl" />
                  Stay Updated with Latest Furniture Collections
                  <FaHome className="text-2xl" />
                </h3>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-16 pt-8 border-t border-[#FFD700]/20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <span>Crafted with</span>
                  <FaHeart className="text-red-500 animate-pulse" />
                  <span>by <span className="text-[#FFD700]">TechBro24</span></span>
                </div>
                
                <div className="text-center text-gray-300">
                  <p>&copy; 2025 Mbappe Arts. All rights reserved.</p>
                </div>
                
               
              </div>
            </div>
          </div>
        </Container>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-4 bg-gradient-to-r from-[#FFD700] to-yellow-400 text-black rounded-full shadow-2xl transform transition-all duration-300 z-50 hover:scale-110 hover:-translate-y-1 hover:shadow-[#FFD700]/50 ${
            showScrollTop ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-8'
          }`}
        >
          <FaArrowUp className="text-xl animate-bounce" />
        </button>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
