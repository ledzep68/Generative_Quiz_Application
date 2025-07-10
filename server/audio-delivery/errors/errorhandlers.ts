import { audioDeliveryControllerResponses, modelsLayerResponses } from "../audio.responses.js";

//audio配信Controller用エラーハンドラ
export function audioDeliveryControllerErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        // Controller層で発生するエラー（audio配信固有）
        'AudioNotFoundError': {
            response: audioDeliveryControllerResponses.AUDIO_NOT_FOUND
        },
        'QuestionNotFoundError': {
            response: audioDeliveryControllerResponses.QUESTION_NOT_FOUND
        },
        'AudioFileAccessError': {
            response: audioDeliveryControllerResponses.AUDIO_FILE_ACCESS_ERROR
        },
        'InvalidQuestionIdError': {
            response: audioDeliveryControllerResponses.INVALID_QUESTION_ID
        },
        'AudioDeliveryError': {
            response: audioDeliveryControllerResponses.AUDIO_DELIVERY_ERROR
        },
        'UnauthorizedAudioAccessError': {
            response: audioDeliveryControllerResponses.UNAUTHORIZED_AUDIO_ACCESS
        },

        // 汎用バリデーションエラー
        'ValidationError': {
            response: audioDeliveryControllerResponses.INVALID_QUESTION_ID
        },
        'ZodError': {
            response: audioDeliveryControllerResponses.INVALID_QUESTION_ID
        },
        
        // Models層で発生するエラー
        'DBConnectError': {
            response: modelsLayerResponses.DB_CONNECTION_ERROR
        },
        'DBQuestionDataError': {
            response: modelsLayerResponses.QUESTION_DATA_ERROR
        },
        'DBValidationError': {
            response: modelsLayerResponses.VALIDATION_ERROR
        },
        'DBInternalError': {
            response: modelsLayerResponses.INTERNAL_SERVER_ERROR
        },

        // ファイルシステム関連エラー
        'ENOENT': {
            response: audioDeliveryControllerResponses.AUDIO_NOT_FOUND
        },
        'EACCES': {
            response: audioDeliveryControllerResponses.AUDIO_FILE_ACCESS_ERROR
        },
        'EPERM': {
            response: audioDeliveryControllerResponses.AUDIO_FILE_ACCESS_ERROR
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト（未定義のエラー）
    return {
        response: audioDeliveryControllerResponses.INTERNAL_SERVER_ERROR
    };
}