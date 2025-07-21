import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import * as type from "./types.ts";

const initialState: type.AudioRequestState = {
    requestParams: {
        currentLQuestionId: undefined
    },

    audioData: undefined,

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

