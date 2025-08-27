import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchQuery: '',
};

const searchSlice = createSlice({
  name: "search",
  initialState: initialState,
  reducers: {
    setSearchData(state, action) {
      state.searchQuery = action.payload;
    },
    clearSearchData(state) {
      state.searchQuery = '';
    },
  },
});

export const { setSearchData, clearSearchData } = searchSlice.actions;

export default searchSlice.reducer;