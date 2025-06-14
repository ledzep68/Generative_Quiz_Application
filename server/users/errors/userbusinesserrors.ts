import * as userschema from "../users/userschema.js";

export interface BusinessLogicError extends Error {
    status: number;
};

export class ValidationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "バリデーションエラー", 
        public status: number = 400
    ) {
        super(message);
        this.name = "ValidationError";
        this.status = status;
    }
};