import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { apiConnector } from "../services/apiConnector";
import { orderEndpoints, reviewEndpoints } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setProductData } from "../slices/productSlice";

export default function ProductDetail() {
  const product = useSelector((state) => state.product.productData);
  const images = product?.images || [];
  const user = useSelector((state) => state.auth.userData);
  const token = useSelector((state) => state.auth.token);

  const navigate = useNavigate();
  const userRole = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(images[0]?.url || "");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [animateButtons, setAnimateButtons] = useState(false);

  // Product selection states - changed from arrays to single values
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedSize, setSelectedSize] = useState(""); // Add size selection if needed

  // Add new states for furniture specific features
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Review related states
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    selectedOrderId: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const buyNowHandler = () => {
    if (userRole !== "user") {
      toast.error("Please log in as a valid user!");
      return;
    }

    // Validate stock
    if (!product || product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    // Validate required selections
    if (product.color && product.color.length > 1 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (product.material && product.material.length > 1 && !selectedMaterial) {
      toast.error("Please select a material");
      return;
    }

    if (product.style && product.style.length > 1 && !selectedStyle) {
      toast.error("Please select a style");
      return;
    }

    if (product.roomType && product.roomType.length > 1 && !selectedRoomType) {
      toast.error("Please select a room type");
      return;
    }

    // Validate variant selection if variants exist
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    // Create product object with selected options
    const productToOrder = {
      ...product,
      selectedColor: selectedColor || (product.color && product.color[0]) || "",
      selectedMaterial: selectedMaterial || (product.material && product.material[0]) || "",
      selectedStyle: selectedStyle || (product.style && product.style[0]) || "",
      selectedRoomType: selectedRoomType || (product.roomType && product.roomType[0]) || "",
      selectedSize: selectedSize || "Standard", // Default size if not specified
      selectedVariant,
      price: selectedVariant ? selectedVariant.price : product.price,
    };

    dispatch(setProductData(productToOrder));
    navigate("/create-order");
  };

  const cartHandler = async () => {
    if (userRole !== "user") {
      toast.error("Please log in as a valid user!");
      return;
    }

    if (!product || !product._id || product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    // Validate required selections
    if (product.color && product.color.length > 1 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (product.material && product.material.length > 1 && !selectedMaterial) {
      toast.error("Please select a material");
      return;
    }

    try {
      setIsAddingToCart(true);
      
      const productToAdd = {
        ...product,
        selectedColor: selectedColor || (product.color && product.color[0]) || "",
        selectedMaterial: selectedMaterial || (product.material && product.material[0]) || "",
        selectedStyle: selectedStyle || (product.style && product.style[0]) || "",
        selectedRoomType: selectedRoomType || (product.roomType && product.roomType[0]) || "",
        selectedSize: selectedSize || "Standard",
        selectedVariant,
        price: selectedVariant ? selectedVariant.price : product.price,
      };
      
      dispatch(addToCart(productToAdd));
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    setImageLoading(true);
    setSelectedImage(imageUrl);
    setTimeout(() => setImageLoading(false), 200);
  };

  // Fetch user's orders to check eligibility for review
  const checkReviewEligibility = async () => {
    if (!user || !token || !product?._id) {
      setCanReview(false);
      return;
    }

    try {
      const ordersRes = await apiConnector(
        "GET", 
        orderEndpoints.userOrdersWithoutPagination, 
        null, 
        {
          Authorization: `Bearer ${token}`
        }
      );

      console.log("Orders Response:", ordersRes.data);

      if (ordersRes.data.success) {
        // Check for delivered orders containing this product
        const deliveredOrders = ordersRes.data.orders.filter(order => 
          order.currentStatus === "Delivered" && 
          order.items.some(item => item.product === product._id)
        );

        console.log("Delivered Orders:", deliveredOrders);
        setEligibleOrders(deliveredOrders);
        setCanReview(deliveredOrders.length > 0);

        // Check for existing review
        try {
          const reviewRes = await apiConnector(
            "GET", 
            `${reviewEndpoints.getUserReviewForProduct}${product._id}`, 
            null, 
            { Authorization: `Bearer ${token}` }
          );

          console.log("Review Response:", reviewRes.data);
          
          if (reviewRes.data && reviewRes.data.review) {
            setExistingReview(reviewRes.data.review);
            setReviewForm({
              rating: reviewRes.data.review.rating,
              comment: reviewRes.data.review.comment,
              selectedOrderId: reviewRes.data.review.order
            });
          }
        } catch (reviewError) {
          console.log("Error fetching review:", reviewError);
        }
      }
    } catch (error) {
      console.log("Error checking review eligibility:", error);
    }
  };

  // Fetch product reviews
  const fetchProductReviews = async () => {
    if (!product?._id) return;

    try {
      setReviewsLoading(true);
      const response = await apiConnector(
        "GET", 
        `${reviewEndpoints.getReviewByProductId}${product._id}`
      );

      console.log("Reviews Response:", response.data);

      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit or update review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    if (!reviewForm.selectedOrderId && !existingReview) {
      toast.error("Please select an order");
      return;
    }

    setIsSubmittingReview(true);

    try {
      let response;
      
      if (existingReview) {
        // Update existing review
        response = await apiConnector("PUT", 
          `${reviewEndpoints.updateReview}${existingReview._id}`, 
          {
            rating: reviewForm.rating,
            comment: reviewForm.comment
          },
          { Authorization: `Bearer ${token}` }
        );
      } else {
        // Create new review
        response = await apiConnector("POST", 
          `${reviewEndpoints.createReview}${product._id}${reviewForm.selectedOrderId}`, 
          {
            rating: reviewForm.rating,
            comment: reviewForm.comment
          },
          { Authorization: `Bearer ${token}` }
        );
      }

      if (response.data.message !== "You have already reviewed this product for this order") {
        toast.success(existingReview ? "Review updated!" : "Review submitted!");
        setShowReviewModal(false);
        
        // Refresh reviews and check eligibility
        await fetchProductReviews();
        await checkReviewEligibility();
      } else {
        toast.error("You have already reviewed this product for this order");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`text-xl ${
              star <= rating 
                ? "text-yellow-400" 
                : "text-gray-600"
            } ${interactive ? "hover:text-yellow-300 cursor-pointer" : "cursor-default"} transition-colors duration-200`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0].url);
      setImageLoading(false);
    }
    
    // Set default selections if there's only one option
    if (product) {
      if (product.color && product.color.length === 1) {
        setSelectedColor(product.color[0]);
      }
      if (product.material && product.material.length === 1) {
        setSelectedMaterial(product.material[0]);
      }
      if (product.style && product.style.length === 1) {
        setSelectedStyle(product.style[0]);
      }
      if (product.roomType && product.roomType.length === 1) {
        setSelectedRoomType(product.roomType[0]);
      }
    }
    
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setAnimateButtons(true), 800);
  }, [images, product]);

  useEffect(() => {
    if (product?._id) {
      fetchProductReviews();
      checkReviewEligibility();
    }
  }, [product?._id, user, token]);

  const detailItems = [
    { label: "Brand", value: product?.brand?.name || "N/A" },
    { label: "Category", value: product?.category?.name || "Uncategorized" },
    { label: "Assembly Required", value: product?.assemblyRequired ? "Yes" : "No" },
    { label: "Assembly Time", value: product?.assemblyTime ? `${product.assemblyTime} minutes` : "—" },
    { label: "Weight Capacity", value: product?.weightCapacity ? `${product.weightCapacity} kg` : "—" },
  ];

  const offers = [
    { icon: "🪙", text: "Cashback: Upto ₹17.00 as wallet credit" },
    { icon: "🏦", text: "Bank Offer: ₹2,000 off on credit card payments" },
    { icon: "🤝", text: "Combo Offer: Buy 2 get 5% off, Buy 3 get 7% off" }
  ];

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="bg-black text-[#ecba49] min-h-screen p-6 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Images Section */}
        <div className={`flex flex-col gap-4 transition-all duration-800 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
          {/* Main Image */}
          <div className="w-full h-[60vh] rounded-xl overflow-hidden relative group">
            <div className={`absolute inset-0 bg-gray-800 rounded-xl transition-opacity duration-300 ${imageLoading ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#ecba49] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <img
              src={selectedImage}
              alt="Main Product"
              className={`w-full h-full object-cover rounded-xl transition-all duration-500 group-hover:scale-110 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Click to zoom
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-3 flex-wrap">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => handleImageSelect(img.url)}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                  selectedImage === img.url
                    ? "border-[#ecba49] scale-110 shadow-lg"
                    : "border-transparent hover:border-[#ecba49]/50"
                } transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: `${400 + idx * 100}ms` }}
              />
            ))}
          </div>

          {/* Color Selection */}
          {product?.color && product.color.length > 1 && (
            <div className={`transition-all duration-600 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-3 text-[#ecba49]">Select Color:</h3>
              <div className="flex flex-wrap gap-3">
                {product.color.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedColor === color
                        ? "border-[#ecba49] bg-[#ecba49] text-black shadow-lg scale-105"
                        : "border-[#ecba49]/50 text-[#ecba49] hover:border-[#ecba49] hover:bg-[#ecba49]/10"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material Selection */}
          {product?.material && product.material.length > 1 && (
            <div className={`transition-all duration-600 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-3 text-[#ecba49]">Select Material:</h3>
              <div className="flex flex-wrap gap-3">
                {product.material.map((material, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMaterial(material)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedMaterial === material
                        ? "border-[#ecba49] bg-[#ecba49] text-black shadow-lg scale-105"
                        : "border-[#ecba49]/50 text-[#ecba49] hover:border-[#ecba49] hover:bg-[#ecba49]/10"
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Style Selection */}
          {product?.style && product.style.length > 1 && (
            <div className={`transition-all duration-600 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-3 text-[#ecba49]">Select Style:</h3>
              <div className="flex flex-wrap gap-3">
                {product.style.map((style, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedStyle === style
                        ? "border-[#ecba49] bg-[#ecba49] text-black shadow-lg scale-105"
                        : "border-[#ecba49]/50 text-[#ecba49] hover:border-[#ecba49] hover:bg-[#ecba49]/10"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Room Type Selection */}
          {product?.roomType && product.roomType.length > 1 && (
            <div className={`transition-all duration-600 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-3 text-[#ecba49]">Select Room Type:</h3>
              <div className="flex flex-wrap gap-3">
                {product.roomType.map((room, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRoomType(room)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedRoomType === room
                        ? "border-[#ecba49] bg-[#ecba49] text-black shadow-lg scale-105"
                        : "border-[#ecba49]/50 text-[#ecba49] hover:border-[#ecba49] hover:bg-[#ecba49]/10"
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants Section */}
          {product?.variants && product.variants.length > 0 && (
            <div className={`transition-all duration-600 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-3 text-[#ecba49]">Select Variant:</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedVariant === variant
                        ? "border-[#ecba49] bg-[#ecba49] text-black shadow-lg scale-105"
                        : "border-[#ecba49]/50 text-[#ecba49] hover:border-[#ecba49] hover:bg-[#ecba49]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{variant.material} - {variant.finish}</span>
                      <span className="text-sm">₹{variant.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions Section */}
          <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Dimensions</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Length:</span>
                <span className="ml-2">{product?.dimensions?.length || '—'} {product?.dimensions?.unit}</span>
              </div>
              <div>
                <span className="text-gray-400">Width:</span>
                <span className="ml-2">{product?.dimensions?.width || '—'} {product?.dimensions?.unit}</span>
              </div>
              <div>
                <span className="text-gray-400">Height:</span>
                <span className="ml-2">{product?.dimensions?.height || '—'} {product?.dimensions?.unit}</span>
              </div>
            </div>
          </div>

          {/* Sustainability Info */}
          {(product?.ecoFriendly || product?.sustainableMaterials) && (
            <div className="mt-4 p-4 bg-green-900/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-500">Sustainability</h3>
              <div className="space-y-2">
                {product.ecoFriendly && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Eco-Friendly Product</span>
                  </div>
                )}
                {product.sustainableMaterials && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Made with Sustainable Materials</span>
                  </div>
                )}
                {product.certifications?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Certifications: {product.certifications.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className={`space-y-4 transition-all duration-800 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
          
          {/* Product Title */}
          <h1 className="text-3xl font-bold hover:text-yellow-300 transition-colors duration-300 cursor-default">
            {product?.name || "Product Name"}
          </h1>

          {/* Rating and Badge */}
          <div className={`flex items-center gap-3 text-sm transition-all duration-600 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
              <span className="font-semibold text-[#ecba49]">
                {averageRating}
              </span>
            </div>
            <span className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              ({reviews.length} reviews)
            </span>
            <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold animate-pulse hover:animate-none hover:scale-105 transition-transform duration-300">
              UKF's Pick
            </span>
          </div>

          {/* Sold Count */}
          <p className={`text-sm text-gray-400 transition-all duration-600 delay-400 hover:text-gray-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {product?.sold || 0}+ sold
          </p>

          {/* Price Section */}
          <div className={`space-y-1 transition-all duration-600 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex gap-2 items-baseline">
              <span className="text-red-500 text-lg font-bold animate-pulse">-{Math.round(((product?.comparePrice - product?.price)/product?.comparePrice)*100)}%</span>
              <span className="text-2xl font-bold hover:text-yellow-300 transition-colors duration-300">
                ₹{selectedVariant ? selectedVariant.price : product?.price}
              </span>
            </div>
            <div className="text-gray-400 line-through hover:text-gray-300 transition-colors duration-300">
              M.R.P.: ₹{product?.comparePrice || Math.round((selectedVariant ? selectedVariant.price : product?.price) * 1.25)}
            </div>
            <div className="text-sm text-gray-400">Inclusive of all taxes</div>
          </div>

          {/* Selected Options Display */}
          {(selectedColor || selectedMaterial || selectedStyle || selectedRoomType) && (
            <div className={`bg-[#1a1a1a] p-4 rounded-lg transition-all duration-600 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-lg font-semibold mb-2 text-[#ecba49]">Selected Options:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedColor && <div><strong>Color:</strong> {selectedColor}</div>}
                {selectedMaterial && <div><strong>Material:</strong> {selectedMaterial}</div>}
                {selectedStyle && <div><strong>Style:</strong> {selectedStyle}</div>}
                {selectedRoomType && <div><strong>Room:</strong> {selectedRoomType}</div>}
              </div>
            </div>
          )}

          {/* Coupon Checkbox */}
          <div className={`flex items-center gap-2 transition-all duration-600 delay-700 hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <input type="checkbox" id="coupon" className="accent-[#ecba49] transition-transform duration-300 hover:scale-110" />
            <label htmlFor="coupon" className="text-sm cursor-pointer hover:text-yellow-300 transition-colors duration-300">
              Apply 3% coupon
            </label>
          </div>

          {/* Offers Section */}
          <div className={`bg-[#1a1a1a] p-4 rounded-lg space-y-2 text-sm border border-transparent hover:border-[#ecba49]/30 transition-all duration-600 delay-800 hover:shadow-lg ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {offers.map((offer, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-300 hover:scale-105 transform"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="text-lg">{offer.icon}</span>
                <span>{offer.text}</span>
              </div>
            ))}
          </div>

          {/* Stock Status */}
          <div className={`font-semibold transition-all duration-600 delay-900 hover:scale-105 ${
            product?.stock > 0 ? "text-green-500" : "text-red-500"
          } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {product?.stock > 0 ? "✓ In stock" : "✗ Out of stock"}
          </div>

          {/* Shipping Info */}
          <div className={`space-y-1 text-sm text-gray-400 transition-all duration-600 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="hover:text-gray-300 transition-colors duration-300">
              Ships from UKF • Sold by RK World Infocom Pvt Ltd
            </p>
            <p className="hover:text-gray-300 transition-colors duration-300">
              Payment: Secure transaction 🔒
            </p>
          </div>

          {/* Product Details Grid */}
          <div className={`grid grid-cols-2 gap-3 mt-4 text-sm transition-all duration-600 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {detailItems.map((item, idx) => (
              <div 
                key={idx}
                className="hover:text-yellow-300 transition-all duration-300 hover:scale-105 transform p-2 rounded hover:bg-[#1a1a1a]"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-wrap gap-4 mt-6 transition-all duration-800 ${animateButtons ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button
              onClick={cartHandler}
              disabled={product?.stock <= 0 || isAddingToCart}
              className={`relative bg-[#ecba49] text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:brightness-110 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                isAddingToCart ? 'animate-pulse' : ''
              }`}
            >
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
              <span className="relative z-10">
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  "Add to Cart"
                )}
              </span>
            </button>
            
            <button
              onClick={buyNowHandler}
              className="relative border-2 border-[#ecba49] px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-[#ecba49] hover:text-black hover:scale-105 hover:shadow-lg active:scale-95 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[#ecba49] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10">Buy Now</span>
            </button>

            {/* Review Button - Updated Condition */}
            {user && (canReview || existingReview) && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="relative border-2 border-green-500 text-green-500 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-green-500 hover:text-black hover:scale-105 hover:shadow-lg active:scale-95 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10">
                  {existingReview ? "Update Review" : "Write Review"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-[#ecba49]">Customer Reviews</h2>
        
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#ecba49] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-[#1a1a1a] p-6 rounded-lg border border-[#ecba49]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ecba49] rounded-full flex items-center justify-center text-black font-bold">
                    {review.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-[#ecba49]">
                        {review.user?.name || "Anonymous User"}
                      </h4>
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-6 border border-[#ecba49]/30">
            <h3 className="text-xl font-bold text-[#ecba49] mb-4">
              {existingReview ? "Update Your Review" : "Write a Review"}
            </h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm(prev => ({ ...prev, rating }))
                )}
              </div>

              {/* Order Selection (only for new reviews) */}
              {!existingReview && eligibleOrders.length >= 1 && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Order</label>
                  <select
                    value={reviewForm.selectedOrderId}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, selectedOrderId: e.target.value }))}
                    className="w-full p-3 bg-black border border-[#ecba49]/30 rounded text-[#ecba49] focus:border-[#ecba49] focus:outline-none"
                    required
                  >
                    <option value="">Choose an order</option>
                    {eligibleOrders.map((order) => (
                      <option key={order._id} value={order._id}>
                        Order #{order._id.slice(-6)} - {new Date(order.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold mb-2">Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 bg-black border border-[#ecba49]/30 rounded text-[#ecba49] focus:border-[#ecba49] focus:outline-none resize-none"
                  rows="4"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 transition-colors duration-300"
                  disabled={isSubmittingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-2 bg-[#ecba49] text-black rounded font-semibold hover:brightness-110 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : (existingReview ? "Update Review" : "Submit Review")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(236, 186, 73, 0.2), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}