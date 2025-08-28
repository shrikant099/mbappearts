import React, { useState } from 'react';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, decreaseItemQuantity, removeFromCart } from '../../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { setProductData } from '../../slices/productSlice';
import toast from 'react-hot-toast';

const CartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  
  const cart = useSelector(state => state.cart.cart || []);
  const totalItems = useSelector(state => state.cart.totalItems || 0);
  const total = useSelector(state => state.cart.total || 0);
  
  const navigate = useNavigate();

  const handleClick = (product) => {
    dispatch(setProductData(product));
    navigate("/productdetail");
    setIsOpen(false);
  };

  // Function to handle checkout navigation
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    navigate("/create-order?fromCart=true", {
      state: { fromCart: true }
    });
    setIsOpen(false);
  };
  
  const displayItems = cart;

  // Format price with Indian currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (price, comparePrice) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  // FIXED: Safe function to handle array/string joining
  const safeDisplayValue = (value, fallback = "N/A") => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || fallback;
  };

  return (
    <>
      {/* Cart Icon */}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <FaShoppingCart className="text-[#FFD700] text-xl" />
        {(totalItems > 0 || cart.length > 0) && (
          <div className="absolute z-[140] w-5 h-5 bg-[#FFD700] rounded-full top-0 right-0 text-sm text-black -translate-y-1/2 translate-x-1/2 flex justify-center items-center font-bold">
            {totalItems || cart.length}
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 z-[300]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-black text-[#FFD700] z-[400] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } shadow-2xl border-l-2 border-[#FFD700]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#FFD700] border-opacity-30">
          <h2 className="text-xl font-bold ml-8">Your Cart</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[#FFD700] hover:text-white text-xl p-1"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          <div className="hidescroll flex-1 overflow-y-auto p-4">
            
            {/* Empty Cart Message */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FaShoppingCart className="text-6xl text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-400 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500">Add some items to get started!</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {displayItems.map((item) => (
                    <div key={item._id} className="flex gap-3 p-4 bg-gray-900 bg-opacity-70 rounded-lg border border-[#FFD700] border-opacity-20">
                      {/* Product Image */}
                      <img 
                        src={item.images[0]?.url || '/placeholder.jpg'} 
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-md flex-shrink-0 cursor-pointer"
                        onClick={() => handleClick(item)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        {/* Product Name */}
                        <h3 
                          className="text-sm font-bold text-[#FFD700] mb-1 leading-tight cursor-pointer hover:underline"
                          onClick={() => handleClick(item)}
                        >
                          {item.name}
                        </h3>

                        {/* Product Details - FIXED */}
                        {item.selectedVariant ? (
                          <>
                            <p className="text-xs text-gray-300 mb-1">
                              Material: {item.selectedVariant.material}
                            </p>
                            <p className="text-xs text-gray-300 mb-2">
                              Finish: {item.selectedVariant.finish}
                            </p>
                          </>
                        ) : (
                          <>
                            {(item.material || item.selectedMaterial) && (
                              <p className="text-xs text-gray-300 mb-1">
                                Material: {safeDisplayValue(item.material) || item.selectedMaterial}
                              </p>
                            )}
                            {(item.color || item.selectedColor) && (
                              <p className="text-xs text-gray-300 mb-2">
                                Color: {safeDisplayValue(item.color) || item.selectedColor}
                              </p>
                            )}
                          </>
                        )}
                        
                        {/* Price Section */}
                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[#FFD700] font-bold text-lg">
                              {formatPrice(item.selectedVariant?.price || item.price)}
                            </span>
                            {item.comparePrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(item.comparePrice)}
                                </span>
                                <span className="text-xs text-red-400 font-semibold">
                                  ({calculateDiscount(item.price, item.comparePrice)}% Off)
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.quantity > 1) {
                                    dispatch(decreaseItemQuantity(item));
                                  }
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                  ${item.quantity > 1 
                                    ? 'bg-[#FFD700] text-black hover:bg-yellow-500' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus />
                              </button>
                              <span className="text-lg font-bold w-8 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.quantity < (item.stock || 10)) {
                                    dispatch(addToCart(item));
                                  } else {
                                    toast.error("Maximum stock limit reached");
                                  }
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                  ${item.quantity < (item.stock || 10)
                                    ? 'bg-[#FFD700] text-black hover:bg-yellow-500'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                                disabled={item.quantity >= (item.stock || 10)}
                              >
                                <FaPlus />
                              </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(removeFromCart(item));
                              }}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900 hover:bg-opacity-20 rounded transition-colors"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer with total and checkout */}
          {cart.length > 0 && (
            <div className="border-t-2 border-[#FFD700] border-opacity-50 p-4 mb-8 bg-gray-900 bg-opacity-80">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">
                  Subtotal ({cart.length} items)
                </span>
                <span className="text-2xl font-bold text-[#FFD700]">
                  {formatPrice(total)}
                </span>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-[#FFD700] text-black py-4 rounded-lg font-bold text-base hover:bg-yellow-500 transition-colors shadow-lg"
              >
                CONTINUE TO CHECKOUT
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-2">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
