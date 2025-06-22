import * as response from "../lquiz.json.js";

export interface DBError extends Error {
};

export class DBConnectError extends Error implements DBError {
    constructor(
        message: string = "データベース接続エラー",
        public status: number = response.lQuizAnswerControllerResponses.DB_CONNECTION_ERROR.status
    ) {
        super(message);
        this.name = "DBConnectError";
        this.status = status;
    }
};

export class DBOperationError extends Error implements DBError {
    constructor(
        message: string = "データベース操作エラー",
        public status: number = response.lQuizAnswerControllerResponses.QUESTION_DATA_ERROR.status
    ) {
        super(message);
        this.name = "DBOperationError";
        this.status = status;
    }
};

export class DBInternalError extends Error implements DBError {
    constructor(
        message: string = "データベース内部エラー",
        public status: number = response.lQuizAnswerControllerResponses.INTERNAL_SERVER_ERROR.status
    ) {
        super(message);
        this.name = "DBInternalError";
        this.status = status;
    }
};