/*********************************************

lquiz.dto.ts : requestとresponse用のデータ構造定義
                クラスは継承させない（依存関係複雑化回避のため）　型定義、簡易バリデーションのみ

*********************************************/

//ユーザーからのクイズリクエスト
export class NewQuizReqDTOFromUser {
    constructor(
        public requestedNumOfLQuizs: number,
        public sectionNumber: 1|2|3|4
    ){}
}

//OpenAI APIへのクイズリクエストプロンプト
//prompt中でresで期待するクイズデータのスキーマを指定
export class NewQuizGenerateReqDTO {
    constructor(
        public prompt: string
    ){}
}

//OpenAI APIへからのres用のクイズデータスキーマ
export class NewQuizResDTO {
    constructor(
        public AudioScript: string,
        public JPNAudioScript: string,
        public AnswerOption: "A"|"B"|"C"|"D",
        public SectionNumber: 1|2|3|4,
        public Explanation: string,
        public Duration: number
    ){}
}

//TTS APIへの音声データリクエスト
export class NewQuizAudioReqDTO {
    constructor(
        public AudioScript: string
    ){}
}
export class NewQuizAudioResDTO {
    constructor(
        public Audio: string,// Base64エンコードされた音声データ
        public mimeType: 'audio/mp3' | 'audio/wav' | 'audio/ogg',
        public fileName: string,
        public duration: number
    ){}
}

export class ExistingLQuizReqDTO {
    constructor(
        public requestNumOfQuizs: number,
        public sectionNumber: 1|2|3|4,
        public reviewTag: boolean
    ){}
}

export class LQuizResDTO {
    constructor(
        public lQuestionID: string,
        public audioURL: string
    ){}
}