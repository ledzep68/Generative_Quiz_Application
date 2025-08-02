import { describe, test, expect, beforeEach, afterAll, beforeAll, afterEach, vi, Mocked, Mock, MockedFunction } from 'vitest'
import { z } from "zod";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
//import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import {GoogleAuth} from "google-auth-library";
import { ChildProcess, spawn } from 'child_process'; //ライブラリを通さず、直接他プログラムを実行するためのライブラリ
import { EventEmitter } from 'events';
import fs from "fs/promises"; //音声バッファデータをローカルファイルに書き込むためのライブラリ
import path from "path";
import os from "os";
import createFetchMock from 'vitest-fetch-mock';
import { assert } from "console";

import { AccentType } from "../listening-quiz-transactions/services/lquizapiservice.ts";
import { start } from 'repl';
import { stderr } from 'process';


import * as service from "../listening-quiz-transactions/services/lquizapiservice.ts"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.ts";
import * as dto from "../listening-quiz-transactions/lquiz.dto.ts";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.ts";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.ts";

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
    /*
    test("B01_part3プロンプト生成", async () => {
        expect.assertions(8);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const result = await service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part3 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("**出題方法**: 2人または3人の会話を聞き、設問に対する答えを4つの選択肢から選ぶ");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題3の話者:");
        expect(result).toContain("問題4の話者:");
        expect(result).toContain("問題5の話者:");
    });
    test("B02_part2プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 2,
            requestedNumOfLQuizs: 10,
            speakingRate: 1.0
        };
        const result = await service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part2 の練習問題を10問生成してください。");
        expect(result).toContain("練習問題を10問生成");
        expect(result).toContain("**要件**: 自然な会話の流れに沿った適切な応答");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題3の話者:")
    });*/
    test("B03_part4プロンプト生成", async () => {
        expect.assertions(5);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const result = await service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part4 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題5の話者:")
    });
    /*
    test("B03_part4プロンプト生成_speakerAccent指定", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakerAccent: 'British',
            speakingRate: 1.0
        };
        const result = await service.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part4 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("British");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題5の話者:")
    });
    */
});
/*
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
        expect.assertions(3);
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
        expect(result).contains(`<?xml version="1.0" encoding="UTF-8"?>`);
        expect(result).contains(`xml:lang="en-GB"`);
        expect(result).contains(`<prosody rate="1">`);


    });
    test(`D03_escapeSSML（エスケープ処理確認）`, () => {
        expect.assertions(6);
        const testNewAudioRequest: Mocked<dto.NewAudioReqDTO[]> = [
            {
            lQuestionID: 'testID1',
            audioScript: `&<>"'`,
            speakerAccent: 'British',
            speakingRate: 1.0
            }
        ];
        const result = service.TOEICSSMLGenerator.generateSSML(testNewAudioRequest);
        console.log(result);
        expect(result).contains(`&amp;`);
        expect(result).contains(`&lt;`);
        expect(result).contains(`&gt;`);
        expect(result).contains(`&quot;`);
        expect(result).contains(`&apos;`);
        expect(result).not.toMatch(`/&(?!amp;|lt;|gt;|quot;|apos;)/`)
    })
});

describe(`E_validateSSML`, () => {
    test(`E01_SSML検証成功`, async () => {
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_start"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>


            <!-- Question 2: testID2 -->
            <mark name="q2_start"/>
            <prosody rate="1">
                Attention shoppers, we&apos;re pleased to announce our weekend sale. All electronics are 20% off until Sunday. Visit our electronics department on the third floor. <break time="1.5s"/> What is being announced? <break time="0.8s"/> A store closing. <break time="0.8s"/> A weekend sale. <break time="0.8s"/> New store hours. <break time="0.8s"/> A product recall.
            </prosody>
            <mark name="q2_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </speak>`
        const result = await service.validateSSML(testSSML);
        console.log(result);
        expect(result).toBe(undefined);
    });
    test(`E02_エラー_空SSML`, async () => {
        expect.assertions(1);
        const testSSML = ``;
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E03_エラー_<speak>欠如`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_start"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E03_エラー_音声分割用markタグ検証_q数字なし`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q_start"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E04_エラー_音声分割用markタグ検証_対象外の正規表現`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_begin"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E05_エラー_音声分割用markタグ検証_startMarksがnull`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E05_エラー_音声分割用markタグ検証_startMarksとendMarksの要素数が整合しない`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_begin"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>

            <!-- Question 2: testID2 -->
            <mark name="q2_begin"/>
            <mark name="q2_begin"/>
            <prosody rate="1">
                aaaaa
            </prosody>
            <mark name="q2_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
    test(`E05_エラー_音声分割用markタグ検証_要素数上限(10)越え`, async () => {
        expect.assertions(1);
        const testSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speaf version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_begin"/>
            <prosody rate="1">
                1
            </prosody>
            <mark name="q1_end"/>

            <!-- Question 2: testID2 -->
            <mark name="q2_begin"/>
            <prosody rate="1">
                2
            </prosody>
            <mark name="q2_end"/>

            <!-- Question 3: testID3 -->
            <mark name="q3_begin"/>
            <prosody rate="1">
                3
            </prosody>
            <mark name="q3_end"/>

            <!-- Question 4: testID4 -->
            <mark name="q4_begin"/>
            <prosody rate="1">
                4
            </prosody>
            <mark name="q4_end"/>

            <!-- Question 5: testID5 -->
            <mark name="q5_begin"/>
            <prosody rate="1">
                5
            </prosody>
            <mark name="q5_end"/>

            <!-- Question 6: testID6 -->
            <mark name="q6_begin"/>
            <prosody rate="1">
                6
            </prosody>
            <mark name="q6_end"/>

            <!-- Question 7: testID7 -->
            <mark name="q7_begin"/>
            <prosody rate="1">
                7
            </prosody>
            <mark name="q7_end"/>

            <!-- Question 8: testID8 -->
            <mark name="q8_begin"/>
            <prosody rate="1">
                8
            </prosody>
            <mark name="q8_end"/>

            <!-- Question 9: testID9 -->
            <mark name="q9_begin"/>
            <prosody rate="1">
                9
            </prosody>
            <mark name="q9_end"/>

            <!-- Question 10: testID10 -->
            <mark name="q10_begin"/>
            <prosody rate="1">
                10
            </prosody>
            <mark name="q10_end"/>

            <!-- Question 11: testID11 -->
            <mark name="q11_begin"/>
            <prosody rate="1">
                11
            </prosody>
            <mark name="q11_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </s>`
        await expect(service.validateSSML(testSSML)).rejects.toThrow(apierror.SSMLValidationError);
    });
})


describe(`F_extractQuestionTimeRangeList`, () => {
    test(`F01_時間範囲抽出成功`, async () => {
        const mockTimepoints = [
            { markName: "q1_start", timeSeconds: 0.5 },
            { markName: "q1_end", timeSeconds: 12.3 },
            { markName: "q2_start", timeSeconds: 13.0 },
            { markName: "q2_end", timeSeconds: 25.8 },
            { markName: "q3_start", timeSeconds: 26.5 },
            { markName: "q3_end", timeSeconds: 38.2 }
        ];

        const result = service.extractQuestionTimeRangeList(mockTimepoints);
        expect(result).toEqual([
            { startTime: 0.5, endTime: 12.3 },
            { startTime: 13.0, endTime: 25.8 },
            { startTime: 26.5, endTime: 38.2 }
        ]);
    });
});

describe(`G_音声切り出しモジュール群`, () => {
    //ffmpegを実際に動かしてテスト
    const ffmpegPath = '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/node_modules/ffmpeg-static/ffmpeg';

    describe(`G01_executeFFmpegProcess`, () => {
        let createdFiles: string[] = []; // 作成したファイルを記録
    
        afterEach(async () => {
            // 各テスト後にファイルをクリーンアップ
            for (const file of createdFiles) {
                await fs.unlink(file).catch(() => {});
            }
            createdFiles = []; // リセット
        });

        const startTime = 10.5;
        const endTime = 25.8;
        const duration = endTime - startTime;
        //テストファイル保存用ディレクトリ
        const testFilesDir = '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/__test__/testfiles';
            
        test(`G01-01_音声データ切り出し成功`, async () => {
            expect.assertions(1);

            const testFile = path.join(testFilesDir, `test_dynamic_${Date.now()}.mp3`);
        
            // テストファイル（短い音）を動的に生成
            await service.executeFFmpegProcess(ffmpegPath, [
                '-f', 'lavfi',
                '-i', 'sine=frequency=1000:duration=10', 
                '-acodec', 'libmp3lame',
                '-y',
                testFile
            ]);
            const outputFile = path.join(testFilesDir, `test_output_${Date.now()}.mp3`);

            createdFiles.push(testFile, outputFile);
            
            const mockedArgs = [
                '-i', testFile, 
                '-ss', startTime.toString(),  
                '-t', duration.toString(),
                '-acodec', 'libmp3lame', 
                '-b:a', '128k',                 
                '-y',                               
                outputFile                   
            ];

            await expect(service.executeFFmpegProcess(ffmpegPath, mockedArgs)).resolves.toBeUndefined();
        });
        test(`G01_02_失敗_存在しないファイル`, async () => {
            expect.assertions(1);
            await expect(service.executeFFmpegProcess(ffmpegPath, [
                '-i', '/nonexistent/file.mp3',
                'output.mp3'
            ])).rejects.toThrow(apierror.FFmpegError);
        });
        test(`G01_03_失敗_無効なオプション`, async () => {
            expect.assertions(1);
            await expect(service.executeFFmpegProcess(ffmpegPath, [
                'aaaaa'
            ])).rejects.toThrow(apierror.FFmpegError);
        });
        test(`G01_04_失敗_プロセス起動失敗`, async () => {
            expect.assertions(1);
            await expect(service.executeFFmpegProcess('/invalid/ffmpeg', ['-version']
            )).rejects.toThrow(apierror.FFmpegError);
        });
    });
    describe(`G02_extractMultipleAudioSegments（extractSingleSegmentも含む）`, () => {
        // 音声ファイルのモック
        const mockAudioBuffer = Buffer.from([
            // WAVファイルの最小限のヘッダー
            0x52, 0x49, 0x46, 0x46, // "RIFF"
            0x2C, 0x00, 0x00, 0x00, // ファイルサイズ
            0x57, 0x41, 0x56, 0x45, // "WAVE"
            0x66, 0x6D, 0x74, 0x20, // "fmt "
            0x10, 0x00, 0x00, 0x00, // Subchunk1Size
            0x01, 0x00, 0x01, 0x00, // AudioFormat, NumChannels
            0x44, 0xAC, 0x00, 0x00, // SampleRate
            0x88, 0x58, 0x01, 0x00, // ByteRate
            0x02, 0x00, 0x10, 0x00, // BlockAlign, BitsPerSample
            0x64, 0x61, 0x74, 0x61, // "data"
            0x08, 0x00, 0x00, 0x00, // データサイズ
            // 8バイトの音声データ
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        
        const mockTimeRangeList = [
            { startTime: 0.5, endTime: 12.3 },
            { startTime: 13.0, endTime: 25.8 },
            { startTime: 26.5, endTime: 38.2 }
        ];

        const mockLQuestionIDList = [
            "toeic-part4-q001",
            "toeic-part4-q002",
            "toeic-part4-q003"
        ];

        test(`G02_01_成功`, async () => {
            expect.assertions(2);
            const result = await service.extractMultipleAudioSegments(mockAudioBuffer, mockTimeRangeList, mockLQuestionIDList, ffmpegPath);
            expect(result.length).toBe(mockLQuestionIDList.length);
            expect(result[0]).haveOwnProperty('lQuestionID');
        })
    });
    describe(`G03_splitAudioByQuestions`, () => {
    const testFilesDir = path.join(__dirname, 'testfiles');

    // 5問分のテスト用MP3データを生成
    const generate5QuestionMP3 = async (): Promise<Buffer> => {
        const tempFiles: string[] = [];
        
        try {
            await fs.mkdir(testFilesDir, { recursive: true });
            
            // 各問題の音声ファイルを生成（異なる周波数で識別しやすく）
            const questionFiles = [
                // 問題1: 17.5秒、440Hz（ラの音）
                {
                    file: path.join(testFilesDir, 'question1.mp3'),
                    duration: 17.5,
                    frequency: 440
                },
                // 問題2: 16.8秒、523Hz（ドの音）
                {
                    file: path.join(testFilesDir, 'question2.mp3'),
                    duration: 16.8,
                    frequency: 523
                },
                // 問題3: 15.7秒、659Hz（ミの音）
                {
                    file: path.join(testFilesDir, 'question3.mp3'),
                    duration: 15.7,
                    frequency: 659
                },
                // 問題4: 16.5秒、784Hz（ソの音）
                {
                    file: path.join(testFilesDir, 'question4.mp3'),
                    duration: 16.5,
                    frequency: 784
                },
                // 問題5: 16.8秒、880Hz（高いラの音）
                {
                    file: path.join(testFilesDir, 'question5.mp3'),
                    duration: 16.8,
                    frequency: 880
                }
            ];

            // 各問題の音声を個別に生成
            for (const question of questionFiles) {
                await service.executeFFmpegProcess(ffmpegPath, [
                    '-f', 'lavfi',
                    '-i', `sine=frequency=${question.frequency}:duration=${question.duration}`,
                    '-acodec', 'libmp3lame',
                    '-b:a', '128k',
                    '-y',
                    question.file
                ]);
                tempFiles.push(question.file);
                console.log(`Generated: ${question.file} (${question.duration}s, ${question.frequency}Hz)`);
            }

            // 問題間の無音（0.5秒）を生成
            const silenceFile = path.join(testFilesDir, 'silence.mp3');
            await service.executeFFmpegProcess(ffmpegPath, [
                '-f', 'lavfi',
                '-i', 'anullsrc=duration=0.5',
                '-acodec', 'libmp3lame',
                '-b:a', '128k',
                '-y',
                silenceFile
            ]);
            tempFiles.push(silenceFile);

            // 連結用のリストファイルを作成
            const concatListFile = path.join(testFilesDir, 'concat_list.txt');
            const concatList = [
                `file '${questionFiles[0].file}'`,
                `file '${silenceFile}'`,
                `file '${questionFiles[1].file}'`,
                `file '${silenceFile}'`,
                `file '${questionFiles[2].file}'`,
                `file '${silenceFile}'`,
                `file '${questionFiles[3].file}'`,
                `file '${silenceFile}'`,
                `file '${questionFiles[4].file}'`
            ].join('\n');
            
            await fs.writeFile(concatListFile, concatList);
            tempFiles.push(concatListFile);

            // 5問分を連結
            const finalMP3File = path.join(testFilesDir, `5questions_${Date.now()}.mp3`);
            await service.executeFFmpegProcess(ffmpegPath, [
                '-f', 'concat',
                '-safe', '0',
                '-i', concatListFile,
                '-c', 'copy',
                '-y',
                finalMP3File
            ]);
            tempFiles.push(finalMP3File);

            console.log(`Final 5-question MP3 generated: ${finalMP3File}`);

            // 生成したMP3ファイルをBufferとして読み込み
            const audioBuffer = await fs.readFile(finalMP3File);
            console.log(`Audio buffer size: ${audioBuffer.length} bytes`);

            return audioBuffer;

        } finally {
            // 一時ファイルをクリーンアップ
            for (const file of tempFiles) {
                await fs.unlink(file).catch(() => {});
            }
        }
    };

    
    const timepoints = [
        // 問題1: 0.5秒〜15.8秒（15.3秒間）
        { markName: "q1_start", timeSeconds: 0.5 },
        { markName: "q1_end", timeSeconds: 15.8 },
        
        // 問題2: 16.5秒〜32.1秒（15.6秒間）
        { markName: "q2_start", timeSeconds: 16.5 },
        { markName: "q2_end", timeSeconds: 32.1 },
        
        // 問題3: 33.0秒〜48.7秒（15.7秒間）
        { markName: "q3_start", timeSeconds: 33.0 },
        { markName: "q3_end", timeSeconds: 48.7 },
        
        // 問題4: 49.5秒〜65.2秒（15.7秒間）
        { markName: "q4_start", timeSeconds: 49.5 },
        { markName: "q4_end", timeSeconds: 65.2 },
        
        // 問題5: 66.0秒〜81.8秒（15.8秒間）
        { markName: "q5_start", timeSeconds: 66.0 },
        { markName: "q5_end", timeSeconds: 81.8 }
    ];

    // 3. lQuestionIDList: 5問分の識別子
    const lQuestionIDList = [
        "toeic-part4-q001",
        "toeic-part4-q002", 
        "toeic-part4-q003",
        "toeic-part4-q004",
        "toeic-part4-q005"
    ];
    test(`G03_01_成功`, async () => {
        expect.assertions(26);
        const testAudioBuffer = await generate5QuestionMP3();
        const result = await service.splitAudioByQuestions(testAudioBuffer, timepoints, lQuestionIDList);
        expect(result.length).toBe(5);
        result.forEach((audioURL, index) => {
            expect(audioURL).toHaveProperty('lQuestionID', lQuestionIDList[index]);
            expect(audioURL).toHaveProperty('audioFilePath');
            expect(audioURL).toHaveProperty('audioURL');
            expect(audioURL).toHaveProperty('duration');
            const questionIDs = result.map(item => item.lQuestionID);
            expect(questionIDs).toEqual(lQuestionIDList);
        });
    }, 30000);
    })
});

// Google Auth自体をモック
vi.mock('google-auth-library', () => ({
    GoogleAuth: vi.fn().mockImplementation(() => ({
        getClient: vi.fn().mockResolvedValue({
            getAccessToken: vi.fn().mockResolvedValue({
                token: 'mock-access-token-for-testing',
                expiry_date: Date.now() + 3600000
            })
        })
    }))
}));

describe(`H_callGoogleCloudTTS`, () => {
    beforeEach(() => {
        vi.stubEnv('GOOGLE_APPLICATION_CREDENTIALS', './__test__/testkey.json');
        fetchMock.resetMocks();
        console.log('fetchMock type:', typeof fetchMock)
        console.log('global fetch:', typeof global.fetch)
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test(`H01_成功`, async () => {
        expect.assertions(3);

        const mockSSML = `<?xml version="1.0" encoding="UTF-8"?>
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
                <voice name="en-GB-Neural2-C">
                    <prosody rate="1">
                        <break time="1s"/>
                        
            <!-- Question 1: testID1 -->
            <mark name="q1_start"/>
            <prosody rate="1">
                Good evening, this is your captain speaking. We&apos;re currently cruising at 35,000 feet with clear skies ahead. Our estimated arrival time is 3:30 PM local time. <break time="1.5s"/> Who is speaking? <break time="0.8s"/> A flight attendant. <break time="0.8s"/> The captain. <break time="0.8s"/> Ground control. <break time="0.8s"/> A passenger.
            </prosody>
            <mark name="q1_end"/>


            <!-- Question 2: testID2 -->
            <mark name="q2_start"/>
            <prosody rate="1">
                Attention shoppers, we&apos;re pleased to announce our weekend sale. All electronics are 20% off until Sunday. Visit our electronics department on the third floor. <break time="1.5s"/> What is being announced? <break time="0.8s"/> A store closing. <break time="0.8s"/> A weekend sale. <break time="0.8s"/> New store hours. <break time="0.8s"/> A product recall.
            </prosody>
            <mark name="q2_end"/>

                        <break time="2s"/>
                    </prosody>
                </voice>
            </speak>`

    const mocklQuestionIDList = [
        "toeic-part4-q001",
        "toeic-part4-q002"
    ];

    const mockedResponse ={
        "audioContent": "UklGRv4CAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdoCAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        
        "timepoints": [
            {"markName": "q1_start", "timeSeconds": 1.2},
            {"markName": "q1_end", "timeSeconds": 28.5},
            {"markName": "q2_start","timeSeconds": 29.1},
            {"markName": "q2_end", "timeSeconds": 52.8}
        ]
    };
    vi.spyOn(service, 'getGoogleAccessToken').mockImplementationOnce(() => Promise.resolve("mockedAccessToken"));

     //fetchモック
    fetchMock.mockResponseOnce(
        JSON.stringify(mockedResponse),
        {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const result = await service.callGoogleCloudTTS(mockSSML, mocklQuestionIDList);
    expect(result.length).toBe(2);
    expect(result[0].lQuestionID).toBe(mocklQuestionIDList[0]);
    expect(result[1].lQuestionID).toBe(mocklQuestionIDList[1]);
    }, 30000);
});

*/