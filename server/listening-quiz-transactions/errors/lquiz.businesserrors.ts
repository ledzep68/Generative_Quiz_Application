import * as schema from "../schemas/lquizbusinessschema.js";
import * as response from "../lquiz.json.js";

export interface BusinessLogicError extends Error {
    status: number;
};

export class ValidationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "バリデーションエラー", 
        public status: number = response.businessLogicServicesResponses.VALIDATION_ERROR.status
    ) {
        super(message);
        this.name = "ValidationError";
        this.status = status;
    }
};

export class AnswerJudgementError extends Error implements BusinessLogicError {
    constructor(
        message: string = "正誤判定処理エラー",
        public status: number = response.businessLogicServicesResponses.ANSWER_JUDGMENT_ERROR.status
    ) {
        super(message);
        this.name = "AnswerJudgementError";
        this.status = status;
    }
};