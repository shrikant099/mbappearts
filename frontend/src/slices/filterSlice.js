// src/slices/filterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Category filter
  category: null,
  subCategory: null,
  
  // Room type filter - matches Product model enum
  roomType: [],
  
  // Style filter - matches Product model enum
  style: [],
  
  // Material filter - matches Product model enum
  material: [],
  
  // Color filter
  color: [],
  
  // Brand filter
  brand: null,
  
  // Features filter
  features: [],
  
  // Price range filter
  priceRange: {
    min: 0,
    max: 1000000
  },
  
  // Product status filter
  status: 'active',
  
  // Special filters matching Product model
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isOnSale: false,
  
  // Assembly filter
  assemblyRequired: null,
  
  // Sustainability filters
  ecoFriendly: false,
  sustainableMaterials: false,
  
  // Stock availability filter
  inStock: true,
  
  // Dimension filters
  dimensions: {
    minLength: null,
    maxLength: null,
    minWidth: null,
    maxWidth: null,
    minHeight: null,
    maxHeight: null,
    unit: 'cm'
  },
  
  // Weight filter
  weight: {
    min: null,
    max: null
  },
  
  // Rating filter
  minRating: 0,
  
  // Certification filter
  certifications: [],
  
  // Shipping filters
  freeShipping: null,
  
  // Sorting options
  sortBy: 'relevance', // relevance, price-low-high, price-high-low, rating, newest, popular
  
  // Search query
  searchQuery: ''
};

// Room type enum values from Product model
export const ROOM_TYPES = [
  'Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 
  'Bathroom', 'Office', 'Outdoor', 'Entryway', 
  'Kids Room', 'Other'
];

// Style enum values from Product model
export const STYLES = [
  'Modern', 'Contemporary', 'Minimalist', 'Mid-Century',
  'Industrial', 'Traditional', 'Transitional', 'Rustic',
  'Coastal', 'Scandinavian', 'Bohemian', 'Farmhouse',
  'Art Deco', 'Asian', 'Other'
];

// Material enum values from Product model
export const MATERIALS = [
  'Wood', 'Metal', 'Glass', 'Plastic', 'Fabric',
  'Leather', 'Marble', 'Stone', 'Rattan', 'Wicker',
  'Bamboo', 'Other'
];

// Status enum values from Product model
export const PRODUCT_STATUS = ['draft', 'active', 'archived', 'discontinued'];

export const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { type, value, checked } = action.payload;
      
      // Handle price range
      if (type === "priceRange") {
        state.priceRange = { ...state.priceRange, ...value };
        return;
      }
      
      // Handle dimensions
      if (type === "dimensions") {
        state.dimensions = { ...state.dimensions, ...value };
        return;
      }
      
      // Handle weight
      if (type === "weight") {
        state.weight = { ...state.weight, ...value };
        return;
      }
      
      // Handle boolean filters
      if (type === "isFeatured" || type === "isNewArrival" || type === "isBestSeller" || 
          type === "isOnSale" || type === "ecoFriendly" || type === "inStock") {
        state[type] = value;
        return;
      }
      
      // Handle assembly filter (can be true, false, or null)
      if (type === "assemblyRequired") {
        state[type] = value;
        return;
      }
      
      // Handle single value filters
      if (type === "minRating" || type === "sortBy" || type === "searchQuery") {
        state[type] = value;
        return;
      }
      
      // Handle array filters (categories, roomType, style, material, color, etc.)
      if (Array.isArray(state[type])) {
        if (checked) {
          // Add value if not already present
          if (!state[type].includes(value)) {
            state[type].push(value);
          }
        } else {
          // Remove value
          state[type] = state[type].filter(item => item !== value);
        }
      }
    },
    
    // Clear all filters
    clearFilters: () => {
      return initialState;
    },
    
    // Clear specific filter type
    clearFilterType: (state, action) => {
      const { type } = action.payload;
      
      if (type === "priceRange") {
        state.priceRange = initialState.priceRange;
      } else if (type === "dimensions") {
        state.dimensions = initialState.dimensions;
      } else if (type === "weight") {
        state.weight = initialState.weight;
      } else if (Array.isArray(state[type])) {
        state[type] = [];
      } else {
        state[type] = initialState[type];
      }
    },
    
    // Set multiple filters at once
    setMultipleFilters: (state, action) => {
      const filters = action.payload;
      Object.keys(filters).forEach(key => {
        if (key in state) {
          state[key] = filters[key];
        }
      });
    },
    
    // Toggle filter value (for checkboxes)
    toggleFilter: (state, action) => {
      const { type, value } = action.payload;
      
      if (Array.isArray(state[type])) {
        const index = state[type].indexOf(value);
        if (index > -1) {
          state[type].splice(index, 1);
        } else {
          state[type].push(value);
        }
      }
    },
    
    // Remove specific value from filter
    removeFilterValue: (state, action) => {
      const { type, value } = action.payload;
      
      if (Array.isArray(state[type])) {
        state[type] = state[type].filter(item => item !== value);
      }
    }
  }
});

export const { 
  updateFilter, 
  clearFilters, 
  clearFilterType, 
  setMultipleFilters, 
  toggleFilter, 
  removeFilterValue 
} = filterSlice.actions;

export default filterSlice.reducer;

// Selectors for easier access to filter state
export const selectAllFilters = (state) => state.filters;
export const selectActiveFilters = (state) => {
  const filters = state.filters;
  const activeFilters = {};
  
  Object.keys(filters).forEach(key => {
    if (key === 'priceRange') {
      if (filters[key].min > 0 || filters[key].max < 1000000) {
        activeFilters[key] = filters[key];
      }
    } else if (Array.isArray(filters[key]) && filters[key].length > 0) {
      activeFilters[key] = filters[key];
    } else if (typeof filters[key] === 'boolean' && filters[key]) {
      activeFilters[key] = filters[key];
    } else if (key === 'minRating' && filters[key] > 0) {
      activeFilters[key] = filters[key];
    } else if (key === 'searchQuery' && filters[key]) {
      activeFilters[key] = filters[key];
    }
  });
  
  return activeFilters;
};

export const selectFilterCount = (state) => {
  const activeFilters = selectActiveFilters(state);
  let count = 0;
  
  Object.keys(activeFilters).forEach(key => {
    if (Array.isArray(activeFilters[key])) {
      count += activeFilters[key].length;
    } else {
      count += 1;
    }
  });
  
  return count;
};