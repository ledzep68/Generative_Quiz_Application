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
}