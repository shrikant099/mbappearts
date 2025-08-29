import React, { useEffect, useState, useRef } from "react";
import { setLoading } from "../../slices/authSlice";
import { apiConnector } from "../../services/apiConnector";
import toast from "react-hot-toast";
import { categoryEndpoints } from "../../services/api";
import { useSelector, useDispatch } from "react-redux";
import { updateFilter, clearFilters } from "../../slices/filterSlice";
import { setIsOpen } from "../../slices/productSlice";
import { MATERIALS } from "../../slices/filterSlice";
import { clearSearchData } from "../../slices/searchSlice";

const { getAllCategory } = categoryEndpoints;

const ProductSidebar = () => {
  const filters = useSelector((state) => state.filters);
  const isOpen = useSelector((state) => state.product.isOpen);
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [isDragging, setIsDragging] = useState({ min: false, max: false });
  const isUpdatingFromRedux = useRef(false);

  // Constants for price range slider
  const MIN_PRICE = 0;
  const MAX_PRICE = 100000;
  const STEP = 1000;
  const MIN_GAP = 5000;

  const getAllCategories = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllCategory);
      setCategories(res.data);
      toast.success("All Categories fetched successfully!");
    } catch {
      toast.error("Unable to fetch categories");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => { getAllCategories(); }, []);

  // Sync price range from Redux
  useEffect(() => {
    if (filters.priceRange && filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
      isUpdatingFromRedux.current = true;
      setPriceRange({
        min: Math.max(MIN_PRICE, Math.min(filters.priceRange.min, MAX_PRICE)),
        max: Math.min(MAX_PRICE, Math.max(filters.priceRange.max, MIN_PRICE))
      });
      setTimeout(() => { isUpdatingFromRedux.current = false; }, 10);
    }
  }, [filters.priceRange]);

  const handleCategoryChange = (categoryId) => {
    dispatch(clearSearchData())
    dispatch(updateFilter({ type: "category", value: categoryId, checked: true }));
  };

  const handleCheckboxChange = (type, value, checked) => {
    dispatch(updateFilter({ type, value, checked }));
  };

  const handleBooleanFilterChange = (type, value) => {
    dispatch(updateFilter({ type, value, checked: true }));
  };

  // Simplified price range handler
  const handlePriceRangeChange = (type, value) => {
    if (isUpdatingFromRedux.current) return;
    
    const numValue = parseInt(value);
    let newMin = priceRange.min;
    let newMax = priceRange.max;
    
    if (type === 'min') {
      newMin = Math.max(MIN_PRICE, Math.min(numValue, priceRange.max - MIN_GAP));
    } else {
      newMax = Math.min(MAX_PRICE, Math.max(numValue, priceRange.min + MIN_GAP));
    }
    
    const newRange = { min: newMin, max: newMax };
    setPriceRange(newRange);
    
    // Debounce the Redux update
    clearTimeout(window.priceUpdateTimeout);
    window.priceUpdateTimeout = setTimeout(() => {
      dispatch(updateFilter({
        type: "priceRange",
        value: newRange
      }));
    }, 100);
  };

  const handleSliderStart = (type) => {
    setIsDragging({ ...isDragging, [type]: true });
  };

  const handleSliderEnd = (type) => {
    setIsDragging({ ...isDragging, [type]: false });
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
  };

  const formatPrice = (price) => {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    else if (price >= 1000) return `₹${(price / 1000).toFixed(0)}k`;
    return `₹${price}`;
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    count += filters.material?.length || 0;
    count += filters.color?.length || 0;
    if (filters.priceRange?.min > MIN_PRICE || filters.priceRange?.max < MAX_PRICE) count++;
    if (filters.ecoFriendly) count++;
    if (filters.assemblyRequired !== null) count++;
    if (filters.freeShipping) count++;
    return count;
  };

  // Calculate positions for visual feedback
  const minPercent = ((priceRange.min - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent = ((priceRange.max - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] lg:hidden"
          onClick={() => dispatch(setIsOpen())}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-black text-[#FFD700] 
          z-[120] transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:z-0 lg:translate-x-0 lg:h-auto`}
        style={{ boxShadow: "0 0 40px rgba(255,215,0,0.08)" }}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4 sticky top-0 bg-black z-10">
            <button
              onClick={() => dispatch(setIsOpen())}
              className="text-[#FFD700] hover:text-white cursor-pointer text-xl font-bold bg-transparent rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#FFD700] hover:bg-opacity-20 transition-all"
            >×</button>
          </div>
          <div className="flex-1 overflow-y-auto hidescroll">
            <div className="p-4 space-y-6">
              {/* Header and Clear All */}
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Filters</h1>
                {activeFilterCount() > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                  >
                    Clear All ({activeFilterCount()})
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h2 className="text-lg font-semibold mb-3 border-b border-[#FFD700] pb-1">Categories</h2>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() => handleCategoryChange(null)}
                      className="mr-2 cursor-pointer accent-[#FFD700]"
                    />
                    <span className="cursor-pointer group-hover:text-yellow-300 transition-colors">
                      All Categories
                    </span>
                  </label>
                  {categories.length > 0 ? (
                    categories.filter((cat) => cat.status === "active").map((cat) => (
                      <label key={cat._id} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={cat._id}
                          checked={filters.category === cat._id}
                          onChange={() => handleCategoryChange(cat._id)}
                          className="mr-2 cursor-pointer accent-[#FFD700]"
                        />
                        <span className="cursor-pointer group-hover:text-yellow-300 transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No categories found</p>
                  )}
                </div>
              </div>

              {/* Price Range - Simplified Version */}
              <div>
                <h2 className="text-lg font-semibold mb-3 border-b border-[#FFD700] pb-1">Price Range</h2>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="bg-[#FFD700] text-black px-2 py-1 rounded font-medium">
                    {formatPrice(priceRange.min)}
                  </span>
                  <span className="text-[#FFD700]">to</span>
                  <span className="bg-[#FFD700] text-black px-2 py-1 rounded font-medium">
                    {formatPrice(priceRange.max)}
                  </span>
                </div>
                
                {/* Slider Container */}
                <div className="relative px-2 py-4 mb-4">
                  {/* Track */}
                  <div className="relative h-2 bg-gray-700 rounded-lg">
                    {/* Active Range */}
                    <div
                      className="absolute h-2 bg-[#FFD700] rounded-lg transition-all duration-150"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`
                      }}
                    />
                  </div>
                  
                  {/* Min Slider
                  <div className="absolute top-0 left-0 right-0 h-full flex items-center">
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={STEP}
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      onMouseDown={() => handleSliderStart('min')}
                      onMouseUp={() => handleSliderEnd('min')}
                      onTouchStart={() => handleSliderStart('min')}
                      onTouchEnd={() => handleSliderEnd('min')}
                      className={`absolute w-full h-full bg-transparent appearance-none cursor-pointer outline-none
                        ${isDragging.min ? 'z-20' : 'z-10'}
                      `}
                      style={{
                        background: 'transparent'
                      }}
                    />
                  </div> */}
                  
                  {/* Max Slider */}
                  <div className="absolute top-0 left-0 right-0 h-full flex items-center">
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={STEP}
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      onMouseDown={() => handleSliderStart('max')}
                      onMouseUp={() => handleSliderEnd('max')}
                      onTouchStart={() => handleSliderStart('max')}
                      onTouchEnd={() => handleSliderEnd('max')}
                      className={`absolute w-full h-full bg-transparent appearance-none cursor-pointer outline-none
                        ${isDragging.max ? 'z-20' : 'z-10'}
                      `}
                      style={{
                        background: 'transparent'
                      }}
                    />
                  </div>
                </div>
                
                {/* Number Inputs */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-[#FFD700] mb-1">Min Price</label>
                    <input
                      type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={STEP}
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-gray-800 text-[#FFD700] border border-gray-600 rounded focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-[#FFD700] mb-1">Max Price</label>
                    <input
                      type="number"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={STEP}
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-gray-800 text-[#FFD700] border border-gray-600 rounded focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                </div>
              </div>

              {/* Material */}
              <FilterCheckboxSection
                title="Material"
                options={MATERIALS}
                values={filters.material}
                type="material"
                handleChange={handleCheckboxChange}
              />

              {/* Additional Filters */}
              <div>
                <h2 className="text-lg font-semibold mb-3 border-b border-[#FFD700] pb-1">Additional Filters</h2>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.ecoFriendly || false}
                      onChange={(e) => handleBooleanFilterChange("ecoFriendly", e.target.checked)}
                      className="mr-2 accent-[#FFD700]"
                    />
                    <span className="cursor-pointer group-hover:text-yellow-300 transition-colors text-sm">
                      Eco-Friendly
                    </span>
                  </label>
                  
                  {/* Assembly Required radio buttons */}
                  <div className="space-y-1">
                    <span className="text-sm text-[#FFD700]">Assembly Required:</span>
                    <div className="flex gap-2">
                      <label className="flex items-center cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="assemblyRequired"
                          checked={filters.assemblyRequired === null}
                          onChange={() => handleBooleanFilterChange("assemblyRequired", null)}
                          className="mr-1 accent-[#FFD700]"
                        />
                        Any
                      </label>
                      <label className="flex items-center cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="assemblyRequired"
                          checked={filters.assemblyRequired === true}
                          onChange={() => handleBooleanFilterChange("assemblyRequired", true)}
                          className="mr-1 accent-[#FFD700]"
                        />
                        Yes
                      </label>
                      <label className="flex items-center cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="assemblyRequired"
                          checked={filters.assemblyRequired === false}
                          onChange={() => handleBooleanFilterChange("assemblyRequired", false)}
                          className="mr-1 accent-[#FFD700]"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  
                  {/* Free Shipping */}
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.freeShipping || false}
                      onChange={(e) => handleBooleanFilterChange("freeShipping", e.target.checked)}
                      className="mr-2 accent-[#FFD700]"
                    />
                    <span className="cursor-pointer group-hover:text-yellow-300 transition-colors text-sm">
                      Free Shipping
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .hidescroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hidescroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

function FilterCheckboxSection({ title, options, values, type, handleChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 border-b border-[#FFD700] pb-1">{title}</h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((item) => (
          <label key={item} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              value={item}
              checked={values?.includes(item) || false}
              onChange={(e) => handleChange(type, item, e.target.checked)}
              className="mr-2 accent-[#FFD700]"
            />
            <span className="cursor-pointer group-hover:text-yellow-300 transition-colors text-sm">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ProductSidebar;