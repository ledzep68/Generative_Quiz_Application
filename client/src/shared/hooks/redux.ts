import { configureStore } from '@reduxjs/toolkit';
import { loginSlice } from '../features/user-management/login/login.slice';


export const store = configureStore({
    reducer: {
        login: loginSlice.reducer
    }
});