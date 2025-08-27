import React, { useEffect, useState, useRef } from "react";
import ProductCard from "../components/rest-comp/ProductCard";
import ProductSidebar from "../components/rest-comp/ProductSidebar";
import { productEndpoints } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { setLoading } from "../slices/authSlice";
import { toast } from "react-hot-toast";

const { getAllProduct } = productEndpoints;

const Products = () => {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [animateFilters, setAnimateFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const productsPerPage = 20;

  // Debounce timer ref to prevent excessive filtering
  const filterTimeoutRef = useRef(null);

  const loading = useSelector((state) => state.auth.loading);
  const categories = useSelector((state) => state.filters.categories);
  const gender = useSelector((state) => state.filters.gender);
  const material = useSelector((state) => state.filters.material);
  const color = useSelector((state) => state.filters.color);
  const size = useSelector((state) => state.filters.size);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.filters.searchQuery); // Updated to match filterSlice
  const season = useSelector((state) => state.filters.season);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getAllProducts = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllProduct);
      console.log("these are the products :", res);
      setProducts(res.data.products || []);
      toast.success("Products loaded!");
    } catch {
      toast.error("Unable to fetch products");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllProducts();
    // Initial animations
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setAnimateFilters(true), 300);
    setTimeout(() => setShowProducts(true), 500);
  }, []);

  // Debounced filtering effect
  useEffect(() => {
    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set filtering state
    setIsFiltering(true);

    // Debounce the filtering
    filterTimeoutRef.current = setTimeout(() => {
      const areFiltersEmpty = 
        !filters.category && 
        !filters.subCategory &&
        filters.roomType.length === 0 &&
        filters.style.length === 0 &&
        filters.material.length === 0 &&
        filters.color.length === 0 &&
        (!filters.priceRange || 
          (filters.priceRange.min === 0 && 
           filters.priceRange.max === 1000000)) &&
        !search;

      if (areFiltersEmpty) {
        setFilteredProducts(products);
        setCurrentPage(1);
        setIsFiltering(false);
        return;
      }

      let filtered = [...products];

      // Category filter
      if (filters.category) {
        filtered = filtered.filter(product => 
          product.category?._id === filters.category
        );
      }

      // Sub-category filter
      if (filters.subCategory) {
        filtered = filtered.filter(product => 
          product.subCategory?._id === filters.subCategory
        );
      }

      // Room type filter
      if (filters.roomType.length > 0) {
        filtered = filtered.filter(product =>
          product.roomType.some(room => filters.roomType.includes(room))
        );
      }

      // Style filter
      if (filters.style.length > 0) {
        filtered = filtered.filter(product =>
          product.style.some(s => filters.style.includes(s))
        );
      }

      // Material filter
      if (filters.material.length > 0) {
        filtered = filtered.filter(product =>
          product.material.some(m => filters.material.includes(m))
        );
      }

      // Color filter
      if (filters.color.length > 0) {
        filtered = filtered.filter(product =>
          product.color.some(c => filters.color.includes(c))
        );
      }

      // Price range filter
      if (filters.priceRange) {
        filtered = filtered.filter(product =>
          product.price >= filters.priceRange.min && 
          product.price <= filters.priceRange.max
        );
      }

      // Boolean filters
      if (filters.ecoFriendly) {
        filtered = filtered.filter(product => product.ecoFriendly);
      }

      if (filters.assemblyRequired !== null) {
        filtered = filtered.filter(product => 
          product.assemblyRequired === filters.assemblyRequired
        );
      }

      if (filters.freeShipping) {
        filtered = filtered.filter(product => product.freeShipping);
      }

      // Search query
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      setFilteredProducts(filtered);
      setCurrentPage(1);
      setIsFiltering(false);
    }, 300); // 300ms debounce delay

    // Cleanup function
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [products, filters, search]);

  return (
    <div className="flex flex-col lg:flex-row bg-black text-[#FFD700] min-h-screen">
      {/* Animated Sidebar */}
      <div className={`fixed top-0 left-0 lg:relative z-50 transition-all duration-700 ease-out ${animateFilters ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <ProductSidebar />
      </div>

      {/* Main Content - Products */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Animated Header */}
        <h1 className={`text-2xl font-bold mb-6 transition-all duration-800 hover:text-yellow-300 hover:scale-105 cursor-default ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
          Explore Products
          <div className="h-1 bg-gradient-to-r from-[#FFD700] to-transparent mt-2 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="relative">
              {/* Enhanced Loading Animation */}
              <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-12 h-12 border-4 border-yellow-300/20 border-t-yellow-300 rounded-full animate-spin animate-reverse"></div>
              <div className="absolute top-4 left-4 w-8 h-8 border-4 border-yellow-200/10 border-t-yellow-200 rounded-full animate-spin"></div>
              <div className="mt-4 text-center text-yellow-400 animate-pulse">Loading...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Filtering Indicator */}
            {isFiltering && (
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center space-x-2 bg-yellow-400/10 px-4 py-2 rounded-lg">
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                  <span className="text-yellow-400 text-sm">Filtering products...</span>
                </div>
              </div>
            )}

            {/* Products Grid with Smooth Transition */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
              {paginatedProducts.map((prod, index) => (
                <div
                  key={prod._id}
                  className={`product-card-wrapper transform transition-all duration-500 ease-out ${
                    showProducts && !isFiltering
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-4 opacity-80 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${Math.min(index * 50, 500)}ms`
                  }}
                >
                  <div className="group relative overflow-hidden rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <ProductCard product={prod} />
                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced No Products Message */}
            {filteredProducts.length === 0 && !loading && !isFiltering && (
              <div className="flex flex-col items-center justify-center h-[40vh] transition-all duration-800 translate-y-0 opacity-100">
                <div className="text-6xl mb-4 animate-bounce">😔</div>
                <div className="text-2xl font-semibold mb-2 text-yellow-400">No Products Found</div>
                <div className="text-gray-400 text-center max-w-md">
                  Try adjusting your filters or search terms to find what you're looking for.
                </div>
              </div>
            )}

            {/* Smooth Pagination */}
            {totalPages > 1 && !isFiltering && (
              <div className="flex justify-center items-center mt-10 gap-2 flex-wrap transition-all duration-500 translate-y-0 opacity-100">
                {/* Previous Button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 rounded-lg border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
                  >
                    ←
                  </button>
                )}

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-110 active:scale-95 transform ${
                        isActive
                          ? "bg-[#FFD700] text-black font-bold shadow-lg scale-110 border-[#FFD700]"
                          : "border-[#FFD700] hover:bg-[#FFD700] hover:text-black hover:shadow-lg"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 rounded-lg border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
                  >
                    →
                  </button>
                )}
              </div>
            )}

            {/* Product Count Indicator */}
            {!isFiltering && (
              <div className="text-center mt-6 text-gray-400 transition-all duration-500 translate-y-0 opacity-100">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
                {filteredProducts.length !== products.length && (
                  <span className="text-yellow-400 ml-2">
                    (filtered from {products.length} total)
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Custom Styles for Smooth Animations */}
      <style jsx>{`
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }

        .product-card-wrapper {
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card-wrapper {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;