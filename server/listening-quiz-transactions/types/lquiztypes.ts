export interface LQuestionDTO {
    LQuestionID?: string;
    AudioScript?: string;
    JPNAudioScript?: string;
    AudioURL?: string;
    AnswerOption?: "A"|"B"| "C"| "D";
    SectionNumber?: 1|2|3|4;
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
    TrueOrFalse?: boolean; 
    ReviewTag?: boolean;
    AnswerDate?: Date;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}