//RTK Query(Redux Toolkit Query)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as dto from './dto';

const userApi = createApi({
    reducerPath: 'userApi', 
    tagTypes: [],
    //エンドポイントの共通部分
    baseQuery: fetchBaseQuery({ 
            baseUrl: import.meta.env.VITE_API_BASE_URL, /*本番環境で切り替え必要　環境変数で設定*/ 
            credentials: 'include'
        }),
    //個別API定義
    endpoints: (builder) => ({
        //新規登録リクエスト
        fetchRegisterAndInitializeSession: builder.mutation<void, dto.RegisterReqDTO>({
            query: (data) => (
                {
                    url: `/auth/register`, 
                    method: 'POST',
                    body: data
                }
            )
        }),
        //ログインリクエスト
        fetchLoginAndInitializeSession: builder.mutation<void, dto.LoginReqDTO>({
            query: (data) => (
                {
                    url: `/auth/login`,
                    method: 'POST',
                    body: data
                }
            )
        })
    })
});
export const {
    useFetchRegisterAndInitializeSessionMutation,
    useFetchLoginAndInitializeSessionMutation
} = userApi;

export {userApi};

export default userApi;