import * as dto from "./dto.ts";

//共通の状態管理パラメータ
interface stateManagementParameters {
    //ユーザ入力のバリデーション結果
    isValid?: boolean,
    validationErrors?: string[],
    //クイズリクエストの状態
    requestStatus?: 'idle' | 'pending' | 'success' | 'failed',
    //タイムスタンプ
    submittedAt?: number
}

export interface CurrentScreenState {
    currentScreen: 'standby' | 'answer' | 'result'
};

//新規クイズデータリクエストの状態管理
export interface RandomNewQuestionRequestState extends stateManagementParameters {
    //リクエスト
    requestParams: dto.RandomNewQuestionReqDTO;
    //レスポンスのクイズデータ
    questions?: dto.QuestionResDTO[]
};

//音声データの状態管理
export interface AudioState extends stateManagementParameters {
    requestParams: {
        //次問題のId
        currentLQuestionId?: string
    },
    audioData?: File
    //音声再生準備完了
    isAudioReadyToPlay: boolean
    //音声再生開始
    audioStart: boolean
};

//クイズのIDリストとindexの状態管理
export interface QuestionIndexState extends stateManagementParameters {
    lQuestionIdList: string[];
    currentQuestionIndex: 0|1|2|3|4|5|6|7|8|9;
    //問題数の終点検知
    isLastQuestion?: boolean 
    //answers: Record<string, string>;
};

//正誤判定および解答データリクエストの状態管理
export interface AnswerRequestState extends stateManagementParameters {
    requestParams?: dto.UserAnswerReqDTO[],
    answerData?: dto.UserAnswerResDTO[]
};


/*
//新規クイズリクエストスキーマ（ランダム生成、ID非指定）
export interface RandomNewQuestionReqDTO {
    sectionNumber :1|2|3|4,
    requestedNumOfLQuizs: number,
    speakingRate?: number
};


//復習クイズリクエストスキーマ（ランダム、ID非指定）
export interface RandomReviewQuestionReqDTO {
    userID: string,
    sectionNumber: 1|2|3|4,
    reviewTag: boolean,
    requestedNumOfLQuizs?: number,
    speakingRate?: number 
};

//復習クイズリクエストスキーマ（ID指定）
export interface ReviewQuestionReqDTO {
    lQuestionID: string,
    userID: string,
    sectionNumber: 1|2|3|4,
    reviewTag: boolean,
    speakingRate?: number
};

//サーバーからのクイズレスポンスDTO 新規・既存共通
export interface QuestionResDTO {
    lQuestionID: string,
    audioScript: string,
    jpnAudioScript: string,
    answerOption: "A"|"B"|"C"|"D",
    sectionNumber: 1|2|3|4,
    explanation: string,
    speakerAccent: "American" | "British" | "Canadian" | "Australian",
    speakingRate: number,
    duration: number,
    audioURL: string
};
/*
//OpenAI APIへのクイズリクエストプロンプト
//prompt中でresで期待するクイズデータのスキーマを指定
export class NewQuizGenerateReqDTO {
    constructor(
        public prompt: string
    ){}
}

//OpenAI APIからのres用のクイズデータスキーマ
export class GeneratedQuestionDataResDTO {
    constructor(
        public audioScript: string,
        public jpnAudioScript: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        public speakerAccent: "American" | "British" | "Canadian" | "Australian"
       // public lQuestionID?: string
    ){}
};

//TTS APIへの音声データリクエスト
export class NewAudioReqDTO {
    constructor(
        public lQuestionID: string,
        public audioScript: string,
        public speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian',
        public speakingRate: number
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



//回答データリクエスト
export interface UserAnswerReqDTO {
    lQuestionID: string, 
    serID: string, 
    userAnswerOption: "A"|"B"|"C"|"D", 
    answerDate: Date,
    reviewTag?: boolean
};

//正誤・解答データレスポンス
export interface UserAnswerResDTO {
    lQuestionID: string,
    trueOrFalse: boolean,
    audioScript: string,
    jpnAudioScript: string,
    explanation: string
}
*/