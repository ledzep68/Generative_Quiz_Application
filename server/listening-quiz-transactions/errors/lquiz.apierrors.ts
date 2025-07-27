/*********************************************

lquiz.apierrors.tsの機能:
    ・lquizapiservices.ts専用のエラークラス定義
    ・外部API連携時のエラーハンドリング
    ・音声処理関連のエラー定義

******************************************/

import * as response from "../lquiz.json.ts";

export interface BusinessLogicError extends Error {
    status: number;
}

// プロンプト生成エラー
export class PromptGenerateError extends Error implements BusinessLogicError {
    constructor(
        message: string = "プロンプト生成エラー",
        public status: number = response.externalAPIServicesResponses.PROMPT_GENERATE_ERROR.status
    ) {
        super(message);
        this.name = "PromptGenerateError";
        this.status = status;
    }
};
// ChatGPT API関連エラー
export class ChatGPTAPIError extends Error implements BusinessLogicError {
    constructor(
        message: string = "ChatGPT API Error",
        public status: number = response.externalAPIServicesResponses.CHATGPT_API_ERROR.status
    ) {
        super(message);
        this.name = "ChatGPTAPIError";
        this.status = status;
    }
}

// Google Cloud TTS API関連エラー
export class GoogleTTSAPIError extends Error implements BusinessLogicError {
    constructor(
        message: string = "Google Cloud TTS API Error",
        public status: number = response.externalAPIServicesResponses.GOOGLE_TTS_API_ERROR?.status || 500
    ) {
        super(message);
        this.name = "GoogleTTSAPIError";
        this.status = status;
    }
}

// SSML関連エラー
export class SSMLValidationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "SSML構造エラー",
        public status: number = response.externalAPIServicesResponses.SSML_VALIDATION_ERROR?.status || 400
    ) {
        super(message);
        this.name = "SSMLValidationError";
        this.status = status;
    }
}

// 音声処理関連エラー
export class AudioProcessingError extends Error implements BusinessLogicError {
    constructor(
        message: string = "音声処理エラー",
        public status: number = response.externalAPIServicesResponses.AUDIO_PROCESSING_ERROR?.status || 500
    ) {
        super(message);
        this.name = "AudioProcessingError";
        this.status = status;
    }
}

// FFmpeg関連エラー
export class FFmpegError extends Error implements BusinessLogicError {
    constructor(
        message: string = "FFmpeg処理エラー",
        public status: number = response.externalAPIServicesResponses.FFMPEG_ERROR?.status || 500
    ) {
        super(message);
        this.name = "FFmpegError";
        this.status = status;
    }
}

// Google Cloud認証エラー
export class GoogleAuthenticationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "Google Cloud認証エラー",
        public status: number = response.externalAPIServicesResponses.GOOGLE_AUTH_ERROR?.status || 401
    ) {
        super(message);
        this.name = "GoogleAuthenticationError";
        this.status = status;
    }
}

/*
// ファイル操作エラー
export class FileOperationError extends Error implements BusinessLogicError {
    constructor(
        message: string = "ファイル操作エラー",
        public status: number = response.externalAPIServicesResponses.FILE_OPERATION_ERROR?.status || 500
    ) {
        super(message);
        this.name = "FileOperationError";
        this.status = status;
    }
}*/

// 音声分割エラー
export class AudioSplitError extends Error implements BusinessLogicError {
    constructor(
        message: string = "音声分割エラー",
        public status: number = response.externalAPIServicesResponses.AUDIO_SPLIT_ERROR?.status || 500
    ) {
        super(message);
        this.name = "AudioSplitError";
        this.status = status;
    }
}

// 環境変数エラー
export class EnvironmentConfigError extends Error implements BusinessLogicError {
    constructor(
        message: string = "環境変数設定エラー",
        public status: number = response.externalAPIServicesResponses.ENVIRONMENT_CONFIG_ERROR?.status || 500
    ) {
        super(message);
        this.name = "EnvironmentConfigError";
        this.status = status;
    }
}