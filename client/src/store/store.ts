import { configureStore } from '@reduxjs/toolkit';

import { loginSlice } from '../features/user-management/login/login.slice';
import { userApi } from '../features/user-management/login/api';

import { uiSlice } from '../features/listening-quiz-management/transaaction/ui.slice';
import { newRandomQuestionRequestSlice } from '../features/listening-quiz-management/transaaction/newquestion.slice';
import { audioRequestSlice } from '../features/listening-quiz-management/transaaction/audio.slice';
import { newQuizApi } from '../features/listening-quiz-management/transaaction/api';
import { quiestionIndexManagementSlice } from '../features/listening-quiz-management/transaaction/index-management.slice';
import { answerSlice } from '../features/listening-quiz-management/transaaction/answer.slice';
import { resultSlice } from '../features/listening-quiz-management/transaaction/result.slice';
import { finalResultSlice } from '../features/listening-quiz-management/transaaction/final-result.slice';

export const store = configureStore({
    reducer: {
        loginManagement: loginSlice.reducer,

        uiManagement: uiSlice.reducer,
        newRandomQuestionRequest: newRandomQuestionRequestSlice.reducer,
        audioManagement: audioRequestSlice.reducer,
        indexManagement: quiestionIndexManagementSlice.reducer,
        answerManagement: answerSlice.reducer,
        resultManagement: resultSlice.reducer,
        finalResultManagement: finalResultSlice.reducer,
    
        //後で他slice追加
        [userApi.reducerPath]: userApi.reducer,
        [newQuizApi.reducerPath]: newQuizApi.reducer

    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(
            [
                userApi.middleware,
                newQuizApi.middleware
            ]
        )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;