import { audioDeliveryControllerResponses } from "../audio.responses.js";

// 音声配信関連の基底エラーインターface
export interface AudioDeliveryError extends Error {
    status: number;
}

// 音声ファイルが見つからないエラー
export class AudioNotFoundError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "音声ファイルが見つかりません",
        public status: number = audioDeliveryControllerResponses.AUDIO_NOT_FOUND.status
    ) {
        super(message);
        this.name = "AudioNotFoundError";
        this.status = status;
    }
}

// 問題が見つからないエラー
export class QuestionNotFoundError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "指定された問題が見つかりません",
        public status: number = audioDeliveryControllerResponses.QUESTION_NOT_FOUND.status
    ) {
        super(message);
        this.name = "QuestionNotFoundError";
        this.status = status;
    }
}

// 音声ファイルアクセスエラー
export class AudioFileAccessError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "音声ファイルにアクセスできません",
        public status: number = audioDeliveryControllerResponses.AUDIO_FILE_ACCESS_ERROR.status
    ) {
        super(message);
        this.name = "AudioFileAccessError";
        this.status = status;
    }
}

// 無効な問題ハッシュエラー
export class InvalidQuestionHashError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "無効なhash値です",
        public status: number = audioDeliveryControllerResponses.INVALID_QUESTION_HASH.status
    ) {
        super(message);
        this.name = "InvalidQuestionHashError";
        this.status = status;
    }
}

// 音声配信エラー
export class AudioDeliveryError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "音声配信中にエラーが発生しました",
        public status: number = audioDeliveryControllerResponses.AUDIO_DELIVERY_ERROR.status
    ) {
        super(message);
        this.name = "AudioDeliveryError";
        this.status = status;
    }
}

// 音声ファイルへの不正アクセスエラー
export class UnauthorizedAudioAccessError extends Error implements AudioDeliveryError {
    constructor(
        message: string = "音声ファイルへのアクセス権限がありません",
        public status: number = audioDeliveryControllerResponses.UNAUTHORIZED_AUDIO_ACCESS.status
    ) {
        super(message);
        this.name = "UnauthorizedAudioAccessError";
        this.status = status;
    }
}