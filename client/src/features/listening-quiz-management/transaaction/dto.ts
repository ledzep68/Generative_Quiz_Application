import {UUID} from "crypto";

//新規クイズリクエストスキーマ（ランダム生成、ID非指定）
//初回リクエストのみ送信　2問目以降はcurrentIndexだけ送信
export interface RandomNewQuestionReqDTO {
    sectionNumber :1|2|3|4,
    requestedNumOfLQuizs: 1|2|3|4|5|6|7|8|9|10,
    speakingRate?: number,
    speakerAccent?: "American" | "British" | "Canadian" | "Australian",
};

//2回目以降
//{currentIndex: number}

//復習クイズリクエストスキーマ（ランダム、ID非指定）
export interface RandomReviewQuestionReqDTO {
    userID: string,
    sectionNumber: 1|2|3|4,
    reviewTag: boolean,
    requestedNumOfLQuizs?: number,
    speakingRate?: number 
};

//復習クイズリクエストスキーマ（ID指定）
export interface ReviewQuestionReqDTO {
    lQuestionID: string,
    userID: string,
    sectionNumber: 1|2|3|4,
    reviewTag: boolean,
    speakingRate?: number
};

/*
//サーバーからのクイズレスポンスDTO 新規・既存共通　使わない questionHashを使う
export interface QuestionResDTO {
    lQuestionID: string,
    //audioScript: string,
    //jpnAudioScript: string,
    //answerOption: "A"|"B"|"C"|"D",
    sectionNumber: 1|2|3|4,
    //explanation: string,
    speakerAccent: "American" | "British" | "Canadian" | "Australian",
    speakingRate: number,
    duration?: number
    //audioURL: string
};
*/
/*
//OpenAI APIへのクイズリクエストプロンプト
//prompt中でresで期待するクイズデータのスキーマを指定
export class NewQuizGenerateReqDTO {
    constructor(
        public prompt: string
    ){}
}

//OpenAI APIからのres用のクイズデータスキーマ
export class GeneratedQuestionDataResDTO {
    constructor(
        public audioScript: string,
        public jpnAudioScript: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        public speakerAccent: "American" | "British" | "Canadian" | "Australian"
       // public lQuestionID?: string
    ){}
};

//TTS APIへの音声データリクエスト
export class NewAudioReqDTO {
    constructor(
        public lQuestionID: string,
        public audioScript: string,
        public speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian',
        public speakingRate: number
    ){}
}

//TTS APIからの音声データres
export class GeneratedAudioResDTO {
    constructor(
        public Audio: string,// Base64エンコードされた音声データ
        public mimeType: 'audio/mp3' | 'audio/wav' | 'audio/ogg',
        public fileName: string,
        public duration: number
    ){}
}

//既存クイズnのリクエスト
export class ExistingLQuizReqDTO {
    constructor(
        public requestNumOfQuizs: number,
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean
    ){}
}
*/

//回答データPOST（リクエスト）
export interface UserAnswerReqDTO {
    lQuestionID: string,
    userID: UUID,
    userAnswerOption?: "A"|"B"|"C"|"D",
    reviewTag: boolean,
    answerDate?: Date
};

//正誤・解答データレスポンス
export interface UserAnswerResDTO {
    //lQuestionID: string,
    isCorrect: boolean,
    answerOption: "A"|"B"|"C"|"D",
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
}