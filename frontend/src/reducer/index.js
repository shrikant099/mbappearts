import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import cartReducer from "../slices/cartSlice"
import searchReducer from "../slices/searchSlice"
import filterReducer from "../slices/filterSlice"
import productReducer from "../slices/productSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  search: searchReducer,
  filters: filterReducer,
  product: productReducer,
})

export default rootReducer