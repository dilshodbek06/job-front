import {createSlice} from "@reduxjs/toolkit";

const loginSlice = createSlice({
    name: "login",
    initialState: {
        isAuthenticated: false,
        user: null,
        error: null,
        loading: false,
    },
    reducers: {
        loginUserStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            state.loading = false;
        },
        loginFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            window.location.href = "/login";
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },
    },
});


export const {logout, loginSuccess, loginFailure, loginUserStart} = loginSlice.actions;
export default loginSlice.reducer
