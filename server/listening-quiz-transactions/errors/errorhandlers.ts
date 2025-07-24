import * as response from "../lquiz.json.ts";

//新規問題生成Controller用エラーハンドラ
export function generateLQuestionErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        // Controller層で発生するエラー
        'ValidationError': {
            response: response.generateQuestionControllerResponses.VALIDATION_ERROR
        },
        'ZodError': {
            response: response.generateQuestionControllerResponses.VALIDATION_ERROR
        },
        
        // Services層（External API）で発生するエラー
        'ChatGPTAPIError': {
            response: response.externalAPIServicesResponses.CHATGPT_API_ERROR
        },
        'ChatGPTResponseValidationError': {
            response: response.externalAPIServicesResponses.CHATGPT_RESPONSE_VALIDATION_ERROR
        },
        'GoogleTTSAPIError': {
            response: response.externalAPIServicesResponses.GOOGLE_TTS_API_ERROR
        },
        'GoogleAuthError': {
            response: response.externalAPIServicesResponses.GOOGLE_AUTH_ERROR
        },
        'SSMLValidationError': {
            response: response.externalAPIServicesResponses.SSML_VALIDATION_ERROR
        },
        'SSMLGenerationError': {
            response: response.externalAPIServicesResponses.SSML_GENERATION_ERROR
        },
        'AudioProcessingError': {
            response: response.externalAPIServicesResponses.AUDIO_PROCESSING_ERROR
        },
        'AudioSplitError': {
            response: response.externalAPIServicesResponses.AUDIO_SPLIT_ERROR
        },
        'AudioEncodingError': {
            response: response.externalAPIServicesResponses.AUDIO_ENCODING_ERROR
        },
        'FFmpegError': {
            response: response.externalAPIServicesResponses.FFMPEG_ERROR
        },
        'FFmpegNotFoundError': {
            response: response.externalAPIServicesResponses.FFMPEG_NOT_FOUND_ERROR
        },
        'EnvironmentConfigError': {
            response: response.externalAPIServicesResponses.ENVIRONMENT_CONFIG_ERROR
        },
        'APIKeyError': {
            response: response.externalAPIServicesResponses.API_KEY_ERROR
        },
        'APITimeoutError': {
            response: response.externalAPIServicesResponses.API_TIMEOUT_ERROR
        },
        'AudioProcessingTimeoutError': {
            response: response.externalAPIServicesResponses.AUDIO_PROCESSING_TIMEOUT
        },
        
        // Services層（Business Logic）で発生するエラー
        'AccentValidationError': {
            response: response.businessLogicServicesResponses.ACCENT_VALIDATION_ERROR
        },
        'QuestionCountError': {
            response: response.businessLogicServicesResponses.QUESTION_COUNT_ERROR
        },
        
        // Models層で発生するエラー
        'DBConnectError': {
            response: response.modelsLayerResponses.DB_CONNECTION_ERROR
        },
        'DBQuestionDataError': {
            response: response.modelsLayerResponses.QUESTION_DATA_ERROR
        },
        'DBValidationError': {
            response: response.modelsLayerResponses.VALIDATION_ERROR
        },
        'DBInternalError': {
            response: response.modelsLayerResponses.INTERNAL_SERVER_ERROR
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト（未定義のエラー）
    return {
        response: response.generateQuestionControllerResponses.INTERNAL_SERVER_ERROR
    };
}

//回答処理Controller用エラーハンドラ
export function answerControllerErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        // Controller層で発生するエラー
        'ValidationError': {
            response: response.answerControllerResponses.VALIDATION_ERROR
        },
        'ZodError': {
            response: response.answerControllerResponses.VALIDATION_ERROR
        },
        
        // Services層（Business Logic）で発生するエラー
        'AnswerJudgmentError': {
            response: response.businessLogicServicesResponses.ANSWER_JUDGMENT_ERROR
        },
        'AccentValidationError': {
            response: response.businessLogicServicesResponses.ACCENT_VALIDATION_ERROR
        },
        'QuestionCountError': {
            response: response.businessLogicServicesResponses.QUESTION_COUNT_ERROR
        },
        
        // Models層で発生するエラー
        'DBConnectError': {
            response: response.modelsLayerResponses.DB_CONNECTION_ERROR
        },
        'DBQuestionDataError': {
            response: response.modelsLayerResponses.QUESTION_DATA_ERROR
        },
        'DBAnswerDataError': {
            response: response.modelsLayerResponses.ANSWER_DATA_ERROR
        },
        'DBValidationError': {
            response: response.modelsLayerResponses.VALIDATION_ERROR
        },
        'DBInternalError': {
            response: response.modelsLayerResponses.INTERNAL_SERVER_ERROR
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト（未定義のエラー）
    return {
        response: response.answerControllerResponses.INTERNAL_SERVER_ERROR
    };
}