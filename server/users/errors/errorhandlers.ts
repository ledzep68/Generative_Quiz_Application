import { UserResponses } from "../user.response.ts";


//Errorのnameでレスポンスを分岐
export function userRegisterBusinessErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        'DBInternalError': {
            response: UserResponses.DB_INTERNAL_ERROR
        },
        'DBConnectError': {
            response: UserResponses.DB_CONNECT_ERROR
        },
        'DBOperationError': {
            response: UserResponses.DB_OPERATION_ERROR
        },
        'ValidationError': {
            response: UserResponses.VALIDATION_FAILED
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト
    return {
        response: UserResponses.UNKNOWN_SERVER_ERROR
    };
};

export function userLoginBusinessErrorHandler(error: Error): {response: any} {
    const errorMappings = {
        'DBInternalError': {
            response: UserResponses.DB_INTERNAL_ERROR
        },
        'DBConnectError': {
            response: UserResponses.DB_CONNECT_ERROR
        },
        'DBOperationError': {
            response: UserResponses.DB_OPERATION_ERROR
        },
        'ValidationError': {
            response: UserResponses.VALIDATION_FAILED
        }
    } as const;
    
    const mapping = errorMappings[error.name as keyof typeof errorMappings];
    
    if (mapping) {
        return mapping;
    }
    
    // デフォルト
    return {
        response: UserResponses.UNKNOWN_SERVER_ERROR
    };
}