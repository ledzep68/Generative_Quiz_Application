//RTK Query(Redux Toolkit Query)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import * as dto from "./dto.ts"

const newQuizApi = createApi({
    reducerPath: 'newQuizApi', //API識別子
    tagTypes: ['Quiz', 'Session'], //各Sliceをタグで分類→tag別にキャッシュを無効化・管理可能
    //エンドポイントの共通部分
    baseQuery: fetchBaseQuery({ 
            baseUrl: `http://localhost:3000/api`, /*本番環境で切り替え必要　環境変数で設定*/ 
            credentials: 'include'
        }),
    //個別API定義
    endpoints: (builder) => ({
        //クイズセッション初期化リクエスト
        initiateSession: builder.mutation<void, dto.RandomNewQuestionReqDTO>({
            query: (data) => ({
                url: `/lquiz/initialize-quiz-session`,
                method: 'POST', 
                body: data
            }),
            invalidatesTags: ['Session']
        }),
        //クイズセッション終了リクエスト
        resetQuizSession: builder.mutation<void, void>({
            query: () => ({
                url: `/lquiz/reset-quiz-session`,
                method: 'POST', 
                body: undefined
            }),
            invalidatesTags: ['Session']
        }),
        //全セッション（ユーザーセッション・クイズセッション）終了リクエスト
        resetUserAndQuizSession: builder.mutation<void, void>({
            query: () => ({
                url: `/auth/reset-user-and-quiz-session`,
                method: 'POST', 
                body: undefined
            }),
            invalidatesTags: ['Session']
        }),
        //part2新規クイズリクエスト
        fetchPart2NewQuestions: builder.mutation<{questionHash: string}, {currentIndex: number}>({
            query: (data) => (
                {
                    url: `/lquiz/new-quiz-generate-2`, 
                    method: 'POST',
                    body: data
                }
            ),
            invalidatesTags: ['Quiz']
        }),
        //音声データリクエスト
        fetchAudio: builder.query<Blob, string>({
            query: (questionHash: string) => (
                {
                    url: `/audio/${questionHash}`,//コロン不要
                    method: 'GET',
                    responseHandler: (response) => response.blob()
                }
            )
        }),
        fetchAnswer: builder.mutation<dto.UserAnswerResDTO, dto.UserAnswerReqDTO>({
            query: (data) => (
                {
                    url: `/lquiz/answer`,
                    method: 'POST',
                    body: data
                }
            ),
            invalidatesTags: ['Quiz']
        })
    })
});
export const {
    useInitiateSessionMutation,
    useResetQuizSessionMutation,
    useResetUserAndQuizSessionMutation,
    useFetchPart2NewQuestionsMutation,
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