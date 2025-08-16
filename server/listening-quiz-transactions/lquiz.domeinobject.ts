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
    answerOption: "A"|"B"|"C"|"D";
    sectionNumber: 1|2|3|4;
    explanation: string;
    duration: number;
    audioFilePath: string;
}

//***lquizAnswerController***/
//クイズ出題用データオブジェクト
export class LQuestionData {
    constructor(
        public lQuestionId: string,
        public audioScript: string,
        public jpnAudioScript: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        public duration: number,
        public audioFilePath: string
    ){}
};

//　正誤判定用ドメインオブジェクト
export interface IsCorrectData {
    lQuestionID: string,
    userAnswerOption: "A"|"B"|"C"|"D"
};

//回答データ新規DB登録用ドメインオブジェクト
export interface NewLAnswerData {
    lAnswerID: UUID,
    userID: UUID,
    lQuestionID: string,
    userAnswerOption: "A"|"B"|"C"|"D",
    isCorrect: boolean,
    reviewTag: boolean,
    answerDate: Date
};

//解答データ検索用ドメインオブジェクト
export interface AnswerScripts {
    lQuestionID: string,
    answerOption: "A"|"B"|"C"|"D",
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
};