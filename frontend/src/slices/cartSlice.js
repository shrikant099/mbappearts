import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
  cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],
  total: localStorage.getItem("total")
    ? JSON.parse(localStorage.getItem("total"))
    : 0,
  totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cart.find((item) => item._id === newItem._id);

      if (existingItem) {
        existingItem.quantity += 1;
        toast.success("Increased quantity");
        state.totalItems += 1;
        state.total += newItem.price * 1;
      } else {
        state.cart.push({ ...newItem, quantity: newItem.quantity || 1 });
        toast.success("Item added to cart");
        state.totalItems += newItem.quantity || 1;
        state.total += newItem.price * (newItem.quantity || 1);
      }

      localStorage.setItem("cart", JSON.stringify(state.cart));
      localStorage.setItem("total", JSON.stringify(state.total));
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
    },

    decreaseItemQuantity: (state, action) => {
      const cartItem = action.payload;
      const item = state.cart.find((item) => item._id === cartItem._id);

      if (!item) {
        toast.error("Item not found in cart");
        return;
      }

      if (item.quantity > 1) {
        item.quantity -= 1;
        state.totalItems -= 1;
        state.total -= item.price;
        toast.success("Decreased quantity");
      } else {
        toast.error("Minimum quantity is 1");
      }

      localStorage.setItem("cart", JSON.stringify(state.cart));
      localStorage.setItem("total", JSON.stringify(state.total));
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
    },

   removeFromCart: (state, action) => {
  const cartItem = action.payload;
  const index = state.cart.findIndex((item) => item._id === cartItem._id);

  if (index === -1) {
    toast.error("Item not found in cart");
    return;
  }

  const item = state.cart[index];
  state.totalItems -= item.quantity;
  state.total -= item.price * item.quantity;
  state.cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(state.cart));
  localStorage.setItem("total", JSON.stringify(state.total));
  localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
  toast.success("Item removed from cart");
},

    resetCart: (state) => {
      state.cart = [];
      state.total = 0;
      state.totalItems = 0;
      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("totalItems");
    },
  },
});

export const { addToCart, decreaseItemQuantity, removeFromCart, resetCart } =
  cartSlice.actions;

export default cartSlice.reducer;
