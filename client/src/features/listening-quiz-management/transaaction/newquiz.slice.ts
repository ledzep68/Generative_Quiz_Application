import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

interface RandomNewQuestionReqDTO {
    sectionNumber :1|2|3|4,
    requestedNumOfLQuizs: number,
    speakingRate?: number
};

// DTOだけでなく、UI状態も含める
interface RandomNewQuestionRequestState extends RandomNewQuestionReqDTO {
  isValid: boolean;           // バリデーション結果
  validationErrors: string[]; // エラーメッセージ
  requestStatus: 'idle' | 'pending' | 'success' | 'failed';
  submittedAt?: number;       // 送信タイムスタンプ
};

const initialState: RandomNewQuestionRequestState = {
    sectionNumber: 2,
    requestedNumOfLQuizs: 1,
    speakingRate?: undefined,

    isValid: false,
    validationErrors: [""],
    requestStatus: 'idle',
    submittedAt?: undefined 
}
//バリデーション
const RequestValidationSchema = z.object({
    sectionNumber: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    requestedNumOfLQuizs: z.number().min(1).max(10),
    speakingRate: z.number().min(0.5).max(2.0).optional()
});

function validateParams (state: RandomNewQuestionRequestState): any {
    try{
        const result = RequestValidationSchema.safeParse({
            sectionNumber: state.sectionNumber,
            requestedNumOfLQuizs: state.requestedNumOfLQuizs,
            speakingRate: state.speakingRate
        });
        state.isValid = true;
        state.validationErrors = [];
        return result
    } catch (error) {
        state.isValid = false;
        state.validationErrors = ["バリデーションエラー"],
    }
};

/*
//ユーザーからの新規クイズリクエストスキーマ（ランダム生成、ID非指定）
export class RandomNewQuestionReqDTO {
    constructor(
        public sectionNumber: 1|2|3|4,
        public requestedNumOfLQuizs?: number,
        public speakingRate?: number //発話速度
    ){}
};
*/
export const newRandomQuestionRequestSlice = createSlice({
    name: "newRandomQuestionRequest",
    initialState,
    reducers: {
        setRequestParams: (state, action: PayloadAction<Partial<RandomNewQuestionReqDTO>>) => {
            //部分更新を許可
            //Partial<RandomNewQuestionReqDTO>を受け取る
            //変更されたフィールドのみ更新
            //更新前に自動バリデーション実行
            //存在するフィールドのみ部分的に更新
            if (action.payload.sectionNumber !== undefined) {
                state.sectionNumber = action.payload.sectionNumber;
            }
            if (action.payload.requestedNumOfLQuizs !== undefined) {
                state.requestedNumOfLQuizs = action.payload.requestedNumOfLQuizs;
            }
            if (action.payload.speakingRate !== undefined) {
                state.speakingRate = action.payload.speakingRate;
            }
            
            //更新後にバリデーション実行
            validateParams(state);
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
        resetRequest: (state) => {
            //完全リセット
            //initialStateに戻す
            //新しいリクエスト開始時に使用
            return initialState;
        }
    }
});

export const { setRequestParams, setRequestStatus, resetRequest } = newRandomQuestionRequestSlice.actions;