import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],
  phoneNumber: null,
  modalOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    handlePhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },

    addToCart: (state, action) => {
      const item = state.products.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity += parseInt(action.payload.quantity);
      } else {
        state.products.push(action.payload);
      }
      localStorage.setItem("cart", JSON.stringify(state.products));
    },
    increaseQuantity: (state, action) => {
      const item = state.products.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity++;
      }
      localStorage.setItem("cart", JSON.stringify(state.products));
    },
    decreaseQuantity: (state, action) => {
      const item = state.products.find(
        (item) => item._id === action.payload.id
      );
      if (item.quantity === 1) {
        item.quantity = 1;
      } else {
        item.quantity--;
      }
      localStorage.setItem("cart", JSON.stringify(state.products));
    },
    deleteItem: (state, action) => {
      state.products = state.products.filter(
        (item) => item.id !== action.payload
      );
      localStorage.setItem("cart", JSON.stringify(state.products));
    },
    resetCart: (state) => {
      state.products = [];
      localStorage.setItem("cart", JSON.stringify(state.products));
    },
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  deleteItem,
  resetCart,
  handlePhoneNumber,
  setModalOpen,
} = cartSlice.actions;
export default cartSlice.reducer;
