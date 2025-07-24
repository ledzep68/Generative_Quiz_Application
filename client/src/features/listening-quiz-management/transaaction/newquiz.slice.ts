import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

    // 複数問題のテストデータ配列
const testQuestionDataList: dto.QuestionResDTO[] = [
    {
        lQuestionID: "test-question-001",
        audioScript: "What time does the meeting start tomorrow?",
        jpnAudioScript: "明日の会議は何時に始まりますか？",
        answerOption: "A",
        sectionNumber: 2,
        explanation: "会議の開始時刻に関する問題です。正解はA「9:00 AM」です。",
        speakerAccent: "American",
        speakingRate: 150,
        duration: 12,
        audioURL: "https://example.com/audio/test-001.mp3"
    },
    {
        lQuestionID: "test-question-002", 
        audioScript: "Where should I submit the application form?",
        jpnAudioScript: "申請書はどこに提出すればよいですか？",
        answerOption: "B",
        sectionNumber: 2,
        explanation: "申請書の提出場所に関する問題です。正解はB「Human Resources Department」です。",
        speakerAccent: "British",
        speakingRate: 140,
        duration: 15,
        audioURL: "https://example.com/audio/test-002.mp3"
    }
];

const initialState: type.RandomNewQuestionRequestState = {
    requestParams: {
        sectionNumber: 2,
        requestedNumOfLQuizs: 1,
        speakingRate: undefined,
        speakerAccent: undefined
    },
    questions: testQuestionDataList,//undefined,
    isValid: undefined,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};
/*//サーバーからのクイズレスポンスDTO 新規・既存共通
export interface QuestionResDTO {
    lQuestionID: string,
    audioScript: string,
    jpnAudioScript: string,
    answerOption: "A"|"B"|"C"|"D",
    sectionNumber: 1|2|3|4,
    explanation: string,
    speakerAccent: "American" | "British" | "Canadian" | "Australian",
    speakingRate: number,
    duration: number,
    audioURL: string
}; */

//バリデーション
const RequestValidationSchema = z.object({
    sectionNumber: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    requestedNumOfLQuizs: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10)]),
    speakingRate: z.number().min(0.5).max(2.0).optional(),
    speakerAccent: z.union([z.literal("American"), z.literal("Canadian"), z.literal("British"), z.literal("Australian")]).optional()
});

function validateParams (state: type.RandomNewQuestionRequestState): z.ZodSafeParseResult<dto.RandomNewQuestionReqDTO> {
    return RequestValidationSchema.safeParse({
        sectionNumber: state.requestParams.sectionNumber,
        requestedNumOfLQuizs: state.requestParams.requestedNumOfLQuizs,
        speakingRate: state.requestParams.speakingRate, 
        speakerAccent: state.requestParams.speakerAccent
    });
};

export const newRandomQuestionRequestSlice = createSlice({
    name: "newRandomQuestionRequest",
    initialState,
    reducers: {
        setRequestParams: (state, action: PayloadAction<Partial<dto.RandomNewQuestionReqDTO>>) => {
            //部分更新を許可
            //Partial<RandomNewQuestionReqDTO>を受け取る
            //変更されたフィールドのみ更新
            //更新後に自動バリデーション実行
            //存在するフィールドのみ部分的に更新
            if (action.payload.sectionNumber !== undefined) {
                state.requestParams.sectionNumber = action.payload.sectionNumber;
            }
            if (action.payload.requestedNumOfLQuizs !== undefined) {
                state.requestParams.requestedNumOfLQuizs = action.payload.requestedNumOfLQuizs;
            }
            if (action.payload.speakingRate !== undefined) {
                state.requestParams.speakingRate = action.payload.speakingRate;
            }
            
            //更新後にバリデーション実行
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
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
        setQuestions: (state, action) => {
            state.questions = action.payload;
        },
        resetRequest: (state) => {
            //完全リセット
            //initialStateに戻す
            //新しいリクエスト開始時に使用
            return initialState;
        }
    }
});

export const { setRequestParams, setRequestStatus, setQuestions, resetRequest } = newRandomQuestionRequestSlice.actions;