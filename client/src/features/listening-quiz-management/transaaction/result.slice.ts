import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import * as type from "./types.ts";
import * as dto from "./dto.ts";

const initialState: type.ResultScreenState = {
    requestParams: {
        questionHash: undefined,
        reviewTag: undefined
    },

    questionData: undefined
};

export const resultSlice = createSlice({
    name: "resultManagement",
    initialState,
    reducers: {
        setRequestParams: (state, action: PayloadAction<dto.ReviewTagChangeReqDTO>) => {
            console.log('setRequestParams:', action.payload);
            state.requestParams = action.payload;
        
        },
        clearRequestParams: (state) => {
            state.requestParams = undefined;
            state.isValid = false;
            state.validationErrors = [];
        }
    }
});

export const {
    setRequestParams,
    clearRequestParams
} = resultSlice.actions;

export default resultSlice.reducer;
