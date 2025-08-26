import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Eye, Clock, Zap, TrendingUp } from 'lucide-react';
import { productEndpoints } from '../services/api';
import { apiConnector } from '../services/apiConnector';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProductData } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import toast from 'react-hot-toast';

const {newArrivals} = productEndpoints;

const NewArrival = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);


  const fetchProducts = async () => {
      // Simulate API call
     try{
      setLoading(true);
      const res = await apiConnector("GET",newArrivals);

      console.log(res)

      setProducts(res.data.products)
     }catch(error){
      console.log(error)
     }finally{
      setLoading(false);
     }

    };

  // Mock data for demonstration (replace with actual API call)
  useEffect(() => {
    

    fetchProducts();
  }, []);

  const getDaysAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  const navigate = useNavigate();
  const dispatch = useDispatch();

 

  const productHandler = (product)=>{
    dispatch(setProductData(product));
    navigate("/productdetail")
  }

  

  const ProductCard = ({ product, index }) => {
    const isHovered = hoveredCard === product._id;
    const daysAgo = getDaysAgo(product.createdAt);

    return (
      <div
        className={`relative group bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl overflow-hidden transform transition-all duration-700 hover:scale-105 hover:rotate-1 ${
          isHovered ? 'shadow-2xl shadow-yellow-500/30' : 'shadow-xl shadow-black/50'
        }`}
        style={{
          animationDelay: `${index * 0.15}s`
        }}
        onMouseEnter={() => setHoveredCard(product._id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Pulsing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[3px] animate-pulse">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl h-full w-full"></div>
        </div>

        {/* New arrival badge */}
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
          <Zap size={12} className="animate-pulse" />
          NEW ARRIVAL
        </div>

        {/* Days ago indicator */}
        <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 text-yellow-400 text-xs font-semibold flex items-center gap-1">
          <Clock size={10} />
          {daysAgo}d ago
        </div>

        {/* Heart icon */}
        <div className="absolute top-16 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-yellow-500/20 cursor-pointer transform hover:scale-110">
          <Heart className="w-4 h-4 text-yellow-400 hover:fill-yellow-400 transition-colors" />
        </div>

        {/* Product image with overlay effects */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={product.images[0].url}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isHovered ? 'scale-125 rotate-3' : 'scale-100'
            }`}
          />
          
          {/* Dynamic gradient overlay */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/90 via-yellow-900/20 to-transparent' 
              : 'bg-gradient-to-t from-black/70 via-transparent to-transparent'
          }`}></div>

          {/* Trending indicator */}
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}>
            <TrendingUp size={12} />
            TRENDING
          </div>

          {/* Quick action buttons with stagger animation */}
          <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 transition-all duration-500 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <button 
            onClick={()=>productHandler(product)}
              className="bg-yellow-500 cursor-pointer hover:bg-yellow-400 text-black p-3 rounded-full transition-all duration-300 hover:scale-125 transform hover:-rotate-12"
              style={{ animationDelay: '0.1s' }}
            >
              <Eye size={18} />
            </button>
         
          </div>

          {/* Animated shine effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform transition-transform duration-1000 ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          }`} style={{ width: '100%' }}></div>
        </div>

        {/* Product details */}
        <div className="p-6 relative z-10">
          <div className="mb-3">
            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              {product.category.name}
            </span>
          </div>
          
          <h3 className="text-white font-bold text-xl mb-4 group-hover:text-yellow-300 transition-colors duration-300 leading-tight">
            {product.name}
          </h3>

          

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-yellow-400 animate-pulse">
              ₹{product.price}
            </div>
            <button onClick={()=>productHandler(product)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 cursor-pointer hover:to-yellow-500 text-black px-8 py-3 rounded-full font-bold transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-110 transform relative overflow-hidden group">
              <span className="relative z-10">View Product</span>
              <div className="absolute inset-0  bg-gradient-to-r from-yellow-300 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>
        </div>

        {/* Floating sparkles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`
                }}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
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
            <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 animate-bounce" size={28} />
          </div>
          <p className="text-yellow-400 font-bold text-lg animate-pulse">Loading New Arrivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-yellow-900/10">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='lightning' width='50' height='50' patternUnits='userSpaceOnUse'><path d='M25 10 L35 25 L25 25 L30 40 L20 25 L25 25 Z' fill='%23FFD700' opacity='0.05'/></pattern></defs><rect width='100' height='100' fill='url(%23lightning)'/></svg>")`
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-8 py-3 mb-8 animate-bounce">
              <Zap className="text-yellow-400 animate-pulse" size={24} />
              <span className="text-yellow-400 font-bold text-lg">Just Dropped</span>
              <Clock className="text-yellow-400" size={20} />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent mb-8 tracking-tight">
              NEW ARRIVALS
            </h1>
            
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Be the first to experience the latest innovations and trending products that just hit our shelves
            </p>

            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-1 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            <div className="text-yellow-400 font-semibold animate-pulse">
              ⚡ Limited Stock • High Demand ⚡
            </div>
          </div>
        </div>

        {/* Dynamic background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${4 + Math.random() * 6}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <Zap className="text-yellow-400" size={16 + Math.random() * 20} />
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
                animation: `slideUp 0.6s ease-out forwards`,
                animationDelay: `${index * 0.15}s`,
                opacity: 0
              }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-3xl p-12 border border-yellow-500/20">
            <h3 className="text-3xl font-bold text-yellow-400 mb-4">Don't Miss Out!</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              New products arrive weekly. Be the first to get your hands on the latest trends.
            </p>
            <button onClick={()=>navigate('/products')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 cursor-pointer hover:to-yellow-500 text-black px-16 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 transform">
              View All New Arrivals
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `
      }} />
    </div>
  );
};

export default NewArrival;