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

import { AccentType } from "../listening-quiz-transactions/services/lquizapiservice.js";
import { start } from 'repl';
import { stderr } from 'process';


import * as service from "../listening-quiz-transactions/services/lquizapiservice.js"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.js";
import * as dto from "../listening-quiz-transactions/lquiz.dto.js";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.js";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.js";
import { get } from 'http';
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

describe('B_generatePart34AudioScriptContentPrompt', () => {
    test("B01_part3プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const currentIndex = 0;
        //問題生成関数 controllerで呼び出す
        const speakerAccentList = service.getRandomSpeakerAccent(mockDomObj.requestedNumOfLQuizs);
        //状況設定（多様性担保）
        const settings = service.getRandomSettings(mockDomObj.requestedNumOfLQuizs, mockDomObj.sectionNumber);
        console.log("settings: ", settings);
        const contentTopicInstruction = service.generateContentTopicInstructions(mockDomObj.requestedNumOfLQuizs, settings);
        console.log("contentTopicInstruction: ", contentTopicInstruction);
        const contentFrameworksText = service.generateContentFrameworks(mockDomObj.sectionNumber, settings);
        console.log("contentFrameworksText: ", contentFrameworksText);
        //プロンプト生成
        const result = await service.generatePart34AudioScriptContentPrompt(mockDomObj, speakerAccentList[currentIndex], settings[currentIndex], contentTopicInstruction[currentIndex], contentFrameworksText[currentIndex], currentIndex);
        console.log(result);
        
        // Part 3 content生成用のアサーション
        expect(result).toContain("TOEIC Part 3 Content Generation Prompt");
        expect(result).toContain("Generate conversation content only (no questions or choices)");
        expect(result).toContain("Conversation between 2 speakers");
        expect(result).toContain("Speaker Assignment:");
        expect(result).toContain("Accent Requirements:");
        expect(result).toContain("Word Count Constraints");
    });

    test("B02_part4プロンプト生成", async () => {
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 7, 
            speakingRate: 1.0
        };
        const currentIndex = 0;
        //問題生成関数 controllerで呼び出す
        const speakerAccentList = service.getRandomSpeakerAccent(mockDomObj.requestedNumOfLQuizs);
        //状況設定（多様性担保）
        const settings = service.getRandomSettings(mockDomObj.requestedNumOfLQuizs, mockDomObj.sectionNumber);
        console.log("settings: ", settings);
        const contentTopicInstruction = service.generateContentTopicInstructions(mockDomObj.requestedNumOfLQuizs, settings);
        console.log("contentTopicInstruction: ", contentTopicInstruction);
        const contentFrameworksText = service.generateContentFrameworks(mockDomObj.sectionNumber, settings);
        console.log("contentFrameworksText: ", contentFrameworksText);
        //プロンプト生成
        const result = await service.generatePart34AudioScriptContentPrompt(mockDomObj, speakerAccentList[currentIndex], settings[currentIndex], contentTopicInstruction[currentIndex], contentFrameworksText[currentIndex], currentIndex);
        console.log(result);
        
        // Part 4 content生成用のアサーション
        expect(result).toContain("TOEIC Part 4 Content Generation Prompt");
        expect(result).toContain("Generate speech/announcement content only (no questions or choices)");
        expect(result).toContain("Speech content read by single announcer/presenter");
        expect(result).toContain("Presenter/Announcer:");
        expect(result).toContain("Accent Requirements:");
        expect(result).toContain("Word Count Constraints");
    });
});

describe('C_generatePart34AudioScriptQuestionsAndChoicesPrompt', () => {
    test("C01_part3プロンプト生成", async () => {
        expect.assertions(4);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 3,
            speakingRate: 1.0
        };
        const content = `[Speaker1_MALE] I'm afraid the project's timeline is a bit tight. We need to ensure everything is on track. Any thoughts on how we can manage this? 

[Speaker2_MALE] Quite right. I suggest we prioritise the key tasks and perhaps bring in an additional team member to assist. That should help us meet the deadline.

[Speaker1_MALE] Brilliant! Allocating resources efficiently is crucial. Do you think we should also adjust the budget slightly to accommodate this?

[Speaker2_MALE] Rather good idea. A small increase in the budget could allow for more flexibility. Let's draft a proposal and present it to the board.`;
        const currentIndex = 0;
        //プロンプト生成
        const result = await service.generatePart34AudioScriptQuestionsPrompt(mockDomObj, content, "British", currentIndex);
        console.log(result);
        
        //Part3 questions&choices生成用のアサーション
        expect(result).toContain("TOEIC Part 3 Questions Generation Prompt");
        //expect(result).toContain("Generate questions and choices based on the provided content");
        expect(result).toContain("Return ONLY a valid JSON object");
        expect(result).toContain("audioScript");
        expect(result).toContain("answerOption");
        //expect(result).toContain("Provided Content:");
    });
    
    test("C02_part4プロンプト生成", async () => {
        expect.assertions(4);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const content = "[Speaker1_MALE] Good morning, everyone. As we gather here in the meeting room, I'm pleased to present our quarterly report. Over the past three months, our department has seen a 15% increase in productivity, thanks to the new software implementation. I guess the training sessions really paid off. Our customer satisfaction scores have also improved, reaching an impressive 92%. You bet that's a result of our dedicated team efforts. Additionally, we've managed to reduce operational costs by 10%, which is a significant achievement. Looking ahead, we aim to focus on expanding our market reach and enhancing our product line. Sure thing, collaboration will be key to achieving these goals. Let's continue to work together to maintain this positive momentum. Thank you for your hard work and dedication.";
        const currentIndex = 0;
        const speakerAccentList = service.getRandomSpeakerAccent(mockDomObj.requestedNumOfLQuizs);
        //プロンプト生成
        const result = await service.generatePart34AudioScriptQuestionsPrompt(mockDomObj, content, speakerAccentList[currentIndex], currentIndex);
        console.log(result);
        
        //Part4 questions&choices生成用のアサーション
        expect(result).toContain("TOEIC Part 4 Questions Generation Prompt");
        //expect(result).toContain("Generate questions and choices based on the provided content");
        expect(result).toContain("Return ONLY a valid JSON object");
        expect(result).toContain("audioScript");
        expect(result).toContain("answerOption");
        //expect(result).toContain("Provided Content:");
    });
});

describe('D_generateSingleJpnAudioScriptPrompt', () => {
    test("D01_part2プロンプト生成", async () => {
        expect.assertions(3);
        
        const sectionNumber = 2;
        const part2Output = {
            audioScript: "[Speaker1_MALE] How's the afternoon shift progressing? [Speaker2_MALE] A. Certainly, it's on schedule. B. That's excellent, how about you? C. Of course, it starts tomorrow.",
            answerOption: 'A'
        };
        
        const result = await service.generateSingleJpnAudioScriptPrompt(sectionNumber, part2Output.audioScript);
        console.log(result);
        
        // Part 3 日本語プロンプト生成用のアサーション
        expect(result).toContain("TOEIC Part 2");
        expect(result).toContain(part2Output.audioScript);
        expect(result).toContain("Comment");
    })
    test("D01_part4プロンプト生成", async () => {
        expect.assertions(5);
        
        const sectionNumber = 4;
        const audioScript = `Content: [Speaker1_MALE] Good morning, everyone. As we gather here in the meeting room, I'm pleased to present our quarterly report. Over the past three months, our department has seen a 15% increase in productivity, thanks to the new software implementation. I guess the training sessions really paid off. Our customer satisfaction scores have also improved, reaching an impressive 92%. You bet that's a result of our dedicated team efforts. Additionally, we've managed to reduce operational costs by 10%, which is a significant achievement. Looking ahead, we aim to focus on expanding our market reach and enhancing our product line. Sure thing, collaboration will be key to achieving these goals. Let's continue to work together to maintain this positive momentum. Thank you for your hard work and dedication.

Questions and Choices: [QUESTION_1] What is the main focus of the speech? [CHOICES_1] A. Increasing customer satisfaction B. Reducing operational costs C. Presenting the quarterly report D. Discussing new software [QUESTION_2] How much did productivity increase? [CHOICES_2] A. 10% B. 15% C. 20% D. 25% [QUESTION_3] What is the next goal mentioned? [CHOICES_3] A. Hiring more staff B. Improving training sessions C. Expanding market reach D. Increasing salaries`
        
        const result = await service.generateSingleJpnAudioScriptPrompt(sectionNumber, audioScript);
        console.log(result);
        
        // Part 3 日本語プロンプト生成用のアサーション
        expect(result).toContain("TOEIC Part 4");
        expect(result).toContain("スピーチ内容: [話者1 男性/女性] [Speech in Japanese]");
        expect(result).toContain(audioScript);
        expect(result).toContain("Questions and Choices:");
        expect(result).toContain("設問1:");
    })
}) 
describe('E_generateSingleExplanationPrompt', () => {
    test("E01_Part4プロンプト生成", async () => {
        expect.assertions(3);
        
        const sectionNumber = 4;
        const audioScript = `Content: [Speaker1_MALE] Good morning, everyone. As we gather here in the meeting room, I'm pleased to present our quarterly report. Over the past three months, our department has seen a 15% increase in productivity, thanks to the new software implementation. I guess the training sessions really paid off. Our customer satisfaction scores have also improved, reaching an impressive 92%. You bet that's a result of our dedicated team efforts. Additionally, we've managed to reduce operational costs by 10%, which is a significant achievement. Looking ahead, we aim to focus on expanding our market reach and enhancing our product line. Sure thing, collaboration will be key to achieving these goals. Let's continue to work together to maintain this positive momentum. Thank you for your hard work and dedication.

Questions and Choices: [QUESTION_1] What is the main focus of the speech? [CHOICES_1] A. Increasing customer satisfaction B. Reducing operational costs C. Presenting the quarterly report D. Discussing new software [QUESTION_2] How much did productivity increase? [CHOICES_2] A. 10% B. 15% C. 20% D. 25% [QUESTION_3] What is the next goal mentioned? [CHOICES_3] A. Hiring more staff B. Improving training sessions C. Expanding market reach D. Increasing salaries`
        const relevantAccentFeaturesText = `American English Features:
Pronunciation: Rhoticity: Clear pronunciation of final 'r' (car, better, quarter); Flat 'a': Flat 'a' sound in cat, hat, last, etc.; T-flapping: Sounds like better → 'bedder', water → 'wadder'
Expressions: I guess..., You bet!, Sure thing`;
        const answerOptionList = [ 'C', 'B', 'C' ] as ("A" | "B" | "C" | "D")[];
        const result = await service.generateSingleExplanationPrompt(sectionNumber, "American", relevantAccentFeaturesText, audioScript, answerOptionList);
        console.log(result);
        
        expect(result).toContain("# TOEIC Part 4 Explanation Generation");
        expect(result).toContain("Content: [Speaker1_MALE] ");
        expect(result).toContain("American English Features:");
    })
})
*/
describe('F_generatePart2AudioScriptPrompt', () => {
    test("F01_プロンプト生成成功", async () => {
        expect.assertions(9);
        
        const sectionNumber = 2;
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 2,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const currentIndex = 0;
        
        // 問題生成関数
        const speakerAccentList = service.getRandomSpeakerAccent(mockDomObj.requestedNumOfLQuizs);
        
        // 状況設定（多様性担保）
        const settings = service.getRandomSettings(mockDomObj.requestedNumOfLQuizs, mockDomObj.sectionNumber);
        console.log("settings: ", settings);
        
        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        
        // プロンプト生成
        const result = await service.generatePart2AudioScriptPrompt(
            sectionNumber, 
            speakerAccentList[currentIndex], 
            settings[currentIndex], 
            speakerList
        );
        console.log(result);
        
        // Part 2 audioScript生成用のアサーション
        expect(result).toContain("TOEIC Part 2 Content Generation Prompt");
        expect(result).toContain("Generate realistic question/comment and three response options");
        expect(result).toContain("**Speaker 1**: One question or comment");
        expect(result).toContain("**Speaker 2**: Three different response options A, B, C");
        expect(result).toContain("Accent Requirements:");
        //expect(result).toContain("Setting:");
        expect(result).toContain("Word Count Constraints");
        expect(result).toContain("Response Design Principles");
        expect(result).toContain("Vocabulary Diversity (MANDATORY)");
        expect(result).toContain("Answer Distribution Rule");
    });

    /*test("F02_アクセント別プロンプト生成確認", async () => {
        expect.assertions(8);
        
        const sectionNumber = 2;
        const accents: AccentType[] = ["American", "British", "Canadian", "Australian"];
        
        for (const accent of accents) {
            const settings = service.getRandomSettings(1, sectionNumber);
            const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
            
            const result = await service.generatePart2AudioScriptPrompt(
                sectionNumber,
                accent,
                settings[0],
                speakerList
            );
            
            // 各アクセントの特徴が含まれていることを確認
            expect(result).toContain(accent);
            console.log(`${accent} accent prompt generated successfully`);
        }
    });*/

    test("F03_Setting内容の反映確認", async () => {
        expect.assertions(3);
        
        const sectionNumber = 2;
        const speakerAccent: AccentType = "American";
        const testSetting = {
            location: "Conference Room",
            speaker: "Project Manager",
            situation: "Team Meeting"
        };
        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        
        const result = await service.generatePart2AudioScriptPrompt(
            sectionNumber,
            speakerAccent,
            testSetting,
            speakerList
        );
        console.log(result);
        
        // Setting内容が適切に反映されていることを確認
        expect(result).toContain("conference room");
        expect(result).toContain("project manager");
        expect(result).toContain("team meeting");
    });

    test("F04_必須セクションの存在確認", async () => {
        expect.assertions(12);
        
        const sectionNumber = 2;
        const speakerAccent: AccentType = "British";
        const settings = service.getRandomSettings(1, sectionNumber);
        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        
        const result = await service.generatePart2AudioScriptPrompt(
            sectionNumber,
            speakerAccent,
            settings[0],
            speakerList
        );
        
        // 必須セクションの確認
        expect(result).toContain("Part 2 Structure Requirements");
        expect(result).toContain("Generation Requirements");
        expect(result).toContain("Quality Standards");
        expect(result).toContain("Affirmative Responses - Rotate These Expressions:");
        expect(result).toContain("Declining Responses - Rotate These Expressions:");
        expect(result).toContain("Incorrect Response Design");
        expect(result).toContain("CRITICAL Rules:");
        expect(result).toContain("NEVER use the same opening phrase in consecutive questions");
        expect(result).toContain("Randomization Requirements");
        expect(result).toContain("DO NOT default to option A");
        expect(result).toContain("Output Format Requirements");
        expect(result).toContain("Verification Checklist");
    });

    test("F05_語彙多様性指示の確認", async () => {
        expect.assertions(6);
        
        const sectionNumber = 2;
        const speakerAccent: AccentType = "Canadian";
        const settings = service.getRandomSettings(1, sectionNumber);
        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        
        const result = await service.generatePart2AudioScriptPrompt(
            sectionNumber,
            speakerAccent,
            settings[0],
            speakerList
        );
        
        // 語彙多様性に関する具体的な指示の確認
        expect(result).toContain("Sure, I can help");
        expect(result).toContain("Of course, let me check");
        expect(result).toContain("I'm afraid I can't");
        expect(result).toContain("Sorry, I'm not available");
        expect(result).toContain("AVOID repetition: Do NOT overuse \"Certainly\", \"No problem\"");
        expect(result).toContain("If you used \"Certainly\" in a previous question, use a different expression");
    });

    test("F06_テンプレート変数置換確認", async () => {
        expect.assertions(5);
        
        const sectionNumber = 2;
        const speakerAccent: AccentType = "Australian";
        const settings = service.getRandomSettings(1, sectionNumber);
        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        
        const result = await service.generatePart2AudioScriptPrompt(
            sectionNumber,
            speakerAccent,
            settings[0],
            speakerList
        );
        
        // テンプレート変数が全て置換されていることを確認
        expect(result).not.toContain("{{accentInstructions}}");
        expect(result).not.toContain("{{settingInstruction}}");
        expect(result).not.toContain("{{wordConstraints}}");
        expect(result).not.toContain("{{speaker1}}");
        expect(result).not.toContain("{{checkList}}");
    });
});

/*
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
/*
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
