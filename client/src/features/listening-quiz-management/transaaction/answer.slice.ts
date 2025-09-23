import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import {UUID} from "crypto";
import * as type from "./types.ts";

//テスト用
const testRequestParams: dto.UserAnswerReqDTO = {
    questionHash: "ca4d7e8f6294",
    //userID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userAnswerOption: [null],
    reviewTag: true,
    answerDate: new Date()
};

const testAnswerData: dto.UserAnswerResDTO = {
    //lQuestionID: "test",
    answerOption: ["A"],
    isCorrectList: [true],
    audioScript: "test",
    jpnAudioScript: "test",
    explanation: "test"
};

const initialState: type.AnswerRequestState = {
    currentSubQuestionIndex: '0',

    requestParams: {
        questionHash: undefined,
        userAnswerOption: undefined,
        reviewTag: false,
        answerDate: undefined
    },

    answerData: undefined,

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

//バリデーション
const RequestValidationSchema = z.object({
    questionHash: z.string(),
    //userID: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) as z.ZodType<UUID>,
    userAnswerOption: z.array(z.enum(["A", "B", "C", "D"]).nullable()),
    reviewTag: z.boolean(),
    answerDate: z.date()
});
const validateParams = (state: type.AnswerRequestState): z.ZodSafeParseResult<dto.UserAnswerReqDTO> => {
    return RequestValidationSchema.safeParse(state.requestParams);
};

export const answerSlice = createSlice({
    name: "answerManagement",
    initialState,
    reducers: {
        //Part3,4 ラジオボタン押下時、小問のindexを更新
        updateSubQuestionIndex: (state, action: PayloadAction<{currentSubQuestionIndex: '0' | '1' | '2'}>) => {
            state.currentSubQuestionIndex = action.payload.currentSubQuestionIndex;
        },
        //Part3,4 小問ごとの回答を更新 Part1 2では不要
        updateSubQuestionAnswer: (state, action: PayloadAction<{
            currentSubQuestionIndex: '0' | '1' | '2';  // 小問のindex (0, 1, 2)
            answer: 'A' | 'B' | 'C' | 'D' | null;  // 回答内容
        }>) => {
            const { currentSubQuestionIndex, answer } = action.payload;
            
            //userAnswerOptionが未初期化の場合は初期化
            if (!state.requestParams?.userAnswerOption) {
                state.requestParams ??= {};
                state.requestParams.userAnswerOption = [null, null, null];
            }
            
            //指定されたindexに回答を設定
            state.requestParams.userAnswerOption[currentSubQuestionIndex] = answer;
            
            //バリデーション実行
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setRequestParams: (state, action: PayloadAction<dto.UserAnswerReqDTO>) => {
            console.log('setRequestParams:', action.payload);
            state.requestParams = action.payload;
            
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        //回答を更新
        updateRequestParam: (state, action: PayloadAction<Partial<dto.UserAnswerReqDTO>>) => {
            state.requestParams = {...state.requestParams, ...action.payload};
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setAnswerData: (state, action: PayloadAction<dto.UserAnswerResDTO>) => { 
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
            state.requestParams = undefined;
            state.isValid = false;
            state.validationErrors = [];
        },
        clearAnswerData: (state) => {
            state.answerData = undefined;
        }
    }
});

export const {
    updateSubQuestionIndex,
    updateSubQuestionAnswer,
    setRequestParams,
    setAnswerData,
    updateRequestParam,
    setRequestStatus,
    clearRequestParams,
    clearAnswerData
} = answerSlice.actions;

export default answerSlice.reducer;
