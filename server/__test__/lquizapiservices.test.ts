import { jest } from '@jest/globals';
// Node.js組み込みfetchを無効化
delete (global as any).fetch;
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
import fetchMock, {manageFetchMockGlobally} from "@fetch-mock/jest";
import { assert } from "console";


import { AccentType } from "../listening-quiz-transactions/services/lquizapiservice.js";


/*describe('A_getRandomSpeakerAccent', () => {
    test("A01_ランダムに発話アクセントを取得", async () => {
        expect.assertions(12);
        const result = seivice.getRandomSpeakerAccent(10);

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
        const mockDomObj: jest.Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfQuizs: 5,
            speakingRate: 1.0
        };
        const result = seivice.generatePrompt(mockDomObj);
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
        const mockDomObj: jest.Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 2,
            requestedNumOfQuizs: 10,
            speakingRate: 1.0
        };
        const result = seivice.generatePrompt(mockDomObj);
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
        const mockDomObj: jest.Mocked<domein.NewQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfQuizs: 5,
            speakingRate: 1.0
        };
        const result = seivice.generatePrompt(mockDomObj);
        console.log(result);
        expect(result).toContain("TOEICリスニング Part4 の練習問題を5問生成してください。");
        expect(result).toContain("練習問題を5問生成");
        expect(result).toContain("音声構造: トーク内容 + 設問文 + 4つの選択肢を連続して読み上げ（A, B, C, Dの順序で）");
        expect(result).toContain("問題1の話者:");
        expect(result).toContain("問題2の話者:");
        expect(result).toContain("問題5の話者:")
    });
});*/

fetchMock.mockGlobal();

test("fetchMock設定確認", () => {
    fetchMock.mockGlobal();
    
    // 設定されているルートを確認
    console.log('Routes:', fetchMock.route);
    
    // グローバルfetchが置き換えられているか確認
    console.log('fetch type:', typeof fetch);
    console.log('global.fetch type:', typeof global.fetch);
});

describe('C_callChatGPT', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.clearHistory();
    });

    test("C01_api呼出テスト", async () => {
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
        "explanation": "string",
        "speakerAccent": "Australian"
        },
        // 問題2: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "explanation": "string",
        "speakerAccent": "British"
        },
        // 問題3: American英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "explanation": "string",
        "speakerAccent": "American"
        },
        // 問題4: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
        "explanation": "string",
        "speakerAccent": "British"
        },
        // 問題5: British英語使用
        {
        "audioScript": "string (トーク内容+設問文+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": "A"|"B"|"C"|"D",
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
                    "content": "{\"questions\":[{\"audioScript\":\"Good morning, passengers. This is a safety announcement for Flight 247 to Sydney. Please ensure your seatbelts are fastened and tray tables are in the upright position. We will be experiencing some turbulence shortly. [間] What is the purpose of this announcement? [短い間] To inform passengers about meal service. [短い間] To announce a flight delay. [短い間] To provide safety instructions. [短い間] To welcome passengers aboard.\",\"jpnAudioScript\":\"おはようございます、乗客の皆様。シドニー行きフライト247の安全に関するアナウンスです。シートベルトを締め、テーブルを直立位置にしてください。まもなく乱気流を経験します。[間] このアナウンスの目的は何ですか？[短い間] 機内食サービスについて知らせるため。[短い間] フライトの遅延を発表するため。[短い間] 安全指示を提供するため。[短い間] 乗客を歓迎するため。\",\"answerOption\":\"C\",\"explanation\":\"このアナウンスでは安全に関する指示（シートベルト着用、テーブル直立）と乱気流の警告をしているため、安全指示の提供が目的です。\",\"speakerAccent\":\"Australian\"},{\"audioScript\":\"...\",\"jpnAudioScript\":\"...\",\"answerOption\":\"B\",\"explanation\":\"...\",\"speakerAccent\":\"British\"}...]}"
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

        //fetchモック
        fetchMock.post(
            'https://api.openai.com/v1/chat/completions',
            mockResponseData,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer test-openai-key`
                },
                body: {
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたはTOEIC問題作成の専門家です。指定された仕様に従ってJSON形式で問題を生成してください。"
                        },
                        {
                            role: "user",
                            content: testprompt
                        }
                    ],
                    temperature: 0,
                    max_tokens: 2000,
                    response_format: { type: "json_object" }
                } //fetch-mockはJSON.stringifyをデフォルト処理する
            });
            // fetchMockが正しく設定されているか確認
        
        expect.assertions(1);
        const reslut = await service.callChatGPT(testprompt);
        console.log('calls:', fetchMock.callHistory);
        expect(reslut).toEqual(mockResponseData);

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