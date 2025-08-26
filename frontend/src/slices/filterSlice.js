// src/slices/filterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  gender: [],
  material: [],
  color: [],
  size: [],
  season: [],
  priceRange: {
    min: 0,
    max: 10000
  }
};

export const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { type, value, checked } = action.payload;
      
      if (type === "priceRange") {
        state.priceRange = value;
      } else {
        // Handle other filters
        if (checked) {
          state[type].push(value);
        } else {
          state[type] = state[type].filter(item => item !== value);
        }
      }
    },
    clearFilters: () => {
      return initialState;
    }
  }
});

export const { updateFilter, clearFilters } = filterSlice.actions;
export default filterSlice.reducer;
