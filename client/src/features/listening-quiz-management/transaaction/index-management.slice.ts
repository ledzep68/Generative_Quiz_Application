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
        currentIndex: z.number().min(0).max(9)
    }).safeParse({
        currentIndex: state.currentIndex
    });
};

export const quiestionIndexManagementSlice = createSlice({
    name: "questionIndexManagement",
    initialState,
    reducers: {
        setCurrentIndex: (state, action: PayloadAction<type.QuestionIndexState>) => {
            const validationResult = validateParams(action.payload);
            if(validationResult.success) {
                state.currentIndex = action.payload.currentIndex
            } else {
                console.error('Invalid currentIndex:', validationResult.error);
            }
        },
        setIsLastQuestion: (state, action: PayloadAction<boolean>) => {
            state.isLastQuestion = action.payload;
        },
        resetIndex: (state) => {
            return initialState;
        } //適切な粒度
    }
});

export const { setCurrentIndex, setIsLastQuestion, resetIndex } = quiestionIndexManagementSlice.actions;