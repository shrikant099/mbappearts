import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setProductData } from "../../slices/productSlice";
import { Heart, Star } from "lucide-react"; // Optional: replace with your preferred icon lib

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const discount =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleClick = () => {
    dispatch(setProductData(product));
    navigate("/productdetail");
  };

  // Optionally use a fallback if no image is present
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
          className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm p-2 rounded-full text-red-500 z-10 hover:bg-[#FFD700]/50 hover:text-[#191919] transition"
          type="button"
          onClick={e => e.stopPropagation()} // So not to trigger card click
        >
          <Heart className="w-5 h-5" />
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
