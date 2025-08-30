import React, { useEffect, useState, useMemo } from "react";
import {
  Package,
  Recycle,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Heart,
  Zap,
  Play,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearFilters, updateFilter } from "../slices/filterSlice";
import AnimatedBackground from "../components/AnimatedBackground";
import { reviewEndpoints, categoryEndpoints } from "../services/api";
import { apiConnector } from "../services/apiConnector";
import video from "../assets/images/3770034-hd_1920_1080_25fps.mp4"

const { topReview } = reviewEndpoints;
const { getAllCategory } = categoryEndpoints;

// Fallback images for categories
const categoryImages = {
  sofa: "https://media.designcafe.com/wp-content/uploads/2021/04/15173304/trending-sofa-designs-for-your-home.jpg",
  bed: "https://www.nilkamalfurniture.com/cdn/shop/files/Mozart_16721e45-a1b5-4c99-907a-8fc634c73955.webp?v=1753176850",
  dining: "https://ik.imagekit.io/2xkwa8s1i/img/WDINEKOPRS6COPCBSWR1/0.jpg?tr=w-3840",
  chair: "https://ikiru.in/cdn/shop/files/buy-dining-chair-acme-curve-wood-and-grey-upholstery-dining-chair-set-of-2-or-chairs-for-dining-room-and-home-by-orange-tree-on-ikiru-online-store-1.jpg?v=1739208850",
  table: "https://ergosphere.in/wp-content/uploads/2022/05/BD390-Teak-Render-Grey-UCurve.png",
  almirah: "https://www.aboutspace.in/cdn/shop/files/51dKDTVDesL.jpg?v=1723610704",
  bench: "https://media.designcafe.com/wp-content/uploads/2021/04/15173304/trending-sofa-designs-for-your-home.jpg",
  default: "https://via.placeholder.com/400x600/1f2937/ffffff?text=Category"
};

const featuredImages = {
  livingroom: "https://www.marthastewart.com/thmb/9Pa_KJYx2q7iHe8xE1VKe2MGKwo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ms-cozy-living-room-ideas-heidi-harris-d20b6776355843cea943bafdd6a94f44.jpg",
  bedroom: "https://www.bocadolobo.com/en/inspiration-and-ideas/wp-content/uploads/2023/09/Indulge-In-Opulence-50-Luxurious-Bedroom-Decor-Ideas-1-1024x788.jpg",
  workspace: "https://www.hatcollective.com/wp-content/uploads/2022/08/360-workspace-kita-e2-open-office.jpg",
  forest: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop&q=80",
};

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch top reviews
  const fetchTopReview = async () => {
    try {
      const topreview = await apiConnector("GET", topReview);
      const dataReview = topreview?.data?.reviews;
      setReviews(dataReview?.slice(0, Math.min(3, dataReview.length)) || []);
    } catch (error) {
      console.log("Error fetching top reviews:", error);
    }
  }

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await apiConnector("GET", getAllCategory);
      console.log("Categories response:", response);
      
      const fetchedCategories = response?.data || [];
      
      // Filter active categories and add fallback images
      const activeCategories = fetchedCategories
        .filter(cat => cat.status === 'active')
        .slice(0, 6) // Limit to 6 categories for display
        .map((cat, index) => {
          // Try to match category name to get appropriate image
          const categoryKey = cat.name.toLowerCase().replace(/\s+/g, '');
          const imageKey = Object.keys(categoryImages).find(key => 
            categoryKey.includes(key) || cat.name.toLowerCase().includes(key)
          ) || 'default';
          
          return {
            ...cat,
            image: categoryImages[imageKey] || categoryImages.default,
            key: cat._id
          };
        });
      
      console.log("Processed categories:", activeCategories);
      setCategories(activeCategories);
    } catch (error) {
      console.log("Error fetching categories:", error);
      // Set fallback categories if API fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    dispatch(clearFilters());
    setTimeout(() => setIsVisible(true), 100);
    fetchTopReview();
    fetchCategories();
  }, [dispatch]);

  // Handle category click - FIXED for server-side filtering
  const handleCategoryClick = (category) => {
    console.log("Category clicked:", category);
    dispatch(clearFilters()); // Clear existing filters first
    
    // Use category ID for server-side filtering
    dispatch(updateFilter({
      type: "category",
      value: category._id || category.id, // Use the database ID
      checked: true
    }));
    
    console.log("Navigating to products with category filter:", category._id || category.id);
    navigate("/products");
  };

  // Handle room type filtering - FIXED for server-side filtering
  const handleRoomTypeClick = (roomType) => {
    console.log("Room type clicked:", roomType);
    dispatch(clearFilters()); // Clear existing filters first
    
    // Room type is stored as an array in products, so we pass it as an array
    dispatch(updateFilter({
      type: "roomType",
      value: [roomType], // Pass as array to match backend expectations
      checked: true
    }));
    
    console.log("Navigating to products with roomType filter:", roomType);
    navigate("/products");
  };

  const handleShopNowClick = () => {
    dispatch(clearFilters()); // Clear any existing filters
    navigate("/products");
  };
  
  const handleLearnMoreClick = () => navigate("/about");

  // Fallback category data if database fetch fails
  const fallbackCategoryData = useMemo(() => [
    { name: "Sofas", image: categoryImages.sofa, _id: "fallback-sofa", key: "sofa" },
    { name: "Beds", image: categoryImages.bed, _id: "fallback-bed", key: "bed" },
    { name: "Dining Tables", image: categoryImages.dining, _id: "fallback-dining", key: "dining" },
    { name: "Chairs", image: categoryImages.chair, _id: "fallback-chair", key: "chair" },
   
  ], []);

  // Use fetched categories or fallback
  const displayCategories = categories.length > 0 ? categories : fallbackCategoryData;

  // Featured sections with room type filtering
  const featuredSections = useMemo(() => [
    {
      image: featuredImages.livingroom,
      title: "Living Room Inspirations",
      buttonText: "Discover Sofas & More",
      icon: Sparkles,
      key: "livingroom",
      roomType: "Living Room" // Must match exactly with your Product model enum
    },
    {
      image: featuredImages.bedroom,
      title: "Sleep in Style",
      buttonText: "Explore Beds",
      icon: Star,
      key: "bedroom",
      roomType: "Bedroom" // Must match exactly with your Product model enum
    },
    {
      image: featuredImages.workspace,
      title: "Workspaces",
      buttonText: "Shop Desks & Chairs",
      icon: Heart,
      key: "workspace",
      roomType: "Office" // Must match exactly with your Product model enum
    },
  ], []);

  const features = useMemo(() => [
    {
      icon: Package,
      title: "Minimum Delivery Charges",
      description: "Get your furniture delivered at the minimum extra charges across India.",
    },
    {
      icon: Recycle,
      title: "Eco-friendly Materials",
      description: "Sustainably crafted, consciously sourced.",
    },
    {
      icon: MapPin,
      title: "Visit Our Showroom",
      description: "Experience fine furniture in person at Bholoosar, Rajasthan.",
    },
  ], []);

  const ImageWithFallback = React.memo(
    ({ src, alt, className, imageKey, children }) => {
      const [currentSrc, setCurrentSrc] = useState(src);
      const [hasError, setHasError] = useState(false);
      const [isLoaded, setIsLoaded] = useState(false);

      const handleError = () => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(
            `https://via.placeholder.com/400x600/1f2937/ffffff?text=${encodeURIComponent(alt)}`
          );
        }
      };

      const handleLoad = () => setIsLoaded(true);

      return (
        <div className={`relative ${className}`}>
          <img
            src={currentSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110 ${
              isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
            }`}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-lg font-medium">Loading...</div>
            </div>
          )}
          {children}
        </div>
      );
    }
  );

  return (
    <div className="overflow-hidden bg-black text-white relative">
      <AnimatedBackground />
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            onLoadedData={() => setVideoPlaying(true)}
            onError={() => setVideoPlaying(false)}
            style={{ filter: "brightness(0.7)" }}
          >
            <source src={video} type="video/mp4" />
          </video>
          {!videoPlaying && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/15 z-10" />
        </div>
        <div
          className={`relative z-20 flex items-center justify-start pl-6 lg:pl-16 min-h-screen transition-all duration-1200 ease-out ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <div className="max-w-2xl">
            <div className="text-4xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              Elevate Your Living Space
            </div>
            <div className="text-lg lg:text-2xl mb-8 text-white drop-shadow-2xl">
              Discover handcrafted furniture designed for your comfort and style.
            </div>
            <button
              onClick={handleShopNowClick}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 lg:px-12 py-3 lg:py-4 rounded-full text-lg lg:text-xl font-bold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                SHOP NOW
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </button>
          </div>
        </div>
        <div className="absolute top-8 right-8 z-30">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
            <Play className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-sm font-medium">Video</span>
          </div>
        </div>
      </div>

     

      {/* Featured Sections - FIXED for server-side filtering */}
      <div className="py-16 lg:py-24 px-6 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Featured Collections
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featuredSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.key}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-yellow-400/30 transition-all duration-800 hover:scale-105 hover:-translate-y-4 cursor-pointer"
                onClick={() => handleRoomTypeClick(section.roomType)}
              >
                <div className="relative h-80 lg:h-96 overflow-hidden">
                  <ImageWithFallback
                    src={section.image}
                    alt={section.title}
                    imageKey={section.key}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-700" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white group-hover:text-yellow-300 drop-shadow-2xl">
                    {section.title}
                  </h3>
                  <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-3 rounded-full font-bold hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-yellow-400/30">
                    {section.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Section */}
      <div className="relative py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={featuredImages.forest}
            alt="Forest background"
            imageKey="forest"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-block p-4 bg-yellow-400/20 backdrop-blur-sm rounded-full mb-8 animate-pulse border border-yellow-400/30">
            <Zap className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white drop-shadow-2xl">
            We are on a mission to bring quality and beauty to your home.
          </h2>
          <p className="text-xl lg:text-2xl text-yellow-200 mb-8 drop-shadow-lg">
            Read about our craftsmanship & sustainability
          </p>
          <button
            onClick={handleLearnMoreClick}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400 transition-all duration-700 hover:scale-105 hover:-translate-y-4"
              >
                <div className="relative z-10">
                  <div className="w-20 lg:w-24 h-20 lg:h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <IconComponent className="w-10 lg:w-12 h-10 lg:h-12 text-black" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white group-hover:text-yellow-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats & Testimonials Section */}
      <div className="py-16 lg:py-24 px-6 bg-gradient-to-br from-yellow-900 via-yellow-800 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white drop-shadow-2xl">
              Trusted by Thousands
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full animate-pulse mb-12" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "5K+", label: "Happy Customers", icon: "😊" },
                { number: "2K+", label: "Furniture Delivered", icon: "🪑" },
                { number: "10+", label: "Years Crafting", icon: "⭐" },
                { number: "99%", label: "Satisfaction Rate", icon: "❤️" },
              ].map((stat, index) => (
                <div key={index} className="group bg-black/30 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="text-4xl lg:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-black text-yellow-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white text-lg font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-black/40 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <img src={testimonial.user?.image} className="h-[40px] w-[40px] rounded-full" alt="Customer" />
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-lg">
                      {testimonial.user?.name}
                    </h4>
                    <p className="text-gray-300 text-sm">Customer</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-white text-lg leading-relaxed group-hover:text-yellow-100 transition-colors duration-300">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-block p-4 bg-yellow-400/20 backdrop-blur-sm rounded-full mb-8 animate-bounce border border-yellow-400/30">
              <Heart className="w-12 h-12 text-yellow-400" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Join Our Furniture Community
            </h3>
            <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
              Be part of a community that values craftsmanship, comfort, and design.
            </p>
            <button
              onClick={handleShopNowClick}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-12 py-4 rounded-full text-xl font-bold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Explore Furniture
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;