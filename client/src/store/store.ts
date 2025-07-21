import { configureStore } from '@reduxjs/toolkit';
import { loginSlice } from '../features/user-management/login/login.slice';
import { newRandomQuestionRequestSlice } from '../features/listening-quiz-management/transaaction/newquiz.slice';
import { audioRequestSlice } from '../features/listening-quiz-management/transaaction/audio.slice';
import { newQuizApi } from '../features/listening-quiz-management/transaaction/api';
import { quiestionIndexManagementSlice } from '../features/listening-quiz-management/transaaction/index-management.slice';

export const store = configureStore({
    reducer: {
        loginRequest: loginSlice.reducer,
        newRandomQuestionRequest: newRandomQuestionRequestSlice.reducer,
        audioRequest: audioRequestSlice.reducer,
        indexManagement: quiestionIndexManagementSlice.reducer,
        //後で他slice追加
        [newQuizApi.reducerPath]: newQuizApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(newQuizApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;