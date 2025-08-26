import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setProductData } from "../../slices/productSlice";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setProductData(product));
    navigate("/productdetail");
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#1a1a1a] cursor-pointer hover:scale-105 border border-[#FFD700] p-4 rounded-xl text-[#FFD700]"
    >
      <img
        src={product?.images[0]?.url}
        alt={product.name}
        className="w-full h-[250px] object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm">₹{product.price}</p>
      <span className="text-xs bg-[#FFD700] text-black px-2 py-1 rounded-full mt-2 inline-block">
        {product?.brand?.name}
      </span>
    </div>
  );
};

export default ProductCard;
