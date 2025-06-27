/*********************************************

lquiz.dto.ts : requestとresponse用のデータ構造定義
                クラスは継承させない（依存関係複雑化回避のため）　型定義、簡易バリデーションのみ

*********************************************/

//ユーザーからのクイズリクエストスキーマ
export class QuestionReqDTO {
    constructor(
        public lQuestionID: string,
        public userID: string,
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean,
        public requestedNumOfLQuizs?: number
    ){}
};

//ユーザーへのクイズレスポンススキーマ
export class QuestionResDTO {
    constructor(
        public lQuestionID: string,
        public audioScript: string,
        public jpnAudioScript: string,
        public audioURL: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        public duration: number
    ){}
};

//OpenAI APIへのクイズリクエストプロンプト
//prompt中でresで期待するクイズデータのスキーマを指定
export class NewQuizGenerateReqDTO {
    constructor(
        public prompt: string
    ){}
}

//OpenAI APIへからのres用のクイズデータスキーマ
export class GeneratedQuestionDataResDTO {
    constructor(
        public audioScript: string,
        public jpnAudioScript: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        //public Duration: number,
        public lQuestionID?: string
    ){}
}

//TTS APIへの音声データリクエスト
export class NewAudioReqDTO {
    constructor(
        public audioScript: string
    ){}
}

//TTS APIからの音声データres
export class GeneratedAudioResDTO {
    constructor(
        public Audio: string,// Base64エンコードされた音声データ
        public mimeType: 'audio/mp3' | 'audio/wav' | 'audio/ogg',
        public fileName: string,
        public duration: number
    ){}
}

//既存クイズnのリクエスト
export class ExistingLQuizReqDTO {
    constructor(
        public requestNumOfQuizs: number,
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean
    ){}
}


//ユーザーからの回答データPOST（リクエスト）
export class UserAnswerReqDTO {
    constructor(
        public lQuestionID: string, 
        public userID: string, 
        public userAnswerOption: "A"|"B"|"C"|"D", 
        public answerDate: Date,
        public reviewTag?: boolean
    ){}
};

//ユーザーへの正誤・解答データ送信（レスポンス）
export class UserAnswerResDTO {
    constructor(
        public lQuestionID: string,
        public trueOrFalse: boolean,
        public audioScript: string,
        public jpnAudioScript: string,
        public explanation: string
    ){}
}