import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Eye, Percent, Flame, Timer, Tag } from 'lucide-react';
import { productEndpoints } from '../services/api';
import { apiConnector } from '../services/apiConnector';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setProductData } from '../slices/productSlice';

const {onSale} = productEndpoints;

const OnSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchProducts = async () => {
      try{
        setLoading(true);

        const res = await apiConnector("GET",onSale);

        console.log(res);

        setProducts(res.data.products)
      }catch(error){
        console.log(error)
        toast.error("Unable to get onsale products!")
      }finally{
        setLoading(false);
      }
    };

  useEffect(() => {
    

    fetchProducts();
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();



  const productHandler = (product)=>{
    dispatch(setProductData(product));
    navigate("/productdetail")
  }

  const getTimeRemaining = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance < 0) return null;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const ProductCard = ({ product, index }) => {
    const isHovered = hoveredCard === product._id;
    const timeRemaining = getTimeRemaining(product.saleEndDate);
    const savings = product.comparePrice - product.price;

    return (
      <div
        className={`relative group bg-gradient-to-br from-red-900/20 via-black to-yellow-900/20 rounded-3xl overflow-hidden transform transition-all duration-700 hover:scale-105 hover:-rotate-1 ${
          isHovered ? 'shadow-2xl shadow-red-500/30' : 'shadow-xl shadow-black/60'
        }`}
        style={{
          animationDelay: `${index * 0.12}s`
        }}
        onMouseEnter={() => setHoveredCard(product._id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Animated fire border */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[3px] animate-pulse">
          <div className="bg-gradient-to-br from-red-900/20 via-black to-yellow-900/20 rounded-3xl h-full w-full"></div>
        </div>

        {/* Hot Deal Badge */}
        {product.isHotDeal && (
          <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
            <Flame size={12} className="animate-bounce" />
            HOT DEAL
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 animate-bounce">
          <Percent size={14} />
          {product.discountPercentage} OFF
        </div>

        {/* Timer */}
        {timeRemaining && (
          <div className="absolute top-16 right-4 z-20 bg-black/80 backdrop-blur-sm rounded-xl px-3 py-2 text-yellow-400 text-xs font-semibold">
            <div className="flex items-center gap-1 mb-1">
              <Timer size={10} className="animate-spin" />
              <span>ENDS IN</span>
            </div>
            <div className="text-white font-mono">
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
            </div>
          </div>
        )}

        {/* Heart icon */}
        <div className="absolute top-32 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/20 cursor-pointer transform hover:scale-110">
          <Heart className="w-4 h-4 text-red-400 hover:fill-red-400 transition-colors" />
        </div>

        {/* Product image with fire overlay */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={product.images[0].url}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isHovered ? 'scale-130 rotate-2' : 'scale-100'
            }`}
          />
          
          {/* Fire gradient overlay */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/90 via-red-900/30 to-yellow-900/10' 
              : 'bg-gradient-to-t from-black/70 via-transparent to-transparent'
          }`}></div>

          {/* Savings indicator */}
          <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}>
            <Tag size={14} />
            SAVE ₹{savings}
          </div>

          {/* Quick action buttons */}
          <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 transition-all duration-500 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
           
          </div>

          {/* Flame effect */}
          <div className={`absolute inset-0 bg-gradient-to-t from-red-600/20 via-orange-500/10 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
        </div>

        {/* Product details */}
        <div className="p-6 relative z-10">
          <div className="mb-3">
            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {product.category.name}
            </span>
          </div>
          
          <h3 className="text-white font-bold text-xl mb-4 group-hover:text-yellow-300 transition-colors duration-300 leading-tight">
            {product.name}
          </h3>

          

          {/* Price section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-red-400">
                ₹{product.price}
              </div>
              <div className="text-lg text-gray-500 line-through">
                ₹{product.comparePrice}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              ₹{savings} OFF
            </div>
          </div>

          {/* CTA Button */}
          <button onClick={()=>productHandler(product)} className="w-full cursor-pointer bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-400 hover:to-yellow-400 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 transform relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Flame size={18} />
              Grab This Deal
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>

        {/* Floating fire particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.6 + Math.random() * 0.4}s`
                }}
              >
                <div className={`w-1 h-1 rounded-full ${
                  Math.random() > 0.5 ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-400 animate-bounce" size={28} />
          </div>
          <p className="text-red-400 font-bold text-lg animate-pulse">Loading Hot Deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-900/20 via-black to-yellow-900/20">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='flames' width='40' height='40' patternUnits='userSpaceOnUse'><path d='M20 30 Q15 20 20 10 Q25 20 20 30 Q15 25 10 30 Q20 25 20 30' fill='%23FF6B6B' opacity='0.1'/></pattern></defs><rect width='100' height='100' fill='url(%23flames)'/></svg>")`
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-full px-8 py-3 mb-8 animate-pulse">
              <Flame className="text-red-400 animate-bounce" size={28} />
              <span className="text-red-400 font-bold text-xl">LIMITED TIME</span>
              <Percent className="text-yellow-400" size={24} />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-red-400 via-yellow-500 to-red-600 bg-clip-text text-transparent">
                ON SALE
              </span>
            </h1>
            
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Unbeatable prices on premium products. These deals won't last long - grab them before they're gone!
            </p>

            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full px-6 py-3 border border-red-500/30">
                <Flame className="text-red-400 animate-pulse" size={20} />
                <span className="text-red-400 font-bold">UP TO 50% OFF</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full px-6 py-3 border border-green-500/30">
                <Tag className="text-green-400" size={20} />
                <span className="text-green-400 font-bold">MINIMUM SHIPPING CHARGES</span>
              </div>
            </div>

            <div className="text-yellow-400 font-semibold animate-bounce text-lg">
              🔥 FLASH SALE ENDS SOON 🔥
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <Flame className="text-red-400" size={12 + Math.random() * 16} />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {products.map((product, index) => (
            <div
              key={product._id}
              style={{
                animation: `slideUp 0.8s ease-out forwards`,
                animationDelay: `${index * 0.12}s`,
                opacity: 0
              }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Sale Banner */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-red-900/30 via-black to-yellow-900/30 rounded-3xl p-12 border border-red-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-yellow-500/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Flame className="text-red-500 animate-bounce" size={48} />
              </div>
              <h3 className="text-4xl font-bold text-red-400 mb-4">Don't Miss These Deals!</h3>
              <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
                Limited time offers with massive savings. Act fast before stock runs out!
              </p>
              <button onClick={()=>navigate('/products')} className="bg-gradient-to-r from-red-500 to-yellow-500 cursor-pointer hover:from-red-400 hover:to-yellow-400 text-white px-16 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105 transform">
                Shop All Sale Items
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(60px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(10deg); }
            75% { transform: translateY(-8px) rotate(-10deg); }
          }
        `
      }} />
    </div>
  );
};

export default OnSale;