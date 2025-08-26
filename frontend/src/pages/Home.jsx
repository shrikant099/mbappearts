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

import { reviewEndpoints } from "../services/api";
import { apiConnector } from "../services/apiConnector";

const {topReview} = reviewEndpoints;

// Fixed working belt image and all other images
const categoryImages = {
  shirt:
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=600&fit=crop&q=80",
  belt:
    // Fixed belt image URL
    "https://images.unsplash.com/photo-1664285612706-b32633c95820?q=80&w=958&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  tees:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop&q=80",
  pants:
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=600&fit=crop&q=80",
  perfume:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=600&fit=crop&q=80",
  wallet:
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=600&fit=crop&q=80",
};

const featuredImages = {
  maninsuit:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80",
  maninwinter:
    "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&h=600&fit=crop&q=80",
  maninsweater:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop&q=80",
  forest:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop&q=80",
};

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);

  const [reviews,setReviews] = useState([]);

  const fetchTopReview = async ()=>{
    try{
      const topreview = await apiConnector("GET",topReview);

    console.log("top reviews are : ",topreview)

    const dataReview = topreview?.data?.reviews;

    setReviews(dataReview.slice(0,Math.min(3,dataReview.length)));

    }catch(error){
      console.log("error in finding top reviews : ",error)
    }

    
  }

  // RUN useEffect ONLY ONCE ON MOUNT
  useEffect(() => {
    dispatch(clearFilters());
    setTimeout(() => setIsVisible(true), 100);
    fetchTopReview();
  }, []); // Empty dependency array is critical

  const handleCategoryClick = (category) => {
    dispatch(
      updateFilter({
        type: "categories",
        value: category.filterValue,
        checked: true,
      })
    );
    navigate("/products");
  };

  const handleShopNowClick = () => {
    navigate("/products");
  };

  const handleLearnMoreClick = () => {
    navigate("/about");
  };

  // Memoize category data to prevent recreation
  const categoryData = useMemo(
    () => [
      {
        name: "Shirts",
        image: categoryImages.shirt,
        filterValue: "Shirts",
        key: "shirt",
      },
      {
        name: "Tees",
        image: categoryImages.tees,
        filterValue: "T-Shirts",
        key: "tees",
      },
      {
        name: "Belts",
        image: categoryImages.belt,
        filterValue: "Belt",
        key: "belt",
      },
      {
        name: "Pants",
        image: categoryImages.pants,
        filterValue: "Pants",
        key: "pants",
      },
      {
        name: "Perfumes",
        image: categoryImages.perfume,
        filterValue: "Perfume",
        key: "perfume",
      },
      {
        name: "Wallet",
        image: categoryImages.wallet,
        filterValue: "Wallet",
        key: "wallet",
      },
    ],
    []
  );

  // Memoize featured sections to prevent recreation
  const featuredSections = useMemo(
    () => [
      {
        image: featuredImages.maninsuit,
        title: "New Arrivals",
        buttonText: "Shop the latest",
        icon: Sparkles,
        key: "maninsuit",
        link:'/newarrival'
      },
      {
        image: featuredImages.maninwinter,
        title: "Best Sellers",
        buttonText: "Shop Your Favourites",
        icon: Star,
        key: "maninwinter",
        link:'/featuredproducts'
      },
      {
        image: featuredImages.maninsweater,
        title: "Holiday Outfit",
        buttonText: "Shop Occasion",
        icon: Heart,
        key: "maninsweater",
        link:'/onsale'
      },
    ],
    []
  );

  // Memoize features to prevent recreation
  const features = useMemo(
    () => [
      {
        icon: Package,
        title: "Complimentary Shipping",
        description: "Enjoy free shipping to your doors",
      },
      {
        icon: Recycle,
        title: "Consciously Crafted",
        description: "Designed sustainably for you",
      },
      {
        icon: MapPin,
        title: "Come Say Hi",
        description: "Visit our premium stores",
      },
    ],
    []
  );

  // Memoized ImageWithFallback component to prevent unnecessary re-renders
  const ImageWithFallback = React.memo(
    ({ src, alt, className, imageKey, children }) => {
      const [currentSrc, setCurrentSrc] = useState(src);
      const [hasError, setHasError] = useState(false);
      const [isLoaded, setIsLoaded] = useState(false);

      const handleError = () => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(
            `https://via.placeholder.com/400x600/1f2937/ffffff?text=${encodeURIComponent(
              alt
            )}`
          );
        }
      };

      const handleLoad = () => {
        setIsLoaded(true);
      };

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
      {/* Animated Background Component */}
      <AnimatedBackground />

      {/* Hero Section with Video */}
      <div className="relative min-h-screen overflow-hidden group">
        {/* Video Background */}
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
            <source
              src="https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/8efe297b-b78d-4a43-954a-8b8fbc2ab804.mp4/productVideoOptimized.mp4"
              type="video/mp4"
            />
          </video>
          {/* Fallback Background - only shows if video fails */}
          {!videoPlaying && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
              <div className="absolute inset-0 bg-[url('https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/8efe297b-b78d-4a43-954a-8b8fbc2ab804.mp4/productVideoOptimized.mp4'')] bg-cover bg-center opacity-50" />
            </div>
          )}
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/15 z-10" />
        </div>

        {/* Content */}
        <div
          className={`relative z-20 flex items-center justify-start pl-6 lg:pl-16 min-h-screen transition-all duration-1200 ease-out ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <div className="max-w-2xl">
            <div
              className={`text-4xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-pulse transition-all duration-1200 delay-300 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              Your Cozy Era
            </div>
            <div
              className={`text-lg lg:text-2xl mb-8 text-white drop-shadow-2xl transition-all duration-1200 delay-500 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              Get peak comfy check <br />
              with new winter essentials.
            </div>
            <button
              onClick={handleShopNowClick}
              className={`group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 lg:px-12 py-3 lg:py-4 rounded-full text-lg lg:text-xl font-bold shadow-2xl transition-all duration-500 ease-out hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              <span className="flex items-center gap-3">
                SHOP NOW
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 ease-out group-hover:translate-x-2" />
              </span>
            </button>
          </div>
        </div>

        {/* Video Control Indicator */}
        <div className="absolute top-8 right-8 z-30">
          <div
            className={`flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30 transition-all duration-300 ${
              videoPlaying ? "opacity-100" : "opacity-70"
            }`}
          >
            <Play
              className={`w-4 h-4 text-yellow-400 ${
                videoPlaying ? "animate-pulse" : ""
              }`}
            />
            <span className="text-yellow-400 text-sm font-medium">
              {videoPlaying ? "Live" : "Fallback"}
            </span>
          </div>
        </div>
      </div>

      {/* Shop By Category Section */}
      <div className="py-16 lg:py-24 px-6 relative bg-gradient-to-b from-black to-gray-900">
        <div
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Shop By Category
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 max-w-7xl mx-auto">
          {categoryData.map((category, index) => (
            <div
              key={category.key} // Use stable key
              className={`group cursor-pointer transition-all duration-700 ease-out hover:scale-110 hover:-translate-y-6 hover:shadow-2xl hover:shadow-yellow-400/25 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${800 + index * 150}ms` }}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-2xl hover:shadow-yellow-400/50 transition-all duration-700 ease-out">
                {/* Image Container */}
                <div className="relative bg-black rounded-3xl overflow-hidden aspect-[3/4]">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    imageKey={category.key}
                    className="w-full h-full"
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform -skew-x-12 group-hover:translate-x-full" />
                  </ImageWithFallback>
                </div>

                {/* Category Name */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center transition-all duration-500 ease-out group-hover:scale-105">
                  <h3 className="text-white font-bold text-lg lg:text-xl drop-shadow-2xl group-hover:text-yellow-300 transition-all duration-500 ease-out">
                    {category.name}
                  </h3>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/0 group-hover:border-yellow-400/60 transition-all duration-700 ease-out" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Sections */}
      <div className="py-16 lg:py-24 px-6 bg-gradient-to-b from-gray-900 to-black relative">
        <div
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
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
                key={section.key} // Use stable key
                className={`group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-yellow-400/30 transition-all duration-800 ease-out hover:scale-105 hover:-translate-y-4 cursor-pointer ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${1200 + index * 200}ms` }}
                onClick={()=>navigate(section.link)}
              >
                {/* Image */}
                <div className="relative h-80 lg:h-96 overflow-hidden">
                  <ImageWithFallback
                    src={section.image}
                    alt={section.title}
                    imageKey={section.key}
                    className="w-full h-full"
                  >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-700 ease-out" />
                    {/* Gold Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out transform -skew-x-12 group-hover:translate-x-full" />
                  </ImageWithFallback>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transform transition-all duration-700 ease-out group-hover:-translate-y-2">
                  {/* Icon */}
                  <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center transform transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-yellow-400/50">
                    <IconComponent className="w-8 h-8 text-black transition-all duration-500 ease-out" />
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white group-hover:text-yellow-300 transition-all duration-500 ease-out drop-shadow-2xl group-hover:scale-105">
                    {section.title}
                  </h3>

                  <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-3 rounded-full font-bold transition-all duration-500 ease-out hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-yellow-400/30">
                    {section.buttonText}
                  </button>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/0 group-hover:border-yellow-400/60 transition-all duration-700 ease-out" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Section with Forest Image */}
      <div
        className={`relative py-20 lg:py-32 px-6 overflow-hidden transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
        style={{ transitionDelay: "1800ms" }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={featuredImages.forest}
            alt="Forest background"
            imageKey="forest"
            className="w-full h-full"
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Gold Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-600/20" />
          </ImageWithFallback>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-block p-4 bg-yellow-400/20 backdrop-blur-sm rounded-full mb-8 animate-pulse border border-yellow-400/30">
            <Zap className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white drop-shadow-2xl">
            We are on a mission to clean up the industry
          </h2>
          <p className="text-xl lg:text-2xl text-yellow-200 mb-8 drop-shadow-lg">
            Read about us
          </p>
          <button
            onClick={handleLearnMoreClick}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-12 py-4 rounded-full text-xl font-bold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer"
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
                className={`group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400 transition-all duration-700 hover:scale-105 hover:-translate-y-4 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${2000 + index * 200}ms` }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                <div className="relative z-10">
                  <div className="w-20 lg:w-24 h-20 lg:h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
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

      {/* Premium Stats & Testimonials Section */}
      <div
        className={`py-16 lg:py-24 px-6 bg-gradient-to-br from-yellow-900 via-yellow-800 to-black relative overflow-hidden transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
        style={{ transitionDelay: "2400ms" }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-400/5 rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400/10 rounded-full animate-bounce delay-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white drop-shadow-2xl">
              Trusted by Thousands
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full animate-pulse mb-12" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "50K+", label: "Happy Customers", icon: "😊" },
                { number: "25K+", label: "Products Sold", icon: "🛍️" },
                { number: "100+", label: "Premium Brands", icon: "⭐" },
                { number: "99%", label: "Satisfaction Rate", icon: "❤️" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group bg-black/30 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                >
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
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <img src={testimonial.user.image} className="h-[40px] w-[40px] rounded-full"  alt="😊" />
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-lg">
                      {testimonial.user.name}
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
              Join Our Fashion Community
            </h3>
            <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
              Be part of a community that values style, quality, and
              sustainability
            </p>
            <button
              onClick={handleShopNowClick}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-12 py-4 rounded-full text-xl font-bold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-yellow-400/50 active:scale-95 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Explore Collection
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
