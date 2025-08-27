import React, { useEffect, useState, useRef } from "react";
import { setLoading } from "../../slices/authSlice";
import { apiConnector } from "../../services/apiConnector";
import toast from "react-hot-toast";
import { categoryEndpoints } from "../../services/api";
import { useSelector, useDispatch } from "react-redux";
import { updateFilter } from "../../slices/filterSlice";
import { setIsOpen } from "../../slices/productSlice";
import { ROOM_TYPES, STYLES, MATERIALS } from "../../slices/filterSlice";

const { getAllCategory } = categoryEndpoints;

const ProductSidebar = () => {
  const filters = useSelector((state) => state.filters);
  const isOpen = useSelector((state) => state.product.isOpen);

  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 100000
  });
  
  // Add ref to track if we're updating from Redux
  const isUpdatingFromRedux = useRef(false);
  
  // Constants for price range slider - Updated for furniture pricing
  const MIN_PRICE = 0;
  const MAX_PRICE = 100000;
  const STEP = 1000;

  const dispatch = useDispatch();

  const getAllCategories = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllCategory);
      setCategories(res.data);
      toast.success("All Categories fetched successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Unable to fetch categories");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  // Initialize price range from filters only once on mount
  useEffect(() => {
    if (filters.priceRange && filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
      isUpdatingFromRedux.current = true;
      setPriceRange({
        min: filters.priceRange.min,
        max: filters.priceRange.max
      });
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingFromRedux.current = false;
      }, 10);
    }
  }, []); // Only run on mount

  const handleCheckboxChange = (type, value, checked) => {
    if (type === "category") {
      // For category, we want to set the value directly when checked
      // and clear it when unchecked
      dispatch(updateFilter({ 
        type,
        value: checked ? value : null,
        checked: true // Always true for radio buttons
      }));
    } else {
      // For array-based filters (roomType, material, style, etc.)
      dispatch(updateFilter({ type, value, checked }));
    }
  };

  const handlePriceRangeChange = (type, value) => {
    // Don't update if we're currently updating from Redux
    if (isUpdatingFromRedux.current) return;
    
    const numValue = parseInt(value);
    let newRange = { ...priceRange };

    // Update the specific value (min or max)
    if (type === 'min') {
      // Ensure min doesn't exceed max
      newRange.min = Math.min(numValue, priceRange.max);
    } else {
      // Ensure max doesn't go below min
      newRange.max = Math.max(numValue, priceRange.min);
    }

    // Update local state immediately for responsive UI
    setPriceRange(newRange);

    // Debounced dispatch to Redux
    dispatch(updateFilter({
      type: 'priceRange',
      value: {
        min: newRange.min,
        max: newRange.max
      },
      checked: true
    }));
  };

  const formatPrice = (price) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}k`;
    }
    return `₹${price}`;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[70] lg:hidden"
          onClick={() => dispatch(setIsOpen())}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-[80] lg:relative hidescroll lg:z-0 h-screen w-64 bg-black text-[#FFD700] transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto shadow-lg`}
      >
        {/* Close button on mobile */}
        <div className="lg:hidden flex justify-end p-4 sticky top-0 bg-black">
          <button
            onClick={() => dispatch(setIsOpen())}
            className="text-[#FFD700] hover:text-white cursor-pointer text-xl font-bold bg-transparent rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#FFD700] hover:bg-opacity-20 transition-all"
          >
            ×
          </button>
        </div>

        {/* Navigation & Filters */}
        <div className="p-4 space-y-6">
          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            {categories.length > 0 ? (
              categories.filter((cat) => cat.status === "active").map((cat) => (
                <label key={cat._id} className="flex items-center mb-1 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat._id}
                    checked={filters.category === cat._id}
                    onChange={(e) => handleCheckboxChange("category", cat._id, true)}
                    className="mr-2 cursor-pointer"
                  />
                  <span className="cursor-pointer">{cat.name}</span>
                </label>
              ))
            ) : (
              <p>No categories found</p>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Price Range</h2>
            
            {/* Price Display */}
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="bg-[#FFD700] text-black px-2 py-1 rounded font-medium">
                {formatPrice(priceRange.min)}
              </span>
              <span className="text-[#FFD700]">to</span>
              <span className="bg-[#FFD700] text-black px-2 py-1 rounded font-medium">
                {formatPrice(priceRange.max)}
              </span>
            </div>

            {/* Dual Range Slider Container */}
            <div className="relative mb-4 py-2">
              {/* Track */}
              <div className="h-2 bg-gray-700 rounded-lg relative mx-2">
                {/* Active range highlight */}
                <div 
                  className="absolute h-2 bg-[#FFD700] rounded-lg"
                  style={{
                    left: `${(priceRange.min / MAX_PRICE) * 100}%`,
                    width: `${((priceRange.max - priceRange.min) / MAX_PRICE) * 100}%`
                  }}
                />
              </div>

              {/* Min Range Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={STEP}
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="absolute top-[-9px] left-0 w-full h-6 appearance-none bg-transparent cursor-grab active:cursor-grabbing slider-thumb"
                style={{ 
                  zIndex: priceRange.min > MAX_PRICE - 10000 ? 2 : 1,
                  pointerEvents: 'all'
                }}
              />

              {/* Max Range Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={STEP}
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="absolute top-[-9px] left-0 w-full h-6 appearance-none bg-transparent cursor-grab active:cursor-grabbing slider-thumb"
                style={{ 
                  zIndex: priceRange.max < 10000 ? 2 : 1,
                  pointerEvents: 'all'
                }}
              />
            </div>

            {/* Input Fields for Manual Entry */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1">
                <label className="block text-xs text-[#FFD700] mb-1">Min</label>
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
                <label className="block text-xs text-[#FFD700] mb-1">Max</label>
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

          {/* Room Type */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Room Type</h2>
            {ROOM_TYPES.map((room) => (
              <label key={room} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={room}
                  checked={filters.roomType?.includes(room) || false}
                  onChange={(e) =>
                    handleCheckboxChange("roomType", room, e.target.checked)
                  }
                  className="mr-2"
                />
                {room}
              </label>
            ))}
          </div>

          {/* Material */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Material</h2>
            {MATERIALS.map((material) => (
              <label key={material} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={material}
                  checked={filters.material?.includes(material) || false}
                  onChange={(e) =>
                    handleCheckboxChange("material", material, e.target.checked)
                  }
                  className="mr-2"
                />
                {material}
              </label>
            ))}
          </div>

          {/* Style */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Style</h2>
            {STYLES.map((style) => (
              <label key={style} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={style}
                  checked={filters.style?.includes(style) || false}
                  onChange={(e) =>
                    handleCheckboxChange("style", style, e.target.checked)
                  }
                  className="mr-2"
                />
                {style}
              </label>
            ))}
          </div>

          {/* Additional Filters */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Additional Filters</h2>
            <label className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={filters.ecoFriendly || false}
                onChange={(e) =>
                  handleCheckboxChange("ecoFriendly", e.target.checked, e.target.checked)
                }
                className="mr-2"
              />
              Eco-Friendly
            </label>
            <label className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={filters.assemblyRequired || false}
                onChange={(e) =>
                  handleCheckboxChange("assemblyRequired", e.target.checked, e.target.checked)
                }
                className="mr-2"
              />
              Assembly Required
            </label>
            
          </div>
        </div>
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider-thumb {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: transparent;
          cursor: grab;
          touch-action: pan-x;
        }
        
        .slider-thumb:active {
          cursor: grabbing;
        }
        
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #FFD700;
          cursor: grab;
          border: 3px solid #000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: all 0.15s ease;
          position: relative;
        }
        
        .slider-thumb:active::-webkit-slider-thumb {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #FFD700;
          cursor: grab;
          border: 3px solid #000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: all 0.15s ease;
          -moz-appearance: none;
          appearance: none;
        }
        
        .slider-thumb:active::-moz-range-thumb {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
        }
        
        .slider-thumb:focus {
          outline: none;
        }
        
        .slider-thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.4);
        }
        
        .slider-thumb:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.4);
        }
        
        .slider-thumb:hover::-webkit-slider-thumb {
          background: #FFF700;
          transform: scale(1.05);
        }
        
        .slider-thumb:hover::-moz-range-thumb {
          background: #FFF700;
          transform: scale(1.05);
        }
        
        /* Track styling for better interaction */
        .slider-thumb::-webkit-slider-runnable-track {
          background: transparent;
          height: 2px;
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
          height: 2px;
          border: none;
        }
        
        /* Ensure proper touch handling on mobile */
        @media (max-width: 768px) {
          .slider-thumb::-webkit-slider-thumb {
            height: 24px;
            width: 24px;
          }
          
          .slider-thumb::-moz-range-thumb {
            height: 24px;
            width: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default ProductSidebar;
