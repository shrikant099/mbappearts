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
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [animateFilters, setAnimateFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const productsPerPage = 20;

  // Debounce timer ref to prevent excessive API calls
  const filterTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const loading = useSelector((state) => state.auth.loading);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.filters.searchQuery);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build query parameters for API call
  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', page.toString());
    params.append('limit', productsPerPage.toString());
    
    // Search
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    // Category filters
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.subCategory) {
      params.append('subCategory', filters.subCategory);
    }
    
    // Array filters
    if (filters.roomType && filters.roomType.length > 0) {
      filters.roomType.forEach(room => params.append('roomType', room));
    }
    
    if (filters.style && filters.style.length > 0) {
      filters.style.forEach(style => params.append('style', style));
    }
    
    if (filters.material && filters.material.length > 0) {
      filters.material.forEach(material => params.append('material', material));
    }
    
    if (filters.color && filters.color.length > 0) {
      filters.color.forEach(color => params.append('color', color));
    }
    
    // Price range
    if (filters.priceRange && 
        (filters.priceRange.min > 0 || filters.priceRange.max < 100000)) {
      params.append('minPrice', filters.priceRange.min.toString());
      params.append('maxPrice', filters.priceRange.max.toString());
    }
    
    // Boolean filters
    if (filters.ecoFriendly) {
      params.append('ecoFriendly', 'true');
    }
    
    if (filters.assemblyRequired !== null) {
      params.append('assemblyRequired', filters.assemblyRequired.toString());
    }
    
    if (filters.freeShipping) {
      params.append('freeShipping', 'true');
    }
    
    // Default sorting
    params.append('sort', 'createdAt:desc');
    
    return params.toString();
  };

  const getAllProducts = async (page = 1, showLoadingIndicator = true) => {
    try {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      if (showLoadingIndicator) {
        dispatch(setLoading(true));
      } else {
        setIsFiltering(true);
      }
      
      const queryParams = buildQueryParams(page);
      const url = `${getAllProduct}?${queryParams}`;
      
      console.log("Fetching products with URL:", url);
      
      const res = await apiConnector("GET", url, null, null, null, {
        signal: abortControllerRef.current.signal
      });
      
      console.log("API Response:", res.data);
      
      if (res.data.success) {
        setProducts(res.data.products || []);
        setTotalProducts(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        setCurrentPage(res.data.page || 1);
        
        if (showLoadingIndicator) {
          toast.success(`Loaded ${res.data.products?.length || 0} products!`);
        }
      } else {
        throw new Error(res.data.message || "Failed to fetch products");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request was cancelled");
        return;
      }
      
      console.error("Error fetching products:", error);
      toast.error("Unable to fetch products");
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      dispatch(setLoading(false));
      setIsFiltering(false);
      abortControllerRef.current = null;
    }
  };

  // Initial load
  useEffect(() => {
    getAllProducts(1, true);
    // Initial animations
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setAnimateFilters(true), 300);
    setTimeout(() => setShowProducts(true), 500);
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle page changes
  useEffect(() => {
    if (currentPage > 1) {
      getAllProducts(currentPage, false);
    }
  }, [currentPage]);

  // Check if filters are empty
  const areFiltersEmpty = () => {
    return (
      !filters.category &&
      !filters.subCategory &&
      (!filters.roomType || filters.roomType.length === 0) &&
      (!filters.style || filters.style.length === 0) &&
      (!filters.material || filters.material.length === 0) &&
      (!filters.color || filters.color.length === 0) &&
      (!filters.priceRange || 
        (filters.priceRange.min === 0 && filters.priceRange.max >= 100000)) &&
      !search?.trim() &&
      !filters.ecoFriendly &&
      filters.assemblyRequired === null &&
      !filters.freeShipping
    );
  };

  // Debounced filtering effect - reset to page 1 and fetch new results
  useEffect(() => {
    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set filtering state
    setIsFiltering(true);

    // Debounce the filtering
    filterTimeoutRef.current = setTimeout(() => {
      console.log("Filters changed, fetching new results...");
      setCurrentPage(1); // Reset to first page
      getAllProducts(1, false); // Fetch with new filters
    }, 500); // 500ms debounce delay for filters

    // Cleanup function
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters, search]);

  return (
    <div className="flex flex-col lg:flex-row bg-black text-[#FFD700] min-h-screen">
      {/* Animated Sidebar */}
      <div className={`fixed top-0 left-0 lg:relative z-50 transition-all duration-700 ease-out ${animateFilters ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <ProductSidebar />
      </div>

      {/* Main Content - Products */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Animated Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold transition-all duration-800 hover:text-yellow-300 hover:scale-105 cursor-default ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
            Explore Products
            <div className="h-1 bg-gradient-to-r from-[#FFD700] to-transparent mt-2 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
          </h1>

          {/* Debug Info - Remove in production */}
          <div className="text-xs text-gray-500">
            <div>Total: {totalProducts} | Page: {currentPage}/{totalPages}</div>
            {filters.category && (
              <div>Active Category: {filters.category}</div>
            )}
          </div>
        </div>

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
              {products.map((prod, index) => (
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
            {products.length === 0 && !loading && !isFiltering && (
              <div className="flex flex-col items-center justify-center h-[40vh] transition-all duration-800 translate-y-0 opacity-100">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-2xl font-semibold mb-2 text-yellow-400">No Products Found</div>
                <div className="text-gray-400 text-center max-w-md mb-4">
                  Try adjusting your filters or search terms to find what you're looking for.
                </div>
                {/* Show active filters */}
                {!areFiltersEmpty() && (
                  <div className="text-sm text-gray-500 text-center">
                    <div className="mb-2">Active filters:</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {filters.category && <span className="px-2 py-1 bg-yellow-400/20 rounded">Category</span>}
                      {filters.roomType?.length > 0 && <span className="px-2 py-1 bg-yellow-400/20 rounded">Room Type ({filters.roomType.length})</span>}
                      {filters.style?.length > 0 && <span className="px-2 py-1 bg-yellow-400/20 rounded">Style ({filters.style.length})</span>}
                      {filters.material?.length > 0 && <span className="px-2 py-1 bg-yellow-400/20 rounded">Material ({filters.material.length})</span>}
                      {search && <span className="px-2 py-1 bg-yellow-400/20 rounded">Search: "{search}"</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Server-side Pagination */}
            {totalPages > 1 && !isFiltering && (
              <div className="flex justify-center items-center mt-10 gap-2 flex-wrap transition-all duration-500 translate-y-0 opacity-100">
                {/* Previous Button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 rounded-lg border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
                    disabled={isFiltering}
                  >
                    ←
                  </button>
                )}

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  
                  // Show only a subset of pages for better UX
                  if (totalPages > 7) {
                    if (pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-110 active:scale-95 transform ${
                            isActive
                              ? "bg-[#FFD700] text-black font-bold shadow-lg scale-110 border-[#FFD700]"
                              : "border-[#FFD700] hover:bg-[#FFD700] hover:text-black hover:shadow-lg"
                          }`}
                          disabled={isFiltering}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                      return <span key={i} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-110 active:scale-95 transform ${
                        isActive
                          ? "bg-[#FFD700] text-black font-bold shadow-lg scale-110 border-[#FFD700]"
                          : "border-[#FFD700] hover:bg-[#FFD700] hover:text-black hover:shadow-lg"
                      }`}
                      disabled={isFiltering}
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
                    disabled={isFiltering}
                  >
                    →
                  </button>
                )}
              </div>
            )}

            {/* Product Count Indicator */}
            {!isFiltering && (
              <div className="text-center mt-6 text-gray-400 transition-all duration-500 translate-y-0 opacity-100">
                Showing {products.length} of {totalProducts} products
                {currentPage > 1 && (
                  <span className="text-yellow-400 ml-2">
                    (Page {currentPage} of {totalPages})
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