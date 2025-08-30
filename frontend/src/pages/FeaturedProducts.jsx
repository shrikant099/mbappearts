import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { apiConnector } from '../services/apiConnector';
import { productEndpoints } from '../services/api';
import { setProductData } from '../slices/productSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import toast from 'react-hot-toast';

const{featuredProduct} = productEndpoints;

const FeaturedProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);


  const fetchProducts = async ()=>{
    try{
        setLoading(true)
        const res = await apiConnector("GET",featuredProduct);
        setProducts(res.data.products)
        console.log(res)
    }catch(err){
        console.log(err)
    }finally{
        setLoading(false)
    }
  }

  // Mock data for demonstration (replace with actual API call)
  useEffect(() => {
    fetchProducts();
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();



  const productHandler = (product)=>{
    dispatch(setProductData(product));
    navigate("/productdetail")
  }

  

  const ProductCard = ({ product, index }) => {
    const isHovered = hoveredCard === product._id;

    return (
      <div 

     

        className={`relative group bg-gradient-to-br from-gray-900 to-black rounded-2xl  overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-rotate-1 ${
          isHovered ? 'shadow-2xl shadow-yellow-500/20' : 'shadow-lg shadow-black/50'
        }`}
        style={{
          animationDelay: `${index * 0.1}s`
        }}
        onMouseEnter={() => setHoveredCard(product._id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Golden border animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px]">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl h-full w-full">
            {/* Content goes inside this inner div */}
          </div>
        </div>

        {/* Featured badge */}
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
          <Sparkles size={12} />
          FEATURED
        </div>

        

        {/* Product image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={product.images[0].url}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110 rotate-2' : 'scale-100'
            }`}
          />
          
          {/* Overlay gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-60' : 'opacity-30'
          }`}></div>

          {/* Quick action buttons */}
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <button  onClick={()=>productHandler(product)} className="bg-yellow-500 cursor-pointer hover:bg-yellow-400 text-black p-2 rounded-full transition-colors duration-200 hover:scale-110">
              <Eye size={16} />
            </button>
            
          </div>
        </div>

        {/* Product details */}
        <div className="p-6 relative z-10">
          <div className="mb-2">
            <span className="text-yellow-400 text-xs font-medium uppercase tracking-wider">
              {product.category.name}
            </span>
          </div>
          
          <h3 className="text-white font-bold text-lg mb-3 group-hover:text-yellow-300 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${
                    i < Math.floor(product.ratings.average)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  } transition-colors duration-200`}
                />
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              {product.ratings.average} ({product.reviews} reviews)
            </span>
          </div> */}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-yellow-400">
              ₹ {product.price}
            </div>
            <button onClick={()=>productHandler(product)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 cursor-pointer hover:from-yellow-400 hover:to-yellow-500 text-black px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105">
              View Product
            </button>
          </div>
        </div>

        {/* Animated particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              ></div>
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
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 animate-pulse" size={24} />
          </div>
          <p className="text-yellow-400 font-semibold">Loading Featured Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'><circle cx='50' cy='50' r='0.5' fill='%23FFD700' opacity='0.1'/></pattern></defs><rect width='100' height='100' fill='url(%23grain)'/></svg>")`
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-6 py-2 mb-6">
              <Sparkles className="text-yellow-400 animate-spin" size={20} />
              <span className="text-yellow-400 font-semibold">Premium Collection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-6">
              Featured Products
            </h1>
            
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover our handpicked selection of premium products, carefully curated for the discerning customer
            </p>

            <div className="flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={product._id}
              style={{ 
                animation: `slideUp 0.6s ease-out forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16">
          <button onClick={()=>navigate("/products")} className="bg-gradient-to-r from-yellow-500 to-yellow-600 cursor-pointer hover:from-yellow-400 hover:to-yellow-500 text-black px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-105 transform">
            Load More Products
          </button>
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

export default FeaturedProduct;