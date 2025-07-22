import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.QuestionIndexState = {
    lQuestionIdList: [],
    currentQuestionIndex: 0,
    isLastQuestion: false,
    isValid: undefined,
    validationErrors: []
};
//バリデーション
const RequestValidationSchema = z.object({
    lQuestionIDList: z.array(z.string()),
    currentQuestionIndex: z.number().min(0).max(9)
});
function validateParams (state: type.QuestionIndexState): z.ZodSafeParseResult<{ lQuestionIDList: string[]; currentQuestionIndex: number; }> {
    return RequestValidationSchema.safeParse({
        lQuestionIdList: state.lQuestionIdList,
        currentQuestionIndex: state.currentQuestionIndex
    });
};

export const quiestionIndexManagementSlice = createSlice({
    name: "questionIndexManagement",
    initialState,
    reducers: {
        setLQuestionIdList: (state, action: PayloadAction<string[]>) => {
            if (action.payload !== undefined) {
                state.lQuestionIdList = action.payload;
            };
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setCurrentIndex: (state, action: PayloadAction<0|1|2|3|4|5|6|7|8|9>) => {
            state.currentQuestionIndex = action.payload;
        },
        setIsLastQuestion: (state, action: PayloadAction<boolean>) => {
            state.isLastQuestion = action.payload;
        },
        resetIndex: (state) => {
            return initialState;
        } //適切な粒度
    }
});

export const { setLQuestionIdList, setCurrentIndex, setIsLastQuestion, resetIndex } = quiestionIndexManagementSlice.actions;