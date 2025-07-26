/*********************************************

lquiz.entity.ts : ListeningQuiz用のエンティティ

*********************************************/

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
}

export interface LAnswerResultEntity {
    lAnswerID?: string;
    lQuestionID?: string;
    userID?: string;
    userAnswerOption?: "A"|"B"|"C"|"D";
    trueOrFalse?: boolean; 
    reviewTag?: boolean;
    answerDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}