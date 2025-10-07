import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import * as type from "./types.ts";
import { set } from "zod";

const testAnswerResultList = [true, false, true, true, true, false, true, false, true];

const initialState: type.FinalResultScreenState = {
    answerResultList: [],
};

export const finalResultSlice = createSlice({
    name: "finalResultManagement",
    initialState,
    reducers: {
        // Redux Toolkit slice内のreducer関数
        setAnswerResultList: (state, action: PayloadAction<{
            sectionNumber: 1 | 2 | 3 | 4;
            currentIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
            isCorrectList: boolean[];
        }>) => {
            const { sectionNumber, currentIndex, isCorrectList } = action.payload;
            
            //Part1,2の場合
            if (sectionNumber === 1 || sectionNumber === 2) {
                //配列が十分な長さでない場合は拡張
                while (state.answerResultList.length <= currentIndex) {
                    state.answerResultList.push(false); // またはnull
                }
                //currentIndexに対応する要素にisCorrectListの最初の要素を設定
                state.answerResultList[currentIndex] = isCorrectList[0];
                
            //Part3,4の場合
            } else if (sectionNumber === 3 || sectionNumber === 4) {
                const startIndex = currentIndex * 3;
                //currentIndex*3から始まる3つの要素にisCorrectListの内容を設定
                state.answerResultList[startIndex] = isCorrectList[0];
                state.answerResultList[startIndex + 1] = isCorrectList[1];
                state.answerResultList[startIndex + 2] = isCorrectList[2];
            }
        },
        resetFinalResultState: (state) => {
            state.answerResultList = [];
        }
    }
});

export const { setAnswerResultList, resetFinalResultState } = finalResultSlice.actions;

export default finalResultSlice.reducer;
