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
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.filters.searchQuery);

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
      !search &&
      !filters.ecoFriendly &&
      filters.assemblyRequired === null &&
      !filters.freeShipping
    );
  };

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
      if (areFiltersEmpty()) {
        setFilteredProducts(products);
        setCurrentPage(1);
        setIsFiltering(false);
        return;
      }

      let filtered = [...products];

      console.log("Applying filters:", filters);
      console.log("Total products before filtering:", filtered.length);

      // Category filter - This is the main fix
      if (filters.category) {
        console.log("Filtering by category:", filters.category);
        filtered = filtered.filter(product => {
          const categoryMatch = product.category && 
            (typeof product.category === 'string' 
              ? product.category === filters.category 
              : product.category._id === filters.category
            );
          console.log(`Product ${product.name}: category=${product.category}, match=${categoryMatch}`);
          return categoryMatch;
        });
        console.log("Products after category filter:", filtered.length);
      }

      // Sub-category filter
      if (filters.subCategory) {
        filtered = filtered.filter(product =>
          product.subCategory && 
          (typeof product.subCategory === 'string' 
            ? product.subCategory === filters.subCategory 
            : product.subCategory._id === filters.subCategory
          )
        );
      }

      // Room type filter
      if (filters.roomType && filters.roomType.length > 0) {
        filtered = filtered.filter(product =>
          product.roomType && 
          Array.isArray(product.roomType) &&
          product.roomType.some(room => filters.roomType.includes(room))
        );
      }

      // Style filter
      if (filters.style && filters.style.length > 0) {
        filtered = filtered.filter(product =>
          product.style && 
          Array.isArray(product.style) &&
          product.style.some(s => filters.style.includes(s))
        );
      }

      // Material filter
      if (filters.material && filters.material.length > 0) {
        filtered = filtered.filter(product =>
          product.material && 
          Array.isArray(product.material) &&
          product.material.some(m => filters.material.includes(m))
        );
      }

      // Color filter
      if (filters.color && filters.color.length > 0) {
        filtered = filtered.filter(product =>
          product.color && 
          Array.isArray(product.color) &&
          product.color.some(c => filters.color.includes(c))
        );
      }

      // Price range filter
      if (filters.priceRange && 
          (filters.priceRange.min > 0 || filters.priceRange.max < 100000)) {
        filtered = filtered.filter(product =>
          product.price >= filters.priceRange.min && 
          product.price <= filters.priceRange.max
        );
      }

      // Boolean filters
      if (filters.ecoFriendly) {
        filtered = filtered.filter(product => product.ecoFriendly === true);
      }

      if (filters.assemblyRequired !== null) {
        filtered = filtered.filter(product => 
          product.assemblyRequired === filters.assemblyRequired
        );
      }

      if (filters.freeShipping) {
        filtered = filtered.filter(product => product.freeShipping === true);
      }

      // Search query
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        filtered = filtered.filter(product => {
          const searchFields = [
            product.name,
            product.description,
            product.shortDescription,
            ...(product.tags || [])
          ].filter(Boolean);
          
          return searchFields.some(field => 
            field.toLowerCase().includes(searchLower)
          );
        });
      }

      console.log("Final filtered products:", filtered.length);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold transition-all duration-800 hover:text-yellow-300 hover:scale-105 cursor-default ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
            Explore Products
            <div className="h-1 bg-gradient-to-r from-[#FFD700] to-transparent mt-2 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
          </h1>

          {/* Debug Info - Remove in production */}
          <div className="text-xs text-gray-500">
            <div>Total: {products.length} | Filtered: {filteredProducts.length}</div>
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