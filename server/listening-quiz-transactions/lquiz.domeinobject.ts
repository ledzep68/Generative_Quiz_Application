/*********************************************

lquiz.domeinobject.ts : ListeningQuizドメイン内専用オブジェクト

*********************************************/

import { UUID } from "crypto";

//新規問題生成用
export interface NewLQuestionInfo {
    sectionNumber: 1|2|3|4,
    requestedNumOfLQuizs: 1|2|3|4|5|6|7|8|9|10,
    speakerAccent?: 'American' | 'British' | 'Canadian' | 'Australian',
    speakingRate: number //必須　デフォルト値は1.0
};
/*
//復習問題取得用
export class ReviewQuestionInfo {
    constructor(
        public sectionNumber: 1|2|3|4,
        public lQuestionID?: string, //復習時のみ使用
        public userID?: string, //復習時のみ使用
        public reviewTag?: boolean, //復習時のみ使用
        public requestedNumOfQuizs?: number, 
        public speakerAccent?: 'American' | 'British' | 'Canadian' | 'Australian', //新規生成時のみ使用
        public speakingRate?: number //新規生成時のみ使用
    ){}
};
*/

//音声URLデータ
export interface AudioFilePath {
    lQuestionID: string;
    audioFilePath: string;
    duration?: number;
};

//新規クイズデータ記録用
export interface NewLQuestionData {
    lQuestionID: string;
    audioScript: string;
    jpnAudioScript: string;
    answerOption: ("A"|"B"|"C"|"D")[];
    sectionNumber: 1|2|3|4;
    explanation: string;
    duration: number;
    audioFilePath: string;
}

//***lquizAnswerController***/

//正誤判定用ドメインオブジェクト
export interface IsCorrectData {
    questionHash: string,
    userAnswerOption: ("A"|"B"|"C"|"D"|null)[]
};

//正誤判定結果ドメインオブジェクト
export interface IsCorrectResult {
    lQuestionID: string,
    isCorrectList: boolean[]
};

//回答データ新規DB登録用ドメインオブジェクト
export interface NewLAnswerData {
    lAnswerID: UUID,
    userID?: UUID,
    lQuestionID: string,
    questionHash: string,
    userAnswerOption: ("A"|"B"|"C"|"D"|null)[],
    isCorrectList: boolean[],
    reviewTag: boolean,
    answerDate: Date
};

//ユーザ送信用解答データドメインオブジェクト
export interface AnswerScripts {
    answerOption: ("A"|"B"|"C"|"D")[],
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
};