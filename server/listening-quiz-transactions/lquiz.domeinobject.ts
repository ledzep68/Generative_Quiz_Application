/*********************************************

lquiz.domeinobject.ts : ListeningQuizドメイン内専用オブジェクト

*********************************************/

//クイズ生成プロンプト作成用データ
export class LQuizGenerateInfo {
    constructor(
        public requestNumOfQuizs: number,
        public sectionNumber: 1|2|3|4
    ){}
}

//音声保存先URL生成モジュールに渡す用データ
export class AudioURLGenerateInfo {
    constructor(
        public fileName: string
    ){}
};


//***lquizAnswerController***/
//クイズデータ新規DB登録用データオブジェクト
export class LQuizData {
    constructor(
        public lQuestionId: string,
        public audioAcript: string,
        public jpnAudioScript: string,
        public audioURL: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        public duration: number
    ){}
}

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