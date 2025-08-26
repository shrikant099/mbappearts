import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchData: ''
};

const searchSlice = createSlice({
  name: "search",
  initialState: initialState,
  reducers: {
    setSearchData(state, value) {
      state.searchData = value.payload;
    },
  },
});

export const { setSearchData } = searchSlice.actions;

export default searchSlice.reducer;