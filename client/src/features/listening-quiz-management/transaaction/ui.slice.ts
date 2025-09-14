import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.CurrentScreenState = {
    currentScreen: 'standby'
};

export const uiSlice = createSlice({
    name: "uiManagement",
    initialState,
    reducers: {
        setCurrentScreen: (state, action: PayloadAction<'standby' | 'answer' | 'result'>) => {
            state.currentScreen = action.payload;
        }
    }
});

export const {setCurrentScreen} = uiSlice.actions;