import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.CurrentScreenState = {
    currentScreen: 'standby',
    //ローディング表示用
    isLoading: false
};

export const uiSlice = createSlice({
    name: "uiManagement",
    initialState,
    reducers: {
        setCurrentScreen: (state, action: PayloadAction<'standby' | 'answer' | 'result' | 'finalResult' | 'error'>) => {
            state.currentScreen = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        resetUIState: (state) => {
            state.currentScreen = 'standby';
            state.isLoading = false;
        }
    }
});

export const {setCurrentScreen, setIsLoading, resetUIState} = uiSlice.actions;