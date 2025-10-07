import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as type from "./types.ts";

const initialState: type.UserInformation = {
    userName: "",
    isLoggedIn: false,

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined
}

export const loginSlice = createSlice({
    name: "loginManagement",
    initialState,
    reducers: {
        login: (state, action) => {
            state.userName = action.payload.userName;
            state.isLoggedIn = action.payload.isLoggedIn;
        },
        logout: (state) => {
            state.userName = "";
            state.isLoggedIn = false;
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
        }
    }
})

export const {login, logout, setRequestStatus} = loginSlice.actions;