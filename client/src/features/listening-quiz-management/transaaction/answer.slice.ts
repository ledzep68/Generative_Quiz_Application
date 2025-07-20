import {createSlice} from "@reduxjs/toolkit";

interface RandomNewQuestionReqDTO {
    sectionNumber :1|2|3|4,
    requestedNumOfLQuizs: number,
    speakingRate: number
}

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
export const transactionSlice = createSlice({
    name: "randomNewQuestion",
    initialState,
    reducers: {
        : (state, action) => {
            state. = action.payload.id;
            state.name = action.payload.name;
        }
    }
})