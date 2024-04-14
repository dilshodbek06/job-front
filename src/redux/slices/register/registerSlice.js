import {createSlice} from "@reduxjs/toolkit";

const registerSlice = createSlice({
    name: "register",
    initialState: {
        user: null,
        error: null,
        loading: false,
    },
    reducers: {
        registerUserStart: (state) => {
            state.loading = true;
        },
        registerSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            state.loading = false;
        },
        registerFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            state.loading = false;
        },
    },
});


export const {registerFailure, registerSuccess, registerUserStart} = registerSlice.actions;
export default registerSlice.reducer
