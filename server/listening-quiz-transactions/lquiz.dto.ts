/*********************************************

lquiz.dto.ts : requestとresponse用のデータ構造定義
                クラスは継承させない（依存関係複雑化回避のため）　型定義、簡易バリデーションのみ

*********************************************/

import { UUID } from "crypto";
import { SpeakerAccent } from "./services/lquizapiservice.js";

//ユーザーからの新規クイズリクエストスキーマ（ランダム生成、ID非指定）
export interface RandomNewQuestionReqDTO {
    sectionNumber: 1|2|3|4,
    requestedNumOfLQuizs: 1|2|3|4|5|6|7|8|9|10,
    speakerAccent?: 'American' | 'British' | 'Canadian' | 'Australian',
    speakingRate: number //必須　デフォルト値1.0
};

//ユーザーからの復習クイズリクエストスキーマ（ランダム、ID非指定）
export class RandomReviewQuestionReqDTO {
    constructor(
        /*public lQuestionID: string,*/
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean,
        public requestedNumOfLQuizs?: number,
        public speakingRate?: number //発話速度
    ){}
};

//ユーザーからの復習クイズリクエストスキーマ（ID指定）
export class ReviewQuestionReqDTO {
    constructor(
        public lQuestionID: string,
        public userID: string,
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean,
        //public requestedNumOfLQuizs?: number,
        public speakingRate?: number //発話速度
    ){}
};

/*
//questionHashしか送らないので不要
//ユーザーへのクイズレスポンスDTO 新規・既存共通
export class QuestionResDTO {
    constructor(
        public lQuestionID: string,
        //public audioScript: string,
        //public jpnAudioScript: string,
        //public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        //public explanation: string,
        public speakerAccent: "American" | "British" | "Canadian" | "Australian",
        public speakingRate: number,
        public duration: number
    ){}
};
*/

//OpenAI APIへのクイズリクエストプロンプト
//prompt中でresで期待するクイズデータのスキーマを指定
export class NewQuizGenerateReqDTO {
    constructor(
        public prompt: string
    ){}
}

//OpenAI APIからのres用のクイズデータスキーマ
//lQuestionIdは生成対象ではなく、AIにも渡さない（セキュリティリスク考慮）ので除外
export interface GeneratedQuestionDataResDTO {
    audioScript: string,
    jpnAudioScript?: string,
    answerOption: ("A"|"B"|"C"|"D")[],
    sectionNumber: 1|2|3|4,
    explanation?: string,
    speakerAccent: "American" | "British" | "Canadian" | "Australian"
};

//TTS APIへの音声データリクエスト
export interface NewAudioReqDTO {
    sectionNumber: 1|2|3|4,
    audioScript: string,
    speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian',
    speakingRate: number
};

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


//ユーザーからの回答データPOST（リクエスト）
export interface UserAnswerReqDTO {
    questionHash: string,
    userAnswerOption: ("A"|"B"|"C"|"D"|null)[],
    reviewTag: boolean,
    answerDate?: Date
};

//ユーザーへの正誤・解答データ送信（レスポンス）
export interface UserAnswerResDTO {
    isCorrectList: boolean[],
    answerOption: ("A"|"B"|"C"|"D")[],
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
};