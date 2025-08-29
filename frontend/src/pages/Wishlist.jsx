import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Trash2, ShoppingCart, Star, Package, AlertCircle } from 'lucide-react';


import toast from 'react-hot-toast';
import { setProductData } from '../slices/productSlice';
import { endpoints } from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingWishlist, setClearingWishlist] = useState(false);

  useEffect(() => {
    if (token) {
      fetchWishlistItems();
    } else {
      setIsLoading(false);
      // Redirect to login if not authenticated
      toast.error('Please login to view your wishlist');
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchWishlistItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(endpoints.getWishlistItems, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setWishlistItems(data.wishlist || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch wishlist');
        console.error('Failed to fetch wishlist:', errorData);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!token) {
      toast.error('Please login to modify wishlist');
      return;
    }

    setRemovingItem(productId);
    
    try {
      const response = await fetch(`${endpoints.removeProductFromWishlist}${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
        toast.success('Item removed from wishlist');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!token) {
      toast.error('Please login to modify wishlist');
      return;
    }

    setClearingWishlist(true);
    
    try {
      const response = await fetch(endpoints.clearWishlist, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setWishlistItems([]);
        setShowClearConfirm(false);
        toast.success('Wishlist cleared successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setClearingWishlist(false);
    }
  };

  const handleProductClick = (product) => {
    dispatch(setProductData(product));
    navigate("/productdetail");
  };

  const handleBrowseProducts = () => {
    navigate('/products'); // Adjust route as per your app structure
  };

  const calculateDiscount = (price, comparePrice) => {
    return comparePrice && comparePrice > price 
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#262626] rounded-xl p-6 mb-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-[#333] rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-[#333] rounded w-3/4"></div>
              <div className="h-3 bg-[#333] rounded w-1/2"></div>
              <div className="h-4 bg-[#333] rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#FFD700] rounded-full animate-pulse"></div>
            <div className="h-8 bg-[#333] rounded w-48 animate-pulse"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#FFD700] to-yellow-500 rounded-full animate-pulse">
              <Heart className="w-6 h-6 text-black fill-current" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-yellow-500 bg-clip-text text-transparent">
              My Wishlist
            </h1>
            <span className="bg-[#FFD700]/20 text-[#FFD700] px-3 py-1 rounded-full text-sm font-semibold">
              {wishlistItems.length} items
            </span>
          </div>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={clearingWishlist}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 px-4 py-2 rounded-xl text-red-400 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${clearingWishlist ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Clear All</span>
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-12 h-12 text-[#FFD700]/50" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#FFD700]/5 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-[#FFD700] mb-3">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Start adding some products you love!</p>
            <button 
              onClick={handleBrowseProducts}
              className="bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-yellow-600 hover:to-[#FFD700] text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item, index) => {
              const discount = calculateDiscount(item.product.price, item.product.comparePrice);
              const isRemoving = removingItem === item.product._id;
              
              return (
                <div
                  key={item.product._id}
                  className={`bg-[#191919] border border-[#FFD700]/20 rounded-xl p-4 md:p-6 transform transition-all duration-500 hover:scale-[1.02] hover:border-[#FFD700]/40 hover:shadow-xl hover:shadow-[#FFD700]/10 ${
                    isRemoving ? 'scale-95 opacity-50' : 'animate-fade-in-up'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative group cursor-pointer" onClick={() => handleProductClick(item.product)}>
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg group-hover:brightness-110 transition-all duration-300"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          {discount}% OFF
                        </span>
                      )}
                      {item.product.stock <= item.product.lowStockThreshold && (
                        <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          Low Stock!
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 
                            className="text-xl font-bold text-[#FFD700] mb-1 cursor-pointer hover:text-yellow-400 transition-colors"
                            onClick={() => handleProductClick(item.product)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">{item.product.shortDescription}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-white">₹{item.product.price?.toLocaleString()}</span>
                            {item.product.comparePrice > item.product.price && (
                              <span className="line-through text-gray-500 text-lg">₹{item.product.comparePrice?.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={isRemoving}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-400 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        >
                          <Trash2 className={`w-5 h-5 ${isRemoving ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.product.material?.slice(0, 2).map((mat, idx) => (
                          <span key={idx} className="bg-[#FFD700]/20 text-[#FFD700] text-xs px-2 py-1 rounded border border-[#FFD700]/40">
                            {mat}
                          </span>
                        ))}
                        {item.product.style?.[0] && (
                          <span className="bg-[#FFD700]/10 text-[#FFD700] text-xs px-2 py-1 rounded-full border border-[#FFD700]/30">
                            {item.product.style[0]}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-center gap-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#FFD700]/90 text-black font-medium">
                            {item.product.brand?.name}
                          </span>
                          {item.product.ratings?.average > 0 && (
                            <span className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                              {item.product.ratings.average}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                         
                          <button
                            onClick={() => handleProductClick(item.product)}
                            className="bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-yellow-600 hover:to-[#FFD700] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#191919] border border-[#FFD700]/30 rounded-xl p-6 max-w-md w-full transform animate-scale-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/20 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Clear Wishlist</h3>
              </div>
              <p className="text-gray-400 mb-6">Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearingWishlist}
                  className="flex-1 bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearWishlist}
                  disabled={clearingWishlist}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                  {clearingWishlist ? 'Clearing...' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;