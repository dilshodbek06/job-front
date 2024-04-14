import { combineReducers } from "@reduxjs/toolkit";
import loginSlice from "./login/loginSlice.js";
import registerSlice from "./register/registerSlice.js";
import cartSlice from "./cart/cartSlice.js";

const rootReducer = combineReducers({
  login: loginSlice,
  register: registerSlice,
  cart: cartSlice,
});

export default rootReducer;
