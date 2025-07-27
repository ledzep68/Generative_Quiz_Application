/*********************************************

lquiz.entity.ts : ListeningQuiz用のエンティティ

*********************************************/

import { UUID } from "crypto";

export interface LQuestionEntity {
    lQuestionID: string; //listening-partx-XXXXXXXX(hash8桁)
    questionHash?: string; //後で実装
    audioScript: string;
    jpnAudioScript: string,
    answerOption: "A"|"B"|"C"|"D";
    sectionNumber: 1|2|3|4;
    explanation: string;
    speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian'; 
    speakingRate?: number; 
    duration?: number;
    audioFilePath: string;
    createdAt?: Date;
    updatedAt?: Date;
};

/*
export interface LAnswerResultEntity {
    lAnswerID?: UUID;
    userID?: UUID;
    lQuestionID?: string;
    userAnswerOption?: "A"|"B"|"C"|"D";
    isCorrect?: boolean; 
    reviewTag?: boolean;
    answerDate?: Date;
    createdAt?: Date;
    
    */

export interface LAnswerResultEntity {
    lAnswerID: UUID;
    userID: UUID;
    lQuestionID: string;
    latestUserAnswerOption: "A"|"B"|"C"|"D";  // 最新の回答
    latestIsCorrect: boolean;   // 最新の回答結果
    totalAttempts: number;        // 挑戦回数
    correctAttempts: number;      // 正解回数
    reviewTag?: boolean;
    firstAnsweredAt: Date;  //最初に回答するボタンを押下した日時
    lastAnsweredAt: Date;   //ユーザが回答するボタンを押下した日時
}