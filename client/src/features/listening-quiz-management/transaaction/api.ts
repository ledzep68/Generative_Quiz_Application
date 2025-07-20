import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import * as dto from "./dto.ts"

export const newQuizApi = createApi({
    //エンドポイントの共通部分
    baseQuery: fetchBaseQuery({ baseUrl: 'api/server' }),
    //個別API定義
    endpoints: (builder) => ({
        //新規クイズリクエスト
        fetchNewQuestions: builder.mutation<dto.QuestionResDTO[], dto.RandomNewQuestionReqDTO>({
            query: (data) => (
                {
                    url: '/lquiz/new-quiz-generate', 
                    method: 'POST',
                    body: data
                }
            )
        }),
        //音声データリクエスト
        fetchAudio: builder.query<Blob, string>({
            query: (lQuestionId: string) => (
                {
                    url: '/audio//question/${lQuestionId}',
                    method: 'GET',
                    responseHandler: (response) => response.blob()
                }
            )
        }),
        fetchAnswer: builder.mutation<dto.QuestionResDTO[], dto.RandomNewQuestionReqDTO>({
            query: (data) => (
                {
                    url: '/lquiz/answer',
                    method: 'POST',
                    body: data
                }
            )
        })
    })
})