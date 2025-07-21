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

function validateParams (state: type.AudioRequestState): any {
    try{
        const result = RequestValidationSchema.safeParse({
            lQuestionId: state.requestParams.currentLQuestionId
        });
        state.isValid = true;
        state.validationErrors = [];
        return result
    } catch (error) {
        state.isValid = false;
        state.validationErrors = ["バリデーションエラー"]
    }
};

export const audioRequestSlice = createSlice({
    name: "audioRequest",
    initialState,
    reducers: {
        setAudioRequest: (state, action: PayloadAction<string>) => {
            state.requestParams.currentLQuestionId = action.payload;
            state.submittedAt = Date.now();
            validateParams(state);
        },
        //音声データ受信
        setAudioData: (state, action: PayloadAction<Blob>) => {
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
        //リセット（次の問題用）
        resetAudioState: (state) => {
            return { ...initialState };
        }
    }
});

export const {setAudioRequest, setAudioData, setRequestStatus, setAudioError, resetAudioState} = audioRequestSlice.actions