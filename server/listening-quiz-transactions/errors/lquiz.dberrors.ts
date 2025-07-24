import * as response from "../lquiz.json.ts";

export interface DBError extends Error {
};

export class DBConnectError extends Error implements DBError {
    constructor(
        message: string = "データベース接続エラー",
        public status: number = response.modelsLayerResponses.DB_CONNECTION_ERROR.status
    ) {
        super(message);
        this.name = "DBConnectError";
        this.status = status;
    }
}

export class DBInternalError extends Error implements DBError {
    constructor(
        message: string = "データベース内部エラー",
        public status: number = response.modelsLayerResponses.INTERNAL_SERVER_ERROR.status
    ) {
        super(message);
        this.name = "DBInternalError";
        this.status = status;
    }
}

export class DBQuestionDataError extends Error implements DBError {
    constructor(
        message: string = "問題データ処理エラー",
        public status: number = response.modelsLayerResponses.QUESTION_DATA_ERROR.status
    ) {
        super(message);
        this.name = "DBQuestionDataError";
        this.status = status;
    }
}

export class DBAnswerDataError extends Error implements DBError {
    constructor(
        message: string = "回答データ処理エラー",
        public status: number = response.modelsLayerResponses.ANSWER_DATA_ERROR.status
    ) {
        super(message);
        this.name = "DBAnswerDataError";
        this.status = status;
    }
}

export class DBValidationError extends Error implements DBError {
    constructor(
        message: string = "入力値検証エラー",
        public status: number = response.modelsLayerResponses.VALIDATION_ERROR.status
    ) {
        super(message);
        this.name = "DBValidationError";
        this.status = status;
    }
};