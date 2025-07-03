import { describe, test, expect, beforeEach, afterAll, beforeAll, afterEach, vi, Mocked, Mock } from 'vitest'
import * as service from "../listening-quiz-transactions/services/lquizapiservice.js"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.js";
import * as dto from "../listening-quiz-transactions/lquiz.dto.js";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.js";
//import fetch from "node-fetch";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.js";
import { z } from "zod";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
//import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import {GoogleAuth} from "google-auth-library";
import { spawn } from 'child_process'; //ライブラリを通さず、直接他プログラムを実行するためのライブラリ
import fs from "fs/promises"; //音声バッファデータをローカルファイルに書き込むためのライブラリ
import path from "path";
import os from "os";
import createFetchMock from 'vitest-fetch-mock';
import { assert } from "console";


import { AccentType } from "../listening-quiz-transactions/services/lquizapiservice.js";


describe('A_getRandomSpeakerAccent', () => {
    test("A01_ランダムに発話アクセントを取得", async () => {
        expect.assertions(12);
        const result = service.getRandomSpeakerAccent(10);

        // 配列の長さを確認
        expect(result.length).toBe(10);

        // 各要素がAccentTypeのいずれかであることを確認
        const validAccents: AccentType[] = ["American", "Canadian", "British", "Australian"];
        result.forEach(accent => {
            expect(validAccents).toContain(accent);
        });

        console.log(result);

        // 配列全体がAccentType[]の要素のみで構成されていることを確認
        expect(result.every(accent => validAccents.includes(accent))).toBe(true);
    });
});

describe('B_generatePrompt', () => {
    test("B01_part3プロンプト生成", async () => {
        expect.assertions(8);
        const mockDomObj: Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfQuizs: 5,
            speakingRate: 1.0
        };
        const result = service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part3 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("出題方法: 2人または3人の会話を聞き、設問に対する答えを4つの選択肢から選ぶ");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題3の話者:");
        expect(result).toContain("問題4の話者:");
        expect(result).toContain("問題5の話者:");
    });
    test("B02_part2プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 2,
            requestedNumOfQuizs: 10,
            speakingRate: 1.0
        };
        const result = service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part2 の練習問題を10問生成してください。");
        expect(result).toContain("練習問題を10問生成");
        expect(result).toContain("要件: 自然な会話の流れに沿った適切な応答");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題3の話者:")
    });
    test("B03_part4プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfQuizs: 5,
            speakingRate: 1.0
        };
        const result = service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part4 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("音声構造: トーク内容 + 設問文 + 4つの選択肢を連続して読み上げ（A, B, C, Dの順序で）");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題5の話者:")
    });
});

const fetchMock = createFetchMock (vi);
fetchMock.enableMocks();

describe('C_callChatGPT', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        console.log('fetchMock type:', typeof fetchMock)
        console.log('global fetch:', typeof global.fetch)
    });

    const testprompt = `TOEICリスニング Part4 の練習問題を5問生成してください。
    
    ## Part4 仕様
    - 問題形式: 説明文問題
    - 出題方法: 短いトークを聞き、設問に対する答えを4つの選択肢から選ぶ
    - 要件: アナウンス、広告、会議、講演などの実用的な内容
    - 音声構造: トーク内容 + 設問文 + 4つの選択肢を連続して読み上げ（A, B, C, Dの順序で）
    
    
    **問題1の話者:**
    - 英語種別: オーストラリア英語 (Australian)
    - 発音特徴: Vowel shifts: 'day' → 'die'のような音, Rising intonation: 平叙文でも語尾が上がる
    - 語彙の特徴: arvo (afternoon), brekkie (breakfast)
    - 表現の特徴: No worries, mate, Fair dinkum
    
    **問題2の話者:**
    - 英語種別: イギリス英語 (British)
    - 発音特徴: Non-rhotic: 語尾のrを発音しない, Received Pronunciation (RP)の特徴
    - 語彙の特徴: lift (not elevator), flat (not apartment)
    - 表現の特徴: Brilliant!, Cheers
    
    **問題3の話者:**
    - 英語種別: アメリカ英語 (American)
    - 発音特徴: Rhoticity: 語尾のrを明確に発音, Flat 'a': cat, hat等で平坦な'a'音
    - 語彙の特徴: elevator (not lift), apartment (not flat)
    - 表現の特徴: I guess..., You bet!
    
    **問題4の話者:**
    - 英語種別: イギリス英語 (British)
    - 発音特徴: Non-rhotic: 語尾のrを発音しない, Received Pronunciation (RP)の特徴
    - 語彙の特徴: lift (not elevator), flat (not apartment)
    - 表現の特徴: Brilliant!, Cheers
    
    **問題5の話者:**
    - 英語種別: イギリス英語 (British)
    - 発音特徴: Non-rhotic: 語尾のrを発音しない, Received Pronunciation (RP)の特徴
    - 語彙の特徴: lift (not elevator), flat (not apartment)
    - 表現の特徴: Brilliant!, Cheers
    
    
    ## 生成要件
    
    ### audioScript（音声読み上げ内容）の構成
    **Part 1の場合:**
    - 4つの選択肢のみを連続して読み上げ
    - 各選択肢の前に「A」「B」「C」「D」は付けない
    - 例: "A man is reading a newspaper. [短い間] Two women are walking. [短い間] Children are playing in the park. [短い間] A dog is running."
    
    **Part 2の場合:**
    - 質問文 + 短い間 + 3つの選択肢を連続して読み上げ
    - 質問文の後に適切な間を置く
    - 選択肢の前に「A」「B」「C」は付けない
    - 例: "Where is the meeting room? [間] Down the hallway to your right. [短い間] Yes, I'll attend the meeting. [短い間] The meeting starts at 3 PM."
    
    **Part 3の場合:**
    - 会話文 + 設問文 + 4つの選択肢を連続して読み上げ
    - 複数の話者がいる場合は自然な会話として構成
    - 例: "Good morning, Sarah. Did you finish the quarterly report? [間] Almost done, Mike. I just need to add the sales figures. [間] Great, we need to submit it by noon today."
    
    **Part 4の場合:**
    - トーク内容 + 設問文 + 4つの選択肢を連続して読み上げ
    - アナウンス、プレゼンテーション、広告などの形式
    - 例: "Welcome to City Bank. We are pleased to announce our new mobile banking service. Starting next month, you can access your account anytime, anywhere."
    
    ### その他の生成項目
    - jpnAudioScript: audioScriptの日本語訳（必須）
    - answerOption: 正解選択肢（Part1,3,4の場合は"A", "B", "C", "D"のいずれか。Part2の場合だけ"A", "B", "C"のいずれか）（必須）
    - sectionNumber: 問題のセクション番号。Part1,2,3,4のいずれか（必須）
    - explanation: 解説（必須）
    - speakerAccent: 各問題ごとに指定されたアクセント
    
    ## 出力形式
    必ずJSON形式で以下の構造で回答してください：
    
    {
      "questions": [
          // 問題1: Australian英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "sectionNumber": 4,
        "explanation": "string",
        "speakerAccent": "Australian"
        },
        // 問題2: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "sectionNumber": 4,
        "explanation": "string",
        "speakerAccent": "British"
        },
        // 問題3: American英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "sectionNumber": 4,
        "explanation": "string",
        "speakerAccent": "American"
        },
        // 問題4: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "sectionNumber": 4,
        "explanation": "string",
        "speakerAccent": "British"
        },
        // 問題5: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "sectionNumber": 4,
        "explanation": "string",
        "speakerAccent": "British"
        }
      ]
    }
    
    ## 重要な注意事項
    1. **audioScript内での選択肢の順序**: 必ずA→B→C→(D)の順序で音声内容を構成
    2. **選択肢ラベルの省略**: audioScript内では「A」「B」「C」「D」のラベルは読み上げない
    3. **適切な間の配置**: 文と文の間、質問と回答の間に自然な間を想定した構成
    4. **Part別の音声構成の遵守**: 各Partの音声構造ルールを厳密に守る
    5. **読み上げ時間の考慮**: 1つの問題の音声は30秒以内に収まるよう調整
    
    ## 品質基準
    - TOEIC公式問題集レベルの難易度
    - 各問題で指定されたアクセントの語彙・表現・発音特徴を自然に組み込む
    - 文法・語彙は中級~上級レベル（TOEIC 600-990点相当）
    - 音声として聞いた時の自然さを重視
    - 選択肢も実際のTOEIC試験レベルの紛らわしさを持つ`;

        const mockResponseData = {
            "id": "chatcmpl-8XXXxxxxxxxxxxxxxxxxxxxxxx",
            "object": "chat.completion",
            "created": 1704067200,
            "model": "gpt-4o",
            "choices": [
                {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": JSON.stringify([
                        {
                            "audioScript": "Good morning, passengers. This is a safety announcement for Flight 247 to Sydney. Please ensure your seatbelts are fastened and tray tables are in the upright position. We will be experiencing some turbulence shortly. [間] What is the purpose of this announcement? [短い間] To inform passengers about meal service. [短い間] To announce a flight delay. [短い間] To provide safety instructions. [短い間] To welcome passengers aboard.",
                            "jpnAudioScript": "おはようございます、乗客の皆様。シドニー行きフライト247の安全に関するアナウンスです。シートベルトを締め、テーブルを直立位置にしてください。まもなく乱気流を経験します。[間] このアナウンスの目的は何ですか？[短い間] 機内食サービスについて知らせるため。[短い間] フライトの遅延を発表するため。[短い間] 安全指示を提供するため。[短い間] 乗客を歓迎するため。",
                            "answerOption": "C",
                            "sectionNumber": 4,
                            "explanation": "このアナウンスでは安全に関する指示（シートベルト着用、テーブル直立）と乱気流の警告をしているため、安全指示の提供が目的です。",
                            "speakerAccent": "Australian"
                        },
                        {
                            "audioScript": "Attention shoppers, we're pleased to announce our weekend sale. All electronics are 20% off until Sunday. Visit our electronics department on the third floor. [間] What is being announced? [短い間] A store closing. [短い間] A weekend sale. [短い間] New store hours. [短い間] A product recall.",
                            "jpnAudioScript": "お客様にお知らせいたします。週末セールを開催いたします。すべての電化製品が日曜日まで20%オフです。3階の電化製品売り場にお越しください。[間] 何がアナウンスされていますか？[短い間] 店舗の閉店。[短い間] 週末セール。[短い間] 新しい営業時間。[短い間] 製品のリコール。",
                            "answerOption": "B",
                            "sectionNumber": 4,
                            "explanation": "週末セールについてのアナウンスで、電化製品が20%オフになることを告知しています。",
                            "speakerAccent": "British"
                        },
                        {
                            "audioScript": "Welcome to City Bank. We are pleased to announce our new mobile banking service. Starting next month, you can access your account anytime, anywhere. [間] What is the main topic? [短い間] Bank closure. [短い間] New mobile service. [短い間] Interest rate changes. [短い間] Branch relocation.",
                            "jpnAudioScript": "シティバンクへようこそ。新しいモバイルバンキングサービスをお知らせいたします。来月から、いつでもどこでもアカウントにアクセスできます。[間] 主なトピックは何ですか？[短い間] 銀行の閉鎖。[短い間] 新しいモバイルサービス。[短い間] 金利の変更。[短い間] 支店の移転。",
                            "answerOption": "B",
                            "sectionNumber": 4,
                            "explanation": "新しいモバイルバンキングサービスの開始について説明しています。",
                            "speakerAccent": "American"
                        },
                        {
                            "audioScript": "Good evening, this is your captain speaking. We're currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. [間] Who is speaking? [短い間] A flight attendant. [短い間] The captain. [短い間] Ground control. [短い間] A passenger.",
                            "jpnAudioScript": "こんばんは、機長です。現在高度35,000フィートを巡航中で、前方は晴天です。到着予定時刻は現地時間午後3時30分です。[間] 誰が話していますか？[短い間] 客室乗務員。[短い間] 機長。[短い間] 管制塔。[短い間] 乗客。",
                            "answerOption": "B",
                            "sectionNumber": 4,
                            "explanation": "「機長です」と明確に自己紹介をしています。",
                            "speakerAccent": "British"
                        },
                        {
                            "audioScript": "Thank you for calling Tech Support. All our representatives are currently busy. Your estimated wait time is 5 minutes. [間] What type of call is this? [短い間] Sales inquiry. [短い間] Technical support. [短い間] Billing question. [短い間] General information.",
                            "jpnAudioScript": "テクニカルサポートにお電話いただきありがとうございます。現在すべての担当者が対応中です。お待ち時間は約5分です。[間] これはどのような電話ですか？[短い間] 販売に関する問い合わせ。[短い間] 技術サポート。[短い間] 請求に関する質問。[短い間] 一般的な情報。",
                            "answerOption": "B",
                            "sectionNumber": 4,
                            "explanation": "「テクニカルサポート」への電話であることが明確に示されています。",
                            "speakerAccent": "British"
                        }
                    ])
                },
                "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 1250,
                "completion_tokens": 800,
                "total_tokens": 2050
            }
        };

        test("C01_api呼出テスト", async () => {
        //fetchモック
        fetchMock.mockResponseOnce(
            JSON.stringify(mockResponseData),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'application/json'
                    //'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            // fetchMockが正しく設定されているか確認
        
        expect.assertions(8);
        const result = await service.callChatGPT(testprompt);
        console.log('fetchMock was called:', fetchMock.mock.calls.length, 'times')
        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        console.log(result);
        
        // 最初の問題の構造を確認
        const firstQuestion = result[0]
        expect(firstQuestion).toHaveProperty('audioScript')
        expect(firstQuestion).toHaveProperty('jpnAudioScript')
        expect(firstQuestion).toHaveProperty('answerOption')
        expect(firstQuestion).toHaveProperty('explanation')
        expect(firstQuestion).toHaveProperty('speakerAccent')

        /*
        //OpenAI APIからのres用のクイズデータスキーマ
        export class GeneratedQuestionDataResDTO {
            constructor(
                public audioScript: string,
                public jpnAudioScript: string,
                public answerOption: "A"|"B"|"C"|"D",
                public sectionNumber: 1|2|3|4,
                public explanation: string,
                public lQuestionID?: string
            ){}
        };
        */
    });
});

describe(`D_TOEICSSMLGenerator`, () => {

    test(`D01_selectRandomVoice（voicesのランダム選択）`, async () => {
        expect.assertions(2);
        const testVoiceSettings = {
        languageCode: 'en-AU',
        voices: [
            { name: 'en-AU-Neural2-A', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-B', gender: 'MALE' },
            { name: 'en-AU-Neural2-C', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-D', gender: 'MALE' }
        ]
        };
        const result = service.TOEICSSMLGenerator.selectRandomVoice(testVoiceSettings.voices);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('gender');
    });
    test(`D02_generateSSML（SSML生成）`, async () => {
        expect.assertions(1);
        const testNewAudioRequest: Mocked<dto.NewAudioReqDTO[]> = [
            {
            lQuestionID: 'testID1',
            audioScript: "Good evening, this is your captain speaking. We're currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. [間] Who is speaking? [短い間] A flight attendant. [短い間] The captain. [短い間] Ground control. [短い間] A passenger.",
            speakerAccent: 'British',
            speakingRate: 1.0
            },
            {
            lQuestionID: 'testID2',
            audioScript: "Attention shoppers, we're pleased to announce our weekend sale. All electronics are 20% off until Sunday. Visit our electronics department on the third floor. [間] What is being announced? [短い間] A store closing. [短い間] A weekend sale. [短い間] New store hours. [短い間] A product recall.",
            speakerAccent: 'Australian',
            speakingRate: 1.0
            }
        ];
        const result = service.TOEICSSMLGenerator.generateSSML(testNewAudioRequest);
        console.log(result);
        expect(result).contains(`<?xml version="1.0" encoding="UTF-8"?>`)

        /*
        export class NewAudioReqDTO {
            constructor(
                public lQuestionID: string,
                public audioScript: string,
                public speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian',
                public speakingRate: number
            ){}
        }
        */
    });
});