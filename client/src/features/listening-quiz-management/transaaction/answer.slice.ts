import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const testAnswerData: dto.AnswerResDTO = {
    lQuestionID: "test",
    isCorrect: true,
    audioScript: "test",
    jpnAudioScript: "test",
    explanation: "test"
};

const initialState: type.AnswerRequestState = {
    requestParams: {
        lQuestionID: undefined,
        userID: "test",//undefined,
        userAnswerOption: undefined,
        answerDate: undefined,
        reviewTag: undefined
    },

    answerData: testAnswerData,//undefined,

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

//バリデーション
const RequestValidationSchema = z.object({
    lQuestionID: z.string(),
    userID: z.string(),
    userAnswerOption: z.union([z.literal("A"), z.literal("B"), z.literal("C"), z.literal("D")]),
    answerDate: z.date(),
    reviewTag: z.boolean().optional()
});
const validateParams = (state: type.AnswerRequestState): z.ZodSafeParseResult<dto.AnswerReqDTO> => {
    return RequestValidationSchema.safeParse(state.requestParams);
};

export const answerSlice = createSlice({
    name: "answerManagement",
    initialState,
    reducers: {
        setRequestParams: (state, action: PayloadAction<Partial<dto.AnswerReqDTO>>) => {
            console.log('reducer呼び出し:', action.payload);
            if(action.payload.lQuestionID !== undefined) {
                state.requestParams.lQuestionID = action.payload.lQuestionID;
            };
            if(action.payload.userID !== undefined) {
                state.requestParams.userID = action.payload.userID;
            };
            if(action.payload.userAnswerOption !== undefined) {
                state.requestParams.userAnswerOption = action.payload.userAnswerOption;
            };
            if(action.payload.answerDate !== undefined) {
                state.requestParams.answerDate = action.payload.answerDate;
            };
            if(action.payload.reviewTag !== undefined) {
                state.requestParams.reviewTag = action.payload.reviewTag;
            };
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setAnswerData: (state, action: PayloadAction<dto.AnswerResDTO>) => {
            state.answerData = action.payload;
        },
        setRequestStatus: (state, action: PayloadAction<'idle' | 'pending' | 'success' | 'failed'>) => {
            //送信状態の管理
            //'idle' → 'pending' → 'success'/'failed'の遷移
            //pendingの間はUI側でボタン無効化
            //timestampの記録
            state.requestStatus = action.payload;
            switch (action.payload) {
                case 'idle':
                    state.submittedAt = undefined;
                    break;
                case 'pending':
                    state.submittedAt = Date.now();
                    state.validationErrors = [];
                    break;
                case 'success': 
                    break;
                case 'failed':
                    state.submittedAt = undefined;
                    break;
            }
        }
    }
});

export const {
    setRequestParams,
    setAnswerData,
    setRequestStatus
} = answerSlice.actions;

export default answerSlice.reducer;



//回答データリクエスト
export interface AnswerReqDTO {
    lQuestionID: string, 
    userID: string, 
    userAnswerOption: "A"|"B"|"C"|"D", 
    answerDate: Date,
    reviewTag?: boolean
};

//正誤・解答データレスポンス
export interface AnswerResDTO {
    lQuestionID: string,
    trueOrFalse: boolean,
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
}