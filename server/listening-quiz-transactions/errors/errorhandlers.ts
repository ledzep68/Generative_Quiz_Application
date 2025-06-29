import * as response from "../lquiz.json.js";

//Errorのnameでレスポンスを分岐
export function lQuizAnswerErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        'DBInternalError': {
            response: response.lQuizAnswerControllerResponses.INTERNAL_SERVER_ERROR
        },
        'DBConnectError': {
            response: response.lQuizAnswerControllerResponses.DB_CONNECTION_ERROR
        },
        'DBOperationError': {
            response: response.lQuizAnswerControllerResponses.QUESTION_DATA_ERROR
        },
        'ValidationError': {
            response: response.lQuizAnswerControllerResponses.VALIDATION_ERROR
        },
        'ZodError': {
            response: response.lQuizAnswerControllerResponses.VALIDATION_ERROR
        },
        'AnswerJudgementError': {
            response: response.lQuizAnswerControllerResponses.ANSWER_JUDGMENT_ERROR
        },
        'AnswerSaveError': {
            response: response.lQuizAnswerControllerResponses.ANSWER_SAVE_ERROR
        },
        'QuestionDataError': {
            response: response.lQuizAnswerControllerResponses.QUESTION_DATA_ERROR
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト（未定義のエラー）
    return {
        response: response.lQuizAnswerControllerResponses.INTERNAL_SERVER_ERROR
    };
};

//Errorのnameでレスポンスを分岐
export function lQuizAPIServicesErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        // ChatGPT API関連エラー
        'ChatGPTAPIError': {
            response: response.lQuizAPIServicesResponses.CHATGPT_API_ERROR
        },
        
        // Google Cloud TTS API関連エラー
        'GoogleTTSAPIError': {
            response: response.lQuizAPIServicesResponses.GOOGLE_TTS_API_ERROR
        },
        'GoogleAuthenticationError': {
            response: response.lQuizAPIServicesResponses.GOOGLE_AUTH_ERROR
        },
        
        // SSML関連エラー
        'SSMLValidationError': {
            response: response.lQuizAPIServicesResponses.SSML_VALIDATION_ERROR
        },
        
        // 音声処理関連エラー
        'AudioProcessingError': {
            response: response.lQuizAPIServicesResponses.AUDIO_PROCESSING_ERROR
        },
        'AudioSplitError': {
            response: response.lQuizAPIServicesResponses.AUDIO_SPLIT_ERROR
        },
        
        // FFmpeg関連エラー
        'FFmpegError': {
            response: response.lQuizAPIServicesResponses.FFMPEG_ERROR
        },
        
        // ファイル操作関連エラー
        'FileOperationError': {
            response: response.lQuizAPIServicesResponses.FILE_OPERATION_ERROR
        },
        
        // 環境設定関連エラー
        'EnvironmentConfigError': {
            response: response.lQuizAPIServicesResponses.ENVIRONMENT_CONFIG_ERROR
        },
        
        // バリデーション関連エラー
        'ValidationError': {
            response: response.lQuizAPIServicesResponses.VALIDATION_ERROR
        },
        'ZodError': {
            response: response.lQuizAPIServicesResponses.VALIDATION_ERROR
        },
        
        // Node.js標準エラー
        'TypeError': {
            response: response.lQuizAPIServicesResponses.VALIDATION_ERROR
        },
        'ReferenceError': {
            response: response.lQuizAPIServicesResponses.INTERNAL_SERVER_ERROR
        },
        'SyntaxError': {
            response: response.lQuizAPIServicesResponses.VALIDATION_ERROR
        },
        
        // ネットワーク関連エラー
        'FetchError': {
            response: response.lQuizAPIServicesResponses.API_TIMEOUT_ERROR
        },
        'AbortError': {
            response: response.lQuizAPIServicesResponses.API_TIMEOUT_ERROR
        },
        'TimeoutError': {
            response: response.lQuizAPIServicesResponses.API_TIMEOUT_ERROR
        },
        
        // ファイルシステム関連エラー（Node.js fs module）
        'ENOENT': {
            response: response.lQuizAPIServicesResponses.FILE_READ_ERROR
        },
        'EACCES': {
            response: response.lQuizAPIServicesResponses.FILE_OPERATION_ERROR
        },
        'EMFILE': {
            response: response.lQuizAPIServicesResponses.FILE_OPERATION_ERROR
        },
        'ENOSPC': {
            response: response.lQuizAPIServicesResponses.FILE_WRITE_ERROR
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト（未定義のエラー）
    return {
        response: response.lQuizAPIServicesResponses.UNEXPECTED_ERROR
    };
}