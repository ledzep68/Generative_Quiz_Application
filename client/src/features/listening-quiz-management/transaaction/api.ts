import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import * as dto from "./dto.ts"

const newQuizApi = createApi({
    //エンドポイントの共通部分
    baseQuery: fetchBaseQuery({ baseUrl: `http://localhost:3000/api` /*本番環境で切り替え必要　環境変数で設定*/ }),
    //個別API定義
    endpoints: (builder) => ({
        //新規クイズリクエスト
        fetchNewQuestions: builder.mutation<dto.QuestionResDTO[], dto.RandomNewQuestionReqDTO>({
            query: (data) => (
                {
                    url: `/lquiz/new-quiz-generate`, 
                    method: 'POST',
                    body: data
                }
            )
        }),
        //音声データリクエスト
        fetchAudio: builder.query<Blob, string>({
            query: (lQuestionId: string) => (
                {
                    url: `/audio/question/${lQuestionId}?t=${Date.now()}`,
                    method: 'GET',
                    responseHandler: (response) => response.blob()
                }
            )
        }),
        fetchAnswer: builder.mutation<dto.AnswerResDTO, dto.AnswerReqDTO>({
            query: (data) => (
                {
                    url: `/lquiz/answer`,
                    method: 'POST',
                    body: data
                }
            )
        })
    })
});
export const {
    useFetchNewQuestionsMutation,
    useLazyFetchAudioQuery, //手動実行　関数名にLazyと入れるだけで実現
    useFetchAnswerMutation
} = newQuizApi;

/* 
下記理由からLazyを選択
・条件が揃うまで実行したくない
・順次実行したい（問題1→問題2→問題3）
・エラー時のリトライ制御
・タイミングをコントロールしたい
*/

export {newQuizApi};

export default newQuizApi;