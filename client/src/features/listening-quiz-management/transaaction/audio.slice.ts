import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.AudioRequestState = {
    requestParams: {
        currentLQuestionId: undefined
    },

    audioData: undefined,

    isValid: undefined,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

//バリデーション
const RequestValidationSchema = z.object({
    lQuestionId: z.string()
});

function validateParams (state: type.AudioRequestState): z.ZodSafeParseResult<{ lQuestionId: string; }> {
    return RequestValidationSchema.safeParse({
        lQuestionId: state.requestParams.currentLQuestionId
    });
};

export const audioRequestSlice = createSlice({
    name: "audioRequest",
    initialState,
    reducers: {
        setAudioRequest: (state, action: PayloadAction<string>) => {
            state.requestParams.currentLQuestionId = action.payload;
            state.submittedAt = Date.now();
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        //音声データ受信
        setAudioData: (state, action: PayloadAction<File>) => {
            state.audioData = action.payload;
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
        //エラー処理
        setAudioError: (state, action: PayloadAction<string>) => {
            state.validationErrors = [action.payload];
        },
        //音声データ解放
        clearAudioData: (state) => {
            state.audioData = undefined;
        },
        //リセット（次の問題用）
        resetAudioState: (state) => {
            return { ...initialState };
        }
    }
});

export const {setAudioRequest, setAudioData, setRequestStatus, setAudioError, clearAudioData, resetAudioState} = audioRequestSlice.actions