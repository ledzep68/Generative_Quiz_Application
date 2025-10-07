import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.QuestionIndexState = {
    currentIndex: 0,
    isLastQuestion: false,
    
    isValid: undefined,
    validationErrors: []
};
//バリデーション
const validateParams = (state: type.QuestionIndexState) => {
    return z.object({
        currentIndex: z.number().min(0).max(9),
        isLastQuestion: z.boolean()
    }).safeParse({
        currentIndex: state.currentIndex,
        isLastQuestion: state.isLastQuestion
    });
};

export const quiestionIndexManagementSlice = createSlice({
    name: "questionIndexManagement",
    initialState,
    reducers: {
        setCurrentIndex: (state, action: PayloadAction<type.QuestionIndexState>) => {
            const validationResult = validateParams(state);
            if(validationResult.success) {
                state.currentIndex = action.payload.currentIndex,
                state.isLastQuestion = action.payload.isLastQuestion
            } else {
                console.error('Invalid currentIndex:', validationResult.error);
            }
        },
        updateIsLastQuestion: (state, action: PayloadAction<boolean>) => {
            state.isLastQuestion = action.payload;
        },
        resetIndexState: (state) => {
            return initialState;
        } 
    }
});

export const { setCurrentIndex, updateIsLastQuestion, resetIndexState } = quiestionIndexManagementSlice.actions;