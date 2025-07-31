import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import {UUID} from "crypto";
import * as type from "./types.ts";

const testRequestParams: dto.UserAnswerReqDTO[] = [{
    lQuestionID: "",
    userID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userAnswerOption: undefined,
    reviewTag: false,
    answerDate: undefined
}];

const testAnswerData: dto.UserAnswerResDTO[] = [{
    //lQuestionID: "test",
    answerOption: "A",
    isCorrect: true,
    audioScript: "test",
    jpnAudioScript: "test",
    explanation: "test"
}];

const initialState: type.AnswerRequestState = {
    requestParams: testRequestParams,

    answerData: [],

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

//バリデーション
const RequestValidationSchema = z.array(z.object({
    lQuestionID: z.string(),
    userID: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) as z.ZodType<UUID>,
    userAnswerOption: z.union([z.literal("A"), z.literal("B"), z.literal("C"), z.literal("D")]),
    reviewTag: z.boolean(),
    answerDate: z.date()
}));
const validateParams = (state: type.AnswerRequestState): z.ZodSafeParseResult<dto.UserAnswerReqDTO[]> => {
    return RequestValidationSchema.safeParse(state.requestParams);
};

export const answerSlice = createSlice({
    name: "answerManagement",
    initialState,
    reducers: {
        setRequestParams: (state, action: PayloadAction<dto.UserAnswerReqDTO[]>) => {
            console.log('setRequestParams:', action.payload);
            state.requestParams = action.payload;
            
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        //特定インデックスの回答を更新
        updateRequestParam: (state, action: PayloadAction<{index: number, data: Partial<dto.UserAnswerReqDTO>}>) => {
            const { index, data } = action.payload;
            if (!state.requestParams) {
                state.requestParams = [];
            };
            if (state.requestParams[index]) {
                state.requestParams[index] = { ...state.requestParams[index], ...data };
                const validationResult = validateParams(state);
                state.isValid = validationResult.success;
                state.validationErrors = validationResult.success 
                    ? [] 
                    : validationResult.error.issues.map((issue) => issue.message);
            };
        },
        setAnswerData: (state, action: PayloadAction<dto.UserAnswerResDTO[]>) => { 
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
        },
        clearRequestParams: (state) => {
            state.requestParams = [];
            state.isValid = false;
            state.validationErrors = [];
        },
        clearAnswerData: (state) => {
            state.answerData = [];
        }
    }
});

export const {
    setRequestParams,
    setAnswerData,
    updateRequestParam,
    setRequestStatus,
    clearRequestParams,
    clearAnswerData
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