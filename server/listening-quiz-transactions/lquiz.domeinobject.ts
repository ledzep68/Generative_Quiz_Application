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