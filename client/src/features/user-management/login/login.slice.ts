import {createSlice} from "@reduxjs/toolkit";

interface User {
    id: string,
    name: string
}

const initialState: User = {
    id: "",
    name: ""
}

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        login: (state, action) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
        },
        logout: (state) => {
            state.id = "";
            state.name = "";
        }
    }
})