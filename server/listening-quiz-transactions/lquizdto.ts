/*

export interface RequestDTO {
    L
};
export interface ResponseDTO {
    LAnswerID?: string,
    LQuestionID?: string,
    UserID?: string,
    UserAnswerOption?: string,
    ReviewTag?: Boolean,
    AnswerDate?: Date
};


export interface LQuestionDTO {
    LQuestionID?: string;
    AudioScript?: string;
    JPNAudioScript?: string;
    AudioURL?: string;
    AnswerOption?: string;
    SectionNumber?: number;
    Explanation?: string;
    Duration?: number;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

export interface LAnswerResultDTO {
    LAnswerID?: string;
    LQuestionID?: string;
    UserID?: string;
    UserAnswerOption?: string;
    TrueOrFalse?: boolean; // Boolean → boolean (プリミティブ型推奨)
    ReviewTag?: boolean;
    AnswerDate?: Date;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

export type LQuestionDTO = {
    LQuestionID?: string;
    AudioScript?: string;
    JPNAudioScript?: string;
    AudioURL?: string;
    AnswerOption?: string;
    SectionNumber?: number;
    Explanation?: string;
    Duration?: number
};

export type LAnswerResultDTO = {
    LAnswerID?: string;
    LQuestionID?: string;
    UserID?: string;
    UserAnswerOption?: string;
    TrueOrFalse?: Boolean;
    ReviewTag?: Boolean;
    AnswerDate?: Date;
};
*/

/*
・クイズを何問出題するのか？（MAX10問） RequestedNumOfLQuizs
・Section5か6か　SectionFiveOrSix
*/

//ランキングインターフェースも後で作る