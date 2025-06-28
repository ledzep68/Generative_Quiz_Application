/*********************************************

lquiz.entity.ts : ListeningQuiz用のエンティティ

*********************************************/

export interface LQuizEntity {
    lQuestionId?: string;
    audioAcript?: string;
    jpnAudioScript?: string;
    audioURL?: string;
    answerOption?: "A"|"B"|"C"|"D";
    sectionNumber?: 1|2|3|4;
    explanation?: string;
    speakerAccent?: 'American' | 'British' | 'Canadian' | 'Australian'; //DB未追加 ユーザー指定時のみ登録
    speakingRate?: number; //DB未追加　ユーザー指定時のみ登録
    duration?: number;
    audioFilePath?: string,
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