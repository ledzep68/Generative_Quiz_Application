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
import { get } from 'http';

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

describe('F_generatePart2AudioScriptPrompt', () => {
    test("F01_プロンプト生成成功", async () => {
        const sectionNumber = 2;
        expect.assertions(6);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 2,
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

        const speakerList = service.getRandomSpeakers(sectionNumber) as string[];
        //プロンプト生成
        const result = await service.generatePart2AudioScriptPrompt(sectionNumber, speakerAccentList[currentIndex], settings[currentIndex], speakerList);
        console.log(result);
        
        // Part 2 content生成用のアサーション
        expect(result).toContain("TOEIC Part 2 Content Generation Prompt");
        expect(result).toContain("Generate realistic question/comment and three response options");
        expect(result).toContain("**Speaker 1**: One question or comment");
        expect(result).toContain("**Speaker 2**: Three different response options");
        expect(result).toContain("Accent Requirements:");
        expect(result).toContain("answerOption");
    });
});

describe('G_generatePart2SingleExplanationPrompt', () => {
    test("G01_プロンプト生成成功", async () => {
        const speakerAccnet = "American";
        const audioScript = "[Speaker1_MALE] How's the afternoon shift progressing? [Speaker2_MALE] A. Certainly, it's on schedule. B. That's excellent, how about you? C. Of course, it starts tomorrow.";
        const answerOption = "A";
        
        const result = await service.generatePart2SingleExplanationPrompt(speakerAccnet, audioScript, answerOption);
        console.log(result);
        expect(result).toContain("Part 2");
        expect(result).toContain("[Speaker1_MALE]");
        expect(result).toContain("American");
    })
})

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
*/