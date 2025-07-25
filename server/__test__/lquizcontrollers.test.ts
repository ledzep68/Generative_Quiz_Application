import { describe, test, expect, beforeEach, afterAll, beforeAll, afterEach, vi, Mocked, Mock, MockedFunction } from 'vitest'
import { Request, Response } from 'express';
import * as controller from "../listening-quiz-transactions/lquizcontrollers.ts"
import * as service from "../listening-quiz-transactions/services/lquizapiservice.ts"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.ts";
import * as dto from "../listening-quiz-transactions/lquiz.dto.ts";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.ts";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.ts";

vi.mock('../listening-quiz-transactions/services/lquizapiservice', () => ({
    generateLQuestionContent: vi.fn().mockImplementation(
        (domObj: domein.NewQuestionInfo) => {
            return [
                {
                    audioScript: 'Good morning, passengers. This is a safety announcement for Flight 247 to Sydney. Please ensure your seatbelts are fastened and tray tables are in the upright position. We will be experiencing some turbulence shortly. [間] What is the purpose of this announcement? [短い間] To inform passengers about meal service. [短い間] To announce a flight delay. [短い間] To provide safety instructions. [短い間] To welcome passengers aboard.',
                    jpnAudioScript: 'おはようございます、乗客の皆様。シドニー行きフライト247の安全に関するアナウンスです。シートベルトを締め、テーブルを直立位置にしてください。まもなく乱気流を経験します。[間] このアナウンスの目的は何ですか？[短い間] 機内食サービスについて知らせるため。[短い間] フライトの遅延を発表するため。[短い間] 安全指示を提供するため。[短い間] 乗客を歓迎するため。',
                    answerOption: 'C',
                    sectionNumber: 4,
                    explanation: 'このアナウンスでは安全に関する指示（シートベルト着用、テーブル直立）と乱気流の警告をしているため、安全指示の提供が目的です。',
                    speakerAccent: 'Australian'
                },
                {
                    audioScript: "Attention shoppers, we're pleased to announce our weekend sale. All electronics are 20% off until Sunday. Visit our electronics department on the third floor. [間] What is being announced? [短い間] A store closing. [短い間] A weekend sale. [短い間] New store hours. [短い間] A product recall.",
                    jpnAudioScript: 'お客様にお知らせいたします。週末セールを開催いたします。すべての電化製品が日曜日まで20%オフです。3階の電化製品売り場にお越しください。[間] 何がアナウンスされていますか？[短い間] 店舗の閉店。[短い間] 週末セール。[短い間] 新しい営業時間。[短い間] 製品のリコール。',
                    answerOption: 'B',
                    sectionNumber: 4,
                    explanation: '週末セールについてのアナウンスで、電化製品が20%オフになることを告知しています。',
                    speakerAccent: 'British'
                },
                {
                    audioScript: 'Welcome to City Bank. We are pleased to announce our new mobile banking service. Starting next month, you can access your account anytime, anywhere. [間] What is the main topic? [短い間] Bank closure. [短い間] New mobile service. [短い間] Interest rate changes. [短い間] Branch relocation.',
                    jpnAudioScript: 'シティバンクへようこそ。新しいモバイルバンキングサービスをお知らせいたします。来月から、いつでもどこでもアカウントにアクセスできます。[間] 主なトピックは何ですか？[短い間] 銀行の閉鎖。[短い間] 新しいモバイルサービス。[短い間] 金利の変更。[短い間] 支店の移転。',
                    answerOption: 'B',
                    sectionNumber: 4,
                    explanation: '新しいモバイルバンキングサービスの開始について説明しています。',
                    speakerAccent: 'American'
                },
                {
                    audioScript: "Good evening, this is your captain speaking. We're currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. [間] Who is speaking? [短い間] A flight attendant. [短い間] The captain. [短い間] Ground control. [短い間] A passenger.",
                    jpnAudioScript: 'こんばんは、機長です。現在高度35,000フィートを巡航中で、前方は晴天です。到着予定時刻は現地時間午後3時30分です。[間] 誰が話していますか？[短い間] 客室乗務員。[短い間] 機長。[短い間] 管制塔。[短い間] 乗客。',
                    answerOption: 'B',
                    sectionNumber: 4,
                    explanation: '「機長です」と明確に自己紹介をしています。',
                    speakerAccent: 'British'
                },
                {
                    audioScript: 'Thank you for calling Tech Support. All our representatives are currently busy. Your estimated wait time is 5 minutes. [間] What type of call is this? [短い間] Sales inquiry. [短い間] Technical support. [短い間] Billing question. [短い間] General information.',
                    jpnAudioScript: 'テクニカルサポートにお電話いただきありがとうございます。現在すべての担当者が対応中です。お待ち時間は約5分です。[間] これはどのような電話ですか？[短い間] 販売に関する問い合わせ。[短い間] 技術サポート。[短い間] 請求に関する質問。[短い間] 一般的な情報。',
                    answerOption: 'B',
                    sectionNumber: 4,
                    explanation: '「テクニカルサポート」への電話であることが明確に示されています。',
                    speakerAccent: 'British'
                }
            ]
        }
    ),
    generateAudioContent: vi.fn().mockImplementation(
        (newAudioReqDTOList: dto.GeneratedQuestionDataResDTO[], lQuestionIDList: string[]) => {
            return [
                {
                    lQuestionID: 'toeic-part4-q001',
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q001_20250707125209./audio_segment.mp3',
                    audioURL: '/api/listening-quiz/lQuestion_toeic-part4-q001_20250707125209./audio_segment.mp3',
                    duration: 15.3
                },
                {
                    lQuestionID: 'toeic-part4-q002',
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q002_20250707125209./audio_segment.mp3',
                    audioURL: '/api/listening-quiz/lQuestion_toeic-part4-q002_20250707125209./audio_segment.mp3',
                    duration: 15.600000000000001
                },
                {
                    lQuestionID: 'toeic-part4-q003',
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q003_20250707125209./audio_segment.mp3',
                    audioURL: '/api/listening-quiz/lQuestion_toeic-part4-q003_20250707125209./audio_segment.mp3',
                    duration: 15.700000000000003
                },
                {
                    lQuestionID: 'toeic-part4-q004',
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q004_20250707125209./audio_segment.mp3',
                    audioURL: '/api/listening-quiz/lQuestion_toeic-part4-q004_20250707125209./audio_segment.mp3',
                    duration: 15.700000000000003
                },
                {
                    lQuestionID: 'toeic-part4-q005',
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q005_20250707125209./audio_segment.mp3',
                    audioURL: '/api/listening-quiz/lQuestion_toeic-part4-q005_20250707125209./audio_segment.mp3',
                    duration: 15.799999999999997
                }
            ]
        }
    )
}));

vi.mock('../listening-quiz-transactions/services/lquizbusinessservice', () => ({
    generateLQuestionID: vi.fn().mockImplementation(
        (requestedNumOfLQuizs: number) => {
            return [
            "toeic-part4-q001",
            "toeic-part4-q002",
            "toeic-part4-q003",
            "toeic-part4-q004",
            "toeic-part4-q005"
        ]
        }
    ),
    newQuestionDataInsert: vi.fn().mockImplementation((mockedQuestionDataList: dto.GeneratedQuestionDataResDTO, mockedAudioURLList: domein.AudioURL[], speakingRate: number) => {
        return true
    })
}));

const MockedReq = {
    body: {
        QuestionReqDTO: {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1
        }
    }
} as unknown as Request;

const MockedRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
} as unknown as Response; 

describe('A_generateQuestionController', () => {
    test(`A01_成功`, async () => {
        expect.assertions(1);
        const result = await controller.generateQuestionController(MockedReq, MockedRes);
        expect(MockedRes.status).toHaveBeenCalledWith(200);
    })
});