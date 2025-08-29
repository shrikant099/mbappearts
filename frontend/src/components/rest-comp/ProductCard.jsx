import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { setProductData } from "../../slices/productSlice";
import { Heart, Star } from "lucide-react";
import { endpoints } from "../../services/api";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const discount =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (token && product?._id) {
      checkWishlistStatus();
    }
  }, [product._id, token]);

  const checkWishlistStatus = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(endpoints.getWishlistItems, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const isProductInWishlist = data.wishlist.some(
          item => item.product._id === product._id
        );
        setIsInWishlist(isProductInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    if (!token) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setIsHeartAnimating(true);

    try {
      let response;
      
      if (isInWishlist) {
        // Remove from wishlist
        response = await fetch(`${endpoints.removeProductFromWishlist}${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        response = await fetch(endpoints.addProductToWishlist, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Added to wishlist!');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsHeartAnimating(false), 600);
    }
  };

  const handleClick = () => {
    dispatch(setProductData(product));
    navigate("/productdetail");
  };

  const productImage = product?.images?.[0]?.url || "/placeholder.jpg";

  return (
    <div
      onClick={handleClick}
      className="bg-[#191919] relative group shadow-lg cursor-pointer hover:scale-105 border border-[#FFD700] p-5 rounded-2xl text-[#FFD700] transition-transform duration-300"
    >
      <div className="relative mb-4">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-[230px] object-cover rounded-lg group-hover:brightness-105 group-hover:shadow-xl transition duration-300"
        />
        <button
          className={`absolute top-4 right-4 backdrop-blur-sm p-2 rounded-full z-200 transition-all duration-300 ${
            isInWishlist 
              ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/20' 
              : 'bg-black/70 text-red-500 hover:bg-[#FFD700]/50 hover:text-[#191919]'
          } ${isHeartAnimating ? 'animate-bounce scale-110' : ''} ${isLoading ? 'opacity-70' : ''}`}
          type="button"
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          <Heart 
            className={`w-5 h-5 transition-all duration-300 ${
              isInWishlist ? 'fill-current scale-110' : ''
            } ${isHeartAnimating ? 'animate-pulse' : ''}`} 
          />
        </button>
        {discount && (
          <span className="absolute top-4 left-4 px-2 py-1 bg-gradient-to-r from-[#FFD700]/90 to-yellow-500 text-black text-xs font-bold rounded-full shadow-lg animate-pulse">
            {discount}% OFF
          </span>
        )}
        {product?.stock <= product?.lowStockThreshold && (
          <span className="absolute bottom-4 left-4 px-2 py-1 bg-red-700 text-white text-xs rounded-full shadow">
            Low Stock!
          </span>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">₹{product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="line-through text-sm text-[#FFD700]/60">₹{product.comparePrice}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {product?.material?.slice(0, 2).map((mat, idx) =>
            <span key={mat+idx} className="bg-[#FFD700]/20 text-sm px-2 py-0.5 rounded border border-[#FFD700]/40">
              {mat}
            </span>
          )}
          {product?.style?.[0] && (
            <span className="bg-[#FFD700]/10 text-xs px-2 py-0.5 rounded-full border border-[#FFD700]/30">
              {product.style[0]}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs px-2 py-1 rounded-full bg-[#FFD700]/90 text-black font-medium">
            {product?.brand?.name}
          </span>
          {product?.ratings?.average > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
              {Math.round(product.ratings.average * 10) / 10}
            </span>
          )}
        </div>
      </div>
      {/* Hover info overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/70 rounded-2xl flex flex-col justify-center items-center text-white text-center p-4 z-10">
        <span className="text-base font-bold">{product?.roomType?.join(", ")}</span>
        <span className="text-xs mt-2">{product?.shortDescription}</span>
      </div>
    </div>
  );
};

export default ProductCard;