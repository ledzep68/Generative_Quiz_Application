import { configureStore } from '@reduxjs/toolkit';

import { loginSlice } from '../features/user-management/login/login.slice';

import { uiSlice } from '../features/listening-quiz-management/transaaction/ui.slice';
import { newRandomQuestionRequestSlice } from '../features/listening-quiz-management/transaaction/newquestion.slice';
import { audioRequestSlice } from '../features/listening-quiz-management/transaaction/audio.slice';
import { newQuizApi } from '../features/listening-quiz-management/transaaction/api';
import { quiestionIndexManagementSlice } from '../features/listening-quiz-management/transaaction/index-management.slice';
import { answerSlice } from '../features/listening-quiz-management/transaaction/answer.slice';

export const store = configureStore({
    reducer: {
        loginManagement: loginSlice.reducer,

        uiManagement: uiSlice.reducer,
        newRandomQuestionRequest: newRandomQuestionRequestSlice.reducer,
        audioManagement: audioRequestSlice.reducer,
        indexManagement: quiestionIndexManagementSlice.reducer,
        answerManagement: answerSlice.reducer,
    
        //後で他slice追加
        [newQuizApi.reducerPath]: newQuizApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(newQuizApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;