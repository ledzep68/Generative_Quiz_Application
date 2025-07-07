/*********************************************

lquiz.domeinobject.ts : ListeningQuizドメイン内専用オブジェクト

*********************************************/

//新規問題生成用
export class NewQuestionInfo {
    constructor(
        public sectionNumber: 1|2|3|4,
        public requestedNumOfQuizs?: number,
        public speakingRate?: number //新規生成時のみ使用
    ){}
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
}


//音声URLデータ
export interface AudioURL {
    lQuestionID: string;
    audioFilePath: string;
    audioURL: string;
    duration: number;
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
export class TorFData {
    constructor(
        public lQuestionID: string,
        public userAnswerOption: "A"|"B"|"C"|"D"
    ){}
}

//回答データ新規DB登録用ドメインオブジェクト
export class LAnswerData {
    constructor(
        public lAnswerID?: string,
        public lQuestionID?: string,
        public userID?: string,
        public userAnswerOption?: "A"|"B"|"C"|"D",
        public trueOrFalse?: boolean,
        public reviewTag?: boolean,
        public answerDate?: Date
    ){}
}

//解答データ検索用ドメインオブジェクト
export class AnswerScripts {
    constructor(
        public lQuestionID: string,
        public audioScript: string,
        public jpnAudioScript: string,
        public explanation: string
    ){}
};