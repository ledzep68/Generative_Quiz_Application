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
/*
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

describe('B_generateAudioScriptPrompt', () => {
    test("B01_part3プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 1, // 単一問題生成
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain("Generate a single TOEIC Part 3 question");
        expect(result).toContain("Listen to conversations and answer questions");
        expect(result).toContain("For Part 3-4:** Generate 3 questions with 4 choices each");
        expect(result).toContain("Location");
        expect(result).toContain("Speaker");
        expect(result).toContain("Situation");
    });

    test("B02_part2プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 2,
            requestedNumOfLQuizs: 1, // 単一問題生成
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain("Generate a single TOEIC Part 2 question");
        expect(result).toContain("Appropriate responses that follow natural conversation flow");
        expect(result).toContain("For Part 1-2:** Generate 1 question with 4 choices (Part 2: 3 choices)");
        expect(result).toContain("Location");
        expect(result).toContain("Speaker");
        expect(result).toContain("return array with 1 element");
    });

    test("B03_part4プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 1, // 単一問題生成
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain("Generate a single TOEIC Part 4 question");
        expect(result).toContain("For Part 3-4:** Generate 3 questions with 4 choices each");
        expect(result).toContain("Location");
        expect(result).toContain("Speaker");
        expect(result).toContain("Situation");
        expect(result).toContain('return array with 3 elements');
    });

    test("B04_part1プロンプト生成", async () => {
        expect.assertions(5);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 1,
            requestedNumOfLQuizs: 1, // 単一問題生成
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain("Generate a single TOEIC Part 1 question");
        expect(result).toContain("For Part 1-2:** Generate 1 question with 4 choices");
        expect(result).toContain("Location");
        expect(result).toContain("Speaker");
        expect(result).toContain("return array with 1 element");
    });

    test("B05_出力形式確認", async () => {
        expect.assertions(4);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain('Return ONLY a JSON object');
        expect(result).toContain('Do not use markdown code blocks');
        expect(result).toContain('"audioScript"');
        expect(result).toContain('"answerOption"');
    });

    test("B06_品質制約確認", async () => {
        expect.assertions(5);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const result = await service.generateSingleAudioScriptPrompt(mockDomObj, 0); // 関数名変更 + index指定
        console.log(result);
        expect(result).toContain('Word Count Constraints');
        expect(result).toContain('TOEIC 600-990 points');
        expect(result).toContain('Logical Consistency');
        expect(result).toContain('Quality Verification Checklist');
        expect(result).toContain('Generate the question now');
    });
});

describe('C_generateExplanationPrompt', () => {
    test("C01_American accent解説プロンプト生成", async () => {
        expect.assertions(8);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            speakerAccent: "American",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "[Speaker1] Good morning, everyone. I'll walk you through our new elevator system.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["A", "B", "A"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "スピーチ内容: [Japanese] 設問文: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("TOEIC Part 4 Explanation Generation");
        expect(result).toContain("American");
        expect(result).toContain("American English");
        expect(result).toContain("Correct Answer Rationale");
        expect(result).toContain("Incorrect Option Analysis");
        expect(result).toContain("American Accent Listening Tips");
        expect(result).toContain("Regional Expression Analysis");
        expect(result).toContain("250-400 character explanation");
    });

    test("C02_British accent解説プロンプト生成", async () => {
        expect.assertions(8);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            speakerAccent: "British",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "[Speaker1] I'm afraid we'll need to take the lift to the third floor.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["B", "A", "D"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "会話内容: [Japanese] 設問文: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("TOEIC Part 3 Explanation Generation");
        expect(result).toContain("British");
        expect(result).toContain("British English");
        expect(result).toContain("Vocabulary/Grammar Points");
        expect(result).toContain("British Accent Listening Tips");
        expect(result).toContain("Similar Question Application");
        expect(result).toContain("lift");
        expect(result).toContain("Non-rhotic");
    });

    test("C03_Canadian accent解説プロンプト生成", async () => {
        expect.assertions(7);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 2,
            speakerAccent: "Canadian",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "[Speaker1] Could you tell me where the washroom is?";
        const sampleAnswerOptions: ("A" | "B" | "C")[] = ["C"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "質問文: [Japanese] 選択肢: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("TOEIC Part 2 Explanation Generation");
        expect(result).toContain("Canadian");
        expect(result).toContain("Canadian English");
        expect(result).toContain("Canadian raising");
        expect(result).toContain("washroom");
        expect(result).toContain("Canadian Accent Listening Tips");
        expect(result).toContain("You betcha");
    });

    test("C04_Australian accent解説プロンプト生成", async () => {
        expect.assertions(7);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 1,
            speakerAccent: "Australian",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "A man is having brekkie at the arvo.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["B"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "選択肢: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("TOEIC Part 1 Explanation Generation");
        expect(result).toContain("Australian");
        expect(result).toContain("Australian English");
        expect(result).toContain("Vowel shifts");
        expect(result).toContain("brekkie");
        expect(result).toContain("arvo");
        expect(result).toContain("No worries");
    });

    test("C05_アクセント特徴確認", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            speakerAccent: "American",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "Better water quarter elevator apartment.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["A", "C", "B"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "スピーチ内容: [Japanese] 設問文: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("Accent-Specific Context");
        expect(result).toContain("Key Pronunciation Features");
        expect(result).toContain("Regional Vocabulary Used");
        expect(result).toContain("Typical Expressions");
        expect(result).toContain("Rhoticity");
        expect(result).toContain("elevator");
    });

    test("C06_テンプレート変数置換確認", async () => {
        expect.assertions(4);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            speakerAccent: "British",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "Sample audio script content.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["A", "B", "C"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "会話内容: [Japanese] 設問文: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        // テンプレート変数が全て置換されていることを確認
        expect(result).not.toContain("{{");
        expect(result).not.toContain("}}");
        expect(result).toContain("Sample audio script content");
        expect(result).toContain("A,B,C");
    });

    test("C07_解説要件確認", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            speakerAccent: "American",
            requestedNumOfLQuizs: 1,
            speakingRate: 1.0
        };
        const sampleAudioScript = "Test audio script for requirements check.";
        const sampleAnswerOptions: ("A" | "B" | "C" | "D")[] = ["D", "A", "B"];

        const result = await service.generateSingleExplanationPrompt(
            mockDomObj,
            "スピーチ内容: [Japanese] 設問文: [Japanese]",
            sampleAudioScript,
            sampleAnswerOptions
        );
        console.log(result);
        
        expect(result).toContain("Explanation Requirements");
        expect(result).toContain("Correct Answer Rationale");
        expect(result).toContain("Incorrect Option Analysis");
        expect(result).toContain("Vocabulary/Grammar Points");
        expect(result).toContain("Regional Expression Analysis");
        expect(result).toContain("Similar Question Application");
    });
});

describe('D_generateJpnAudioScriptPrompt', () => {
    test("D01_Part1日本語音声プロンプト生成", async () => {
        expect.assertions(6);
        const sectionNumber = 1;
        const sampleAudioScript = "A businessman wearing a dark suit is reading a newspaper. [short pause] Two women are walking through the office corridor. [short pause] Children are playing on playground equipment. [short pause] A dog is running across the field.";

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        expect(result).toContain("Translate this TOEIC Part 1");
        expect(result).toContain("選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]");
        expect(result).toContain("Natural Japanese for TOEIC learners");
        expect(result).toContain("businessman wearing a dark suit");
        expect(result).toContain("Output format:");
        expect(result).toContain("Output ONLY the formatted text above");
    });

    test("D02_Part2日本語音声プロンプト生成", async () => {
        expect.assertions(6);
        const sectionNumber = 2;
        const sampleAudioScript = "[Speaker1] Could you please tell me where the conference room is? [pause] [Speaker2] Go down this hallway and turn right. [short pause] Yes, I would be happy to attend the meeting. [short pause] The meeting is scheduled to start at three o'clock.";

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        expect(result).toContain("Translate this TOEIC Part 2");
        expect(result).toContain("質問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese]");
        expect(result).toContain("Could you please tell me");
        expect(result).toContain("conference room");
        expect(result).toContain("Natural Japanese");
        expect(result).toContain("business/formal tone");
    });

    test("D03_Part3日本語音声プロンプト生成", async () => {
        expect.assertions(6);
        const sectionNumber = 3;
        const sampleAudioScript = "[Speaker1] Good morning, Sarah. Have you finished the quarterly report? [pause] [Speaker2] Almost done, Mike. I just need to add the final sales figures. [pause] [Speaker1] Great. We need to submit it by noon for the board meeting. [pause] What does Mike need Sarah to do? [pause] Add the remaining sales figures. [short pause] Submit the report by noon. [short pause] Schedule a board meeting. [short pause] Review the quarterly data.";

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        expect(result).toContain("Translate this TOEIC Part 3");
        expect(result).toContain("会話内容: [Conversation in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]");
        expect(result).toContain("quarterly report");
        expect(result).toContain("sales figures");
        expect(result).toContain("board meeting");
        expect(result).toContain("Preserve meaning and context");
    });

    test("D04_Part4日本語音声プロンプト生成", async () => {
        expect.assertions(6);
        const sectionNumber = 4;
        //const sampleAudioScript = "[Speaker1] Good morning, everyone. As the system administrator, I want to walk you through our new data management system. This system streamlines data processing and improves efficiency. First, log in using your credentials. The dashboard provides project overviews and statuses. To update a project, click the project name and enter new data. [pause] What is the main purpose of the new system? [pause] To streamline data processing and improve efficiency. [short pause] To increase working hours. [short pause] To reduce employees. [short pause] To enhance customer service.";
        const sampleAudioScript = "[SPEECH_CONTENT] Good morning, passengers. This is an important announcement from the station staff. Due to scheduled maintenance, the northbound trains will be operating on a revised timetable today. Please check the digital boards for updated departure times. Additionally, the ticket machines on platforms 3 and 4 are temporarily out of service. We apologize for any inconvenience and recommend using the machines located near the main entrance. For further assistance, please approach any of our staff members. Thank you for your understanding and cooperation. [pause] [QUESTION_1] What is the main purpose of the announcement? [CHOICES_1] A. To inform about a new train service [short pause] B. To announce a change in train schedules [short pause] C. To promote a new ticketing system [short pause] D. To notify about a station closure [pause] [QUESTION_2] Where can passengers find updated departure times? [CHOICES_2] A. On the station's website [short pause] B. On the digital boards [short pause] C. At the ticket counter [short pause] D. In the station newsletter [pause] [QUESTION_3] What should passengers do if they need assistance? [CHOICES_3] A. Call the customer service hotline [short pause] B. Use the help desk near platform 1 [short pause] C. Approach any station staff member [short pause] D. Visit the station manager's office"
        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        expect(result).toContain("Translate this TOEIC Part 4");
        expect(result).toContain("スピーチ内容: [Speech in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]");
        expect(result).toContain("system administrator");
        expect(result).toContain("data management system");
        expect(result).toContain("streamline data processing");
        expect(result).toContain("Use appropriate business/formal tone");
    });

    test("D05_テンプレート変数置換確認", async () => {
        expect.assertions(4);
        const sectionNumber = 3;
        const sampleAudioScript = "Test audio content with specific keywords for verification.";

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        // テンプレート変数が全て置換されていることを確認
        expect(result).not.toContain("{{sectionNumber}}");
        expect(result).not.toContain("{{audioScript}}");
        expect(result).not.toContain("{{jpnAudioScriptFormat}}");
        expect(result).toContain("Test audio content with specific keywords");
    });

    test("D06_出力形式要件確認", async () => {
        expect.assertions(5);
        const sectionNumber = 4;
        const sampleAudioScript = "Sample speech content for format verification test.";

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            sampleAudioScript
        );
        console.log(result);
        
        expect(result).toContain("Requirements:");
        expect(result).toContain("Natural Japanese for TOEIC learners");
        expect(result).toContain("Preserve meaning and context");
        expect(result).toContain("Use appropriate business/formal tone");
        expect(result).toContain("Output ONLY the formatted text above");
    });

    test("D07_特殊文字処理確認", async () => {
        expect.assertions(4);
        const sectionNumber = 1;
        const specialCharAudioScript = `A woman is using a computer with "special characters" & symbols: 100% efficiency, $500 budget, and 3:30 PM deadline. [short pause] Two men are discussing the project's "requirements" & specifications. [short pause] The presentation includes charts with 25% growth and €1,000 investment. [short pause] A team is reviewing documents with various symbols: @, #, %, &, and punctuation marks.`;

        const result = await service.generateSingleJpnAudioScriptPrompt(
            sectionNumber,
            specialCharAudioScript
        );
        console.log(result);
        
        expect(result).toContain('special characters');
        expect(result).toContain('$500 budget');
        expect(result).toContain('25% growth');
        expect(result).toContain('€1,000 investment');
    });
});
*/

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



describe('SSML生成 直交表テスト L16(4^4)', () => {
    
    // テストデータの定義
    const testData = {
        // 因子A: audioScript templates (Part別)
        audioScripts: {
            part1: '[Speaker1] A businessman wearing a dark suit is reading. [short pause] Two women are walking. [short pause] Children are playing. [short pause] A dog is running.',
            part2: '[Speaker1_REPLACE_GENDER] Where is the conference room? [pause] [Speaker2] Down the hall. [short pause] Yes, I will attend. [short pause] Meeting starts at 3PM.',
            part3: '[Speaker1_REPLACE_GENDER1] Good morning, Sarah. How is the report? [pause] [Speaker2_REPLACE_GENDER2] Almost done, Mike. Just need final data. [pause] [Speaker3] What does Mike need? [short pause] A. Add data [short pause] B. Submit report [short pause] C. Schedule meeting [short pause] D. Review content [pause]',
            part4: '[Speaker1_REPLACE_GENDER] Welcome to International Airport. We offer various services. [pause] [Speaker2] What service is available? [short pause] A. Free Wi-Fi [short pause] B. Meals [short pause] C. Shopping [short pause] D. Parking [pause]'
        },
        
        // 性別設定パターン
        genderPatterns: {
            MALE: { gender1: 'MALE', gender2: 'MALE' },
            FEMALE: { gender1: 'FEMALE', gender2: 'FEMALE' },
            MIXED: { gender1: 'MALE', gender2: 'FEMALE' },
            DEFAULT: { gender1: '', gender2: '' }
        }
    };
    
    // audioScript生成ヘルパー
    const generateAudioScript = (part: 1|2|3|4, genderType: 'MALE'|'FEMALE'|'MIXED'|'DEFAULT'): string => {
        const template = testData.audioScripts[`part${part}` as keyof typeof testData.audioScripts];
        const pattern = testData.genderPatterns[genderType];
        
        return template
            .replace('_REPLACE_GENDER1', pattern.gender1 ? `_${pattern.gender1}` : '')
            .replace('_REPLACE_GENDER2', pattern.gender2 ? `_${pattern.gender2}` : '')
            .replace('_REPLACE_GENDER', pattern.gender1 ? `_${pattern.gender1}` : '');
    };
    
    // 直交表 L16(4^4) テストケース
    
    test('T01: Part1・American・MALE・Rate0.8', async () => {
        const request = {
            sectionNumber: 1 as 1|2|3|4,
            audioScript: generateAudioScript(1, 'MALE'),
            speakerAccent: "American" as const,
            speakingRate: 0.8
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T01: ", result);
        
        // 基本検証
        expect(result).toContain('<?xml version="1.0"');
        expect(result).toContain('<speak version="1.0"');
        
        // Part1検証: 1人
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(1);
        
        // ナレーター固定検証
        expect(result).toContain('en-US-Neural2-D');
        
        // 話速検証
        expect(result).toContain('<prosody rate="0.8">');
        
        // 内容検証
        expect(result).toContain('businessman wearing a dark suit');
    });
    
    test('T02: Part1・British・FEMALE・Rate0.9', async () => {
        const request = {
            sectionNumber: 1 as 1|2|3|4,
            audioScript: generateAudioScript(1, 'FEMALE'),
            speakerAccent: "British" as const,
            speakingRate: 0.9
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T02: ", result);
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        
        expect(voiceCount).toBe(1);
        expect(result).toContain('en-US-Neural2-D'); // Part1はナレーター固定
        expect(result).toContain('<prosody rate="0.9">');
    });
    
    test('T03: Part1・Canadian・MIXED・Rate1.0', async () => {
        const request = {
            sectionNumber: 1 as 1|2|3|4,
            audioScript: generateAudioScript(1, 'MIXED'),
            speakerAccent: "Canadian" as const,
            speakingRate: 1.0
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T03: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(1);
        expect(result).toContain('<prosody rate="1">');
    });
    
    test('T04: Part1・Australian・DEFAULT・Rate1.2', async () => {
        const request = {
            sectionNumber: 1 as 1|2|3|4,
            audioScript: generateAudioScript(1, 'DEFAULT'),
            speakerAccent: "Australian" as const,
            speakingRate: 1.2
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T04: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(1);
        expect(result).toContain('<prosody rate="1.2">');
    });
    
    test('T05: Part2・American・FEMALE・Rate1.0', async () => {
        const request = {
            sectionNumber: 2 as 1|2|3|4,
            audioScript: generateAudioScript(2, 'FEMALE'),
            speakerAccent: "American" as const,
            speakingRate: 1.0
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T05: ", result);
        
        // Part2検証: 2人
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        
        // American音声検証
        expect(result).toContain('en-US-Neural2-');
        
        // 内容検証
        expect(result).toContain('Where is the conference room');
        expect(result).toContain('Down the hall');
    });
    
    test('T06: Part2・British・MALE・Rate1.2', async () => {
        const request = {
            sectionNumber: 2 as 1|2|3|4,
            audioScript: generateAudioScript(2, 'MALE'),
            speakerAccent: "British" as const,
            speakingRate: 1.2
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T06: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('en-GB-Neural2-'); // British音声
        expect(result).toContain('<prosody rate="1.2">');
    });
    
    test('T07: Part2・Canadian・DEFAULT・Rate0.8', async () => {
        const request = {
            sectionNumber: 2 as 1|2|3|4,
            audioScript: generateAudioScript(2, 'DEFAULT'),
            speakerAccent: "Canadian" as const,
            speakingRate: 0.8
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T07: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('<prosody rate="0.8">');
    });
    
    test('T08: Part2・Australian・MIXED・Rate0.9', async () => {
        const request = {
            sectionNumber: 2 as 1|2|3|4,
            audioScript: generateAudioScript(2, 'MIXED'),
            speakerAccent: "Australian" as const,
            speakingRate: 0.9
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T08: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('en-AU-Neural2-'); // Australian音声
    });
    
    test('T09: Part3・American・MIXED・Rate1.2', async () => {
        const request = {
            sectionNumber: 3 as 1|2|3|4,
            audioScript: generateAudioScript(3, 'MIXED'),
            speakerAccent: "American" as const,
            speakingRate: 1.2
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T09: ", result);
        
        // Part3検証: 3人
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(3);
        
        // 会話内容検証
        expect(result).toContain('Good morning, Sarah');
        expect(result).toContain('Almost done, Mike');
        expect(result).toContain('What does Mike need');
    });
    
    test('T10: Part3・British・DEFAULT・Rate1.0', async () => {
        const request = {
            sectionNumber: 3 as 1|2|3|4,
            audioScript: generateAudioScript(3, 'DEFAULT'),
            speakerAccent: "British" as const,
            speakingRate: 1.0
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T10: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(3);
        expect(result).toContain('en-GB-Neural2-');
    });
    
    test('T11: Part3・Canadian・MALE・Rate0.9', async () => {
        const request = {
            sectionNumber: 3 as 1|2|3|4,
            audioScript: generateAudioScript(3, 'MALE'),
            speakerAccent: "Canadian" as const,
            speakingRate: 0.9
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T11: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(3);
    });
    
    test('T12: Part3・Australian・FEMALE・Rate0.8', async () => {
        const request = {
            sectionNumber: 3 as 1|2|3|4,
            audioScript: generateAudioScript(3, 'FEMALE'),
            speakerAccent: "Australian" as const,
            speakingRate: 0.8
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T12: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(3);
        expect(result).toContain('en-AU-Neural2-');
    });
    
    test('T13: Part4・American・DEFAULT・Rate0.9', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: generateAudioScript(4, 'DEFAULT'),
            speakerAccent: "American" as const,
            speakingRate: 0.9
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T13: ", result);
        
        // Part4検証: 2人
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        
        // 内容検証
        expect(result).toContain('Welcome to International Airport');
        expect(result).toContain('What service is available');
    });
    
    test('T14: Part4・British・MIXED・Rate0.8', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: generateAudioScript(4, 'MIXED'),
            speakerAccent: "British" as const,
            speakingRate: 0.8
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T14: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('en-GB-Neural2-');
    });
    
    test('T15: Part4・Canadian・FEMALE・Rate1.2', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: generateAudioScript(4, 'FEMALE'),
            speakerAccent: "Canadian" as const,
            speakingRate: 1.2
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T15: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('<prosody rate="1.2">');
    });
    
    test('T16: Part4・Australian・MALE・Rate1.0', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: generateAudioScript(4, 'MALE'),
            speakerAccent: "Australian" as const,
            speakingRate: 1.0
        };
        
        const result = await service.generateAudioContent(request);
        console.log("T16: ", result);
        
        const voiceCount = (result.match(/<voice name="/g) || []).length;
        expect(voiceCount).toBe(2);
        expect(result).toContain('en-AU-Neural2-');
    });
});
// エラーケース・境界値テスト
describe('SSML生成 エラーケース・境界値テスト', () => {
    
    test('E01: 境界値 - speakingRate最小値(0.5)', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '[Speaker1] Test content [pause] [Speaker2] Question?',
            speakerAccent: "American" as const,
            speakingRate: 0.5
        };
        
        const result = await service.generateAudioContent(request);
        console.log("E01: ", result);
        expect(result).toContain('<prosody rate="0.5">');
    });
    
    test('E02: 境界値 - speakingRate最大値(2.0)', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '[Speaker1] Test content [pause] [Speaker2] Question?',
            speakerAccent: "American" as const,
            speakingRate: 2.0
        };
        
        const result = await service.generateAudioContent(request);
        console.log("E02: ", result);
        expect(result).toContain('<prosody rate="2">');
    });
    
    test('E03: 異常系 - 不正なsectionNumber(0)', async () => {
        const request = {
            sectionNumber: 0 as any,
            audioScript: '[Speaker1] Test content',
            speakerAccent: "American" as const,
            speakingRate: 1.0
        };
        
        await expect(service.generateAudioContent(request)).rejects.toThrow();
    });
    
    test('E04: 異常系 - 不正なsectionNumber(5)', async () => {
        const request = {
            sectionNumber: 5 as any,
            audioScript: '[Speaker1] Test content',
            speakerAccent: "American" as const,
            speakingRate: 1.0
        };
        
        await expect(service.generateAudioContent(request)).rejects.toThrow();
    });
    
    test('E05: 異常系 - 空のaudioScript', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '',
            speakerAccent: "American" as const,
            speakingRate: 1.0
        };
        
        await expect(service.generateAudioContent(request)).rejects.toThrow();
    });
    
    test('E06: 異常系 - 話者数不一致(Part4で1人)', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '[Speaker1] Only one speaker content',
            speakerAccent: "American" as const,
            speakingRate: 1.0
        };
        
        await expect(service.generateAudioContent(request))
            .rejects
            .toThrow('Part 4 requires 2 speakers');
    });
    
    test('E07: 異常系 - 不正なspeakerAccent', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '[Speaker1] Test [pause] [Speaker2] Question',
            speakerAccent: "Invalid" as any,
            speakingRate: 1.0
        };
        
        await expect(service.generateAudioContent(request)).rejects.toThrow();
    });
    
    test('E08: 異常系 - 負のspeakingRate', async () => {
        const request = {
            sectionNumber: 4 as 1|2|3|4,
            audioScript: '[Speaker1] Test [pause] [Speaker2] Question',
            speakerAccent: "American" as const,
            speakingRate: -0.5
        };
        
        await expect(service.generateAudioContent(request)).rejects.toThrow();
    });
});*/

/*describe('H_callGoogleCloudTTS', () => {
    beforeEach(() => {
        vi.stubEnv('GOOGLE_APPLICATION_CREDENTIALS', '../../.env');
        vi.stubEnv('GOOGLE_CLOUD_PROJECT_ID', '../credentials/listening-quiz-audio-generator-b5d3be486e8f.json');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('H01_成功', async () => {
        expect.assertions(3);

        const mockSSML = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
    <break time="1s"/>

    <!-- Part 4: Talk -->
    <voice name="en-US-Neural2-A">
        <prosody rate="0.9">
            <break time="0.5s"/>
            Good morning everyone. I'm pleased to announce that our company has achieved record sales this quarter. 
            <break time="1s"/>
            Our revenue increased by twenty-five percent compared to last year. 
            <break time="1s"/>
            This success is largely due to our new product line and improved customer service. 
            <break time="1s"/>
            I want to thank all departments for their hard work and dedication. 
            <break time="1s"/>
            Looking ahead, we plan to expand our operations to three new markets next year.
            <break time="1.5s"/>
        </prosody>
    </voice>

    <!-- Questions -->
    <voice name="en-US-Neural2-D">
        <prosody rate="0.9">
            <break time="0.5s"/>
            What is the main topic of the talk? 
            <break time="0.8s"/> 
            A. New employee training 
            <break time="0.8s"/> 
            B. Company financial results 
            <break time="0.8s"/> 
            C. Product development 
            <break time="0.8s"/> 
            D. Market research
            <break time="1.5s"/>
        </prosody>
    </voice>
    <break time="2s"/>
</speak>`;

        const mockQuestionID = 'listening-part4-ABC12345';

        const result = await service.callGoogleCloudTTS(mockSSML, mockQuestionID);
        
        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeGreaterThan(1000);

        console.log(`✅ テスト成功: 音声データサイズ ${result.length} bytes`);
        console.log(`✅ 問題ID: ${mockQuestionID}`);
    }, 30000);
});*/