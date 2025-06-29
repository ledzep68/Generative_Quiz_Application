import * as schema from "../schemas/lquizbusinessschema.js";
import * as response from "../lquiz.json.js";

export interface BusinessLogicError extends Error {
    status: number;
};

export class ValidationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "バリデーションエラー", 
        public status: number = response.lQuizAnswerControllerResponses.VALIDATION_ERROR.status
    ) {
        super(message);
        this.name = "ValidationError";
        this.status = status;
    }
};

export class ChatGPTAPIError extends Error implements BusinessLogicError {
    constructor(
        message: string = "ChatGPT API Error",
        public status: number = response.lQuizGenerateControllerResponses.CHATGPT_API_ERROR.status
    ) {
        super(message);
        this.name = "ChatGPTAPIError";
        this.status = status;
    }
};

export class AnswerJudgementError extends Error implements BusinessLogicError {
    constructor(
        message: string = "正誤判定処理エラー",
        public status: number = response.lQuizAnswerControllerResponses.ANSWER_JUDGMENT_ERROR.status
    ) {
        super(message);
        this.name = "AnswerJudgementError";
        this.status = status;
    }
};

export class AnswerSaveError extends Error implements BusinessLogicError {
    constructor(
        message: string = "回答データ保存エラー",
        public status: number = response.lQuizAnswerControllerResponses.ANSWER_SAVE_ERROR.status
    ) {
        super(message);
        this.name = "AnswerSaveError";
        this.status = status;
    }
};

export class QuestionDataError extends Error implements BusinessLogicError {
    constructor(
        message: string = "問題データ取得エラー",
        public status: number = response.lQuizAnswerControllerResponses.QUESTION_DATA_ERROR.status
    ) {
        super(message);
        this.name = "QuestionDataError";
        this.status = status;
    }
};