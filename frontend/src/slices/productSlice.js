import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productData: localStorage.getItem('product') ? JSON.parse(localStorage.getItem("product")) : null,
  isOpen : false,
};

const productSlice = createSlice({
  name: "product",
  initialState: initialState,
  reducers: {
    setProductData(state, value) {
      state.productData = value.payload;
      localStorage.setItem("product", JSON.stringify(state.productData))
    },
    setIsOpen(state){
      state.isOpen = !state.isOpen;
    }
  },
});

export const { setProductData, setIsOpen } = productSlice.actions;

export default productSlice.reducer;