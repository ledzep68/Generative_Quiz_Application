import {Request, Response} from "express";
import fs from 'fs';
//import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import {config} from 'dotenv';

import * as controller from '../listening-quiz-transactions/lquizcontrollers.ts';
import * as apierror from '../listening-quiz-transactions/errors/lquiz.apierrors.ts';
import * as schema from '../listening-quiz-transactions/schemas/lquizapischema.ts';
import {JPN_AUDIO_SCRIPT_FORMAT} from '../listening-quiz-transactions/services/services.types.ts';
import * as apiservice from '../listening-quiz-transactions/services/lquizapiservice.ts';


import * as dto from '../listening-quiz-transactions/lquiz.dto.ts';
import z from 'zod';
import session from 'express-session';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({path: path.join(__dirname, '../.env')});
const projectRoot = path.resolve(__dirname, '../');  // serverディレクトリ
const credentialsPath = path.join(projectRoot, 'credentials/listening-quiz-audio-generator-b5d3be486e8f.json');

process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;


export async function callChatGPTForPart2AudioScript(prompt: string): Promise<{audioScript: string, answerOption: string}> {
    try {
        console.log('=== Step 1: fetch開始 (AudioScript生成) ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in TOEIC content creation. Return ONLY a valid JSON object with audioScript and answerOption fields as specified in the prompt. Do not include markdown code blocks or any other formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,  // 一貫性重視、適度なバリエーション
                max_tokens: 500,   // 必要十分な長さ
                top_p: 0.9        // 追加: より安定した出力
            }),
            signal: AbortSignal.timeout(60000)
        });
        
        console.log("response status:", response.status);
        console.log('=== Step 2: response確認 ===');
        
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        }

        console.log('=== Step 5: audioScript&answerOption抽出 ===');
        const jsonResponse = validatedData.choices[0].message.content;

        // 不要な文字列の除去（markdown形式等）
        let cleanedResponse = jsonResponse.trim();
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, ''); // 先頭の```jsonを削除
        cleanedResponse = cleanedResponse.replace(/^```.*\n?/, '');   // 先頭の```を削除
        cleanedResponse = cleanedResponse.replace(/\n?```$/, '');     // 末尾の```を削除

        console.log('=== Step 6: JSON parse実行 ===');
        const parsedJson = JSON.parse(cleanedResponse);

        //レスポンス形式の検証
        if (!parsedJson.audioScript || !parsedJson.answerOption) {
            throw new apierror.ChatGPTAPIError('必要なフィールド（audioScript, answerOption）が不足しています');
        }
        
        console.log('=== Step 7: 検証完了 ===');
        console.log("audioScript length:", parsedJson.audioScript.length);
        console.log("answerOption:", parsedJson.answerOption);

        return {
            audioScript: parsedJson.audioScript,
            answerOption: parsedJson.answerOption
        }
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        } else if (error instanceof apierror.ChatGPTAPIError) {
            throw error;
        } else {
            console.error('Unexpected ChatGPT API Error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};
//chatgpt - audioScript generation only
export async function callChatGPTForAudioScriptContent(prompt: string): Promise<string> {
    try {
        console.log('=== Step 1: fetch開始 (AudioScript生成) ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in TOEIC content creation. Return ONLY the audioScript content as plain text with proper speaker tags. Do not include JSON formatting, markdown code blocks, or any other formatting. Output only the conversation/speech content exactly as specified in the prompt."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0,
                max_tokens: 1000
            }),
            signal: AbortSignal.timeout(60000)
        });
        
        console.log("response status:", response.status);
        console.log('=== Step 2: response確認 ===');
        
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        }

        console.log('=== Step 5: audioScript抽出 ===');
        const audioScriptContent = validatedData.choices[0].message.content;

        //前後の空白除去
        const cleanedAudioScript = audioScriptContent.trim();
        
        console.log("cleaned audioScript: ", cleanedAudioScript);
        console.log('=== Step 6: audioScript検証完了 ===');
        console.log("generated audioScript length:", cleanedAudioScript.length);

        //JSONパースを削除し、クリーンアップされたテキストをそのまま返す
        return cleanedAudioScript;
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        } else if (error instanceof apierror.ChatGPTAPIError) {
            throw error;
        } else {
            console.error('Unexpected ChatGPT API Error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};

export async function callChatGPTForAudioScriptQuestions(prompt: string): Promise<{audioScript: string, answerOptionList: string[]}> {
    try {
        console.log('=== Step 1: fetch開始 (Questions&Choices生成) ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in TOEIC question creation. Return ONLY a valid JSON object with audioScript and answerOption fields. Do not use markdown code blocks or any other formatting. Output only the JSON object exactly as specified in the prompt."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4,        // 変更: 0 → 0.4 (創造性と一貫性のバランス)
                max_tokens: 3000,       // 変更: 2000 → 3000 (思考プロセス用)
                top_p: 0.9,             // 追加: より質の高い選択
                presence_penalty: 0.1,   // 追加: 繰り返し回避
                frequency_penalty: 0.1   // 追加: 語彙の多様性向上
            }),
            signal: AbortSignal.timeout(60000)
        });
        
        console.log("response status:", response.status);
        console.log('=== Step 2: response確認 ===');
        
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        }

        console.log('=== Step 5: Questions&Choices抽出 ===');
        const jsonResponse = validatedData.choices[0].message.content;

        // 不要な文字列の除去（markdown形式等）
        let cleanedResponse = jsonResponse.trim();
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, ''); // 先頭の```jsonを削除
        cleanedResponse = cleanedResponse.replace(/^```.*\n?/, '');   // 先頭の```を削除
        cleanedResponse = cleanedResponse.replace(/\n?```$/, '');     // 末尾の```を削除
        
        console.log("cleaned JSON response: ", cleanedResponse);

        console.log('=== Step 6: JSON parse実行 ===');
        const result = JSON.parse(cleanedResponse);
        
        //レスポンス形式の検証
        if (!result.audioScript || !result.answerOptionList) {
            throw new apierror.ChatGPTAPIError('必要なフィールド（audioScript, answerOptionList）が不足しています');
        }
        
        // answerOptionが配列かどうかチェック
        if(!Array.isArray(result.answerOptionList)) {
            throw new apierror.ChatGPTAPIError('answerOptionListは配列である必要があります');
        }
        
        console.log('=== Step 7: 検証完了 ===');
        console.log("audioScript length:", result.audioScript.length);
        console.log("answerOptionList:", result.answerOptionList);

        return {
            audioScript: result.audioScript,
            answerOptionList: result.answerOptionList
        };
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error('JSON parse error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答が有効なJSON形式ではありません');
        } else if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        } else if (error instanceof apierror.ChatGPTAPIError) {
            throw error;
        } else {
            console.error('Unexpected ChatGPT API Error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};

export async function callChatGPTForJpnAudioScript(prompt: string): Promise<string> {
    try {
        console.log('=== Step 1: fetch開始 (jpnAudioScript生成) ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert Japanese translator specializing in TOEIC materials. Translate the provided English TOEIC content into natural Japanese following the exact format specified in the prompt. Return ONLY the structured Japanese text as specified. Do not include explanations, markdown formatting, JSON, or any additional text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,        //翻訳の一貫性を保ちつつ自然さを確保
                max_tokens: 2000,       //日本語は文字数が多くなるため増量
                top_p: 0.9,
                presence_penalty: 0.1
            }),
            signal: AbortSignal.timeout(90000)
        });
        
        console.log("response status:", response.status);
        console.log('=== Step 2: response確認 ===');
        
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        }

        console.log('=== Step 5: jpnAudioScript抽出 ===');
        const jpnAudioScriptContent = validatedData.choices[0].message.content;

        //前後の空白除去
        const cleanedJpnAudioScript = jpnAudioScriptContent.trim();
        
        console.log("cleaned jpnAudioScript: ", cleanedJpnAudioScript);
        console.log('=== Step 6: jpnAudioScript検証完了 ===');
        console.log("generated jpnAudioScript length:", cleanedJpnAudioScript.length);

        return cleanedJpnAudioScript;
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        } else if (error instanceof apierror.ChatGPTAPIError) {
            throw error;
        } else {
            console.error('Unexpected ChatGPT API Error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};

export async function callChatGPTForExplanation(prompt: string): Promise<string> {
    try {
        console.log('=== Step 1: fetch開始 (explanation生成) ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert TOEIC instructor specializing in creating detailed explanations in Japanese. Generate comprehensive explanations that help students understand correct answers, analyze incorrect options, and improve their listening skills. Focus on practical learning points and accent-specific pronunciation guidance. Return ONLY the Japanese explanation text as specified. Do not include formatting, markdown, or additional text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4,        // 解説の一貫性と教育的配慮のバランス
                max_tokens: 1500,       // 500-700文字の日本語解説に適切
                top_p: 0.9,
                presence_penalty: 0.1,
                frequency_penalty: 0.1   // 語彙の多様性確保
            }),
            signal: AbortSignal.timeout(90000)
        });
        
        console.log("response status:", response.status);
        console.log('=== Step 2: response確認 ===');
        
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        }

        console.log('=== Step 5: explanation抽出 ===');
        const explanationContent = validatedData.choices[0].message.content;

        //前後の空白除去
        const cleanedExplanation = explanationContent.trim();
        
        console.log("cleaned explanation: ", cleanedExplanation);
        console.log('=== Step 6: explanation検証完了 ===');
        console.log("generated explanation length:", cleanedExplanation.length);

        return cleanedExplanation;
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        } else if (error instanceof apierror.ChatGPTAPIError) {
            throw error;
        } else {
            console.error('Unexpected ChatGPT API Error:', error);
            throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};


async function part2AudioScript() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audioScriptPromptPath = path.join(__dirname, 'test-part2-audioscript-prompt.md');
    const audioScriptPrompt = await fs.readFile(audioScriptPromptPath, 'utf8');
    console.log("testprompt: ", audioScriptPrompt);
    const response = await callChatGPTForPart2AudioScript(audioScriptPrompt);
    console.log("response", response);
};
async function audioScriptContent() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audioScriptPromptPath = path.join(__dirname, 'test-audioscript-prompt.md');
    const audioScriptPrompt = await fs.readFile(audioScriptPromptPath, 'utf8');
    console.log("testprompt: ", audioScriptPrompt);
    const response = await callChatGPTForAudioScriptContent(audioScriptPrompt);
    console.log("response", response);
};

async function audioScriptQuestions() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audioScriptPromptPath = path.join(__dirname, 'test-audioscript-questions-prompt.md');
    const audioScriptPrompt = await fs.readFile(audioScriptPromptPath, 'utf8');
    console.log("testprompt: ", audioScriptPrompt);
    const response = await callChatGPTForAudioScriptQuestions(audioScriptPrompt);
    console.log("response", response);
};

async function jpnAudioScript() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jpnAudioScriptPromptPath = path.join(__dirname, 'test-part2-jpnaudioscript-prompt.md');
    const jpnAudioScriptPrompt = await fs.readFile(jpnAudioScriptPromptPath, 'utf8');
    console.log("testprompt: ", jpnAudioScriptPrompt);
    const response = await callChatGPTForJpnAudioScript(jpnAudioScriptPrompt);
    console.log("response", response);
};

async function explanation() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const explanationPromptPath = path.join(__dirname, 'test-part2-explanation-prompt.md');
    const explanationPrompt = await fs.readFile(explanationPromptPath, 'utf8');
    console.log("testprompt: ", explanationPrompt);
    const response = await callChatGPTForExplanation(explanationPrompt);
    console.log("response", response);
};


//part2AudioScript().catch(console.error);
//audioScriptContent().catch(console.error);
//audioScriptQuestions().catch(console.error);
//jpnAudioScript().catch(console.error);
explanation().catch(console.error);

/*
async function callGoogleCloudTTSRealAPITest() {
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

    const result = await apiservice.callGoogleCloudTTS(mockSSML, mockQuestionID);
            
    console.log(`✅ テスト成功: バッファデータ: ${result}, 音声データサイズ ${result.length} bytes`);
    console.log(`✅ 問題ID: ${mockQuestionID}`);
};

//音声生成関数　controllerで呼び出す
export async function generateAudioContent(dto: dto.NewAudioReqDTO, lQuestionID: string): Promise<domein.AudioFilePath> {
    //音声性別設定取得
    const genderSettings = GenderRequirementsExtracter.extractGenderRequirements(dto.sectionNumber, dto.audioScript);
    //音声設定取得
    const voiceSettings = TTS_VOICE_CONFIG[dto.speakerAccent as AccentType];
    //ランダム音声選択
    const selectedVoice = TOEICVoiceSelector.selectVoicesForPart(dto.sectionNumber, voiceSettings.voices, genderSettings);
    //audioScript分割
    const audioSegmentList = AudioScriptSegmenter.segmentAudioScriptWithGender(dto.audioScript, selectedVoice);
    //SSML生成
    const ssml = await TOEICSSMLGenerator.generateSSML(dto.sectionNumber, audioSegmentList, dto.speakingRate);
    // SSML検証
    validateSSML(ssml);
    //(Google Cloud TTS)音声合成
    const audioBufferData = await callGoogleCloudTTS(ssml, lQuestionID);
    //ファイル保存、URL取得
    const audioFilePath = await saveAudioFile(audioBufferData, lQuestionID);

    return audioFilePath;
};
*/
/*
async function callGoogleCloudTTSRealAPIAndSaveFlieTest() {
    const mockSSML = `<?xml version="1.0" encoding="UTF-8"?>
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
        <break time="1s"/>

        <!-- Part 4: Talk (British Female Speaker - Company Update) -->
        <voice name="en-GB-Wavenet-A">
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
                <break time="1s"/>
                We expect this expansion to create approximately fifty new job opportunities across various departments. 
                <break time="1s"/>
                Additionally, we're investing two million dollars in upgrading our technology infrastructure to support future growth.
                <break time="2s"/>
            </prosody>
        </voice>

        <!-- Questions (American Male Speaker) -->
        <voice name="en-US-Wavenet-B">
            <prosody rate="0.9">
                <break time="0.5s"/>
                <!-- Question 1 -->
                What is the main topic of the talk? 
                <break time="0.8s"/> 
                A. New employee training 
                <break time="0.8s"/> 
                B. Company financial results 
                <break time="0.8s"/> 
                C. Product development 
                <break time="0.8s"/> 
                D. Market research
                <break time="2s"/>

                <!-- Question 2 -->
                What contributed to the company's success? 
                <break time="0.8s"/> 
                A. Reduced operating costs 
                <break time="0.8s"/> 
                B. New product line and better customer service 
                <break time="0.8s"/> 
                C. Increased marketing budget 
                <break time="0.8s"/> 
                D. Strategic partnerships
                <break time="2s"/>

                <!-- Question 3 -->
                How many new job opportunities will be created? 
                <break time="0.8s"/> 
                A. Twenty-five 
                <break time="0.8s"/> 
                B. Thirty 
                <break time="0.8s"/> 
                C. Forty 
                <break time="0.8s"/> 
                D. Fifty
                <break time="2s"/>
            </prosody>
        </voice>
        
        <break time="3s"/>
    </speak>`;

    const mockQuestionID = 'listening-part4-ABC12345';

    const response = await apiservice.callGoogleCloudTTS(mockSSML, mockQuestionID);
    console.log(`✅ 音声データ生成成功: 音声データサイズ ${response.length} bytes`);
    const audioFilePath = await apiservice.saveAudioFile(response, mockQuestionID);
    console.log(`✅ 音声データ保存テスト成功`);
};

async function generateAudioContentTest() {
    const mockNewAudioReqDTO: dto.NewAudioReqDTO = {
        sectionNumber: 4,
        audioScript: '[Speaker1_FEMALE] Welcome to City International Airport. [short pause] We are pleased to offer a range of services to enhance your travel experience. [short pause] For your convenience, our information desks are located throughout the terminal, staffed with friendly personnel ready to assist you. [short pause] We also provide complimentary Wi-Fi access, available in all areas of the airport. [short pause] For those traveling with children, our family lounges offer a comfortable space with play areas. [short pause] Additionally, [short pause] we have partnered with local businesses to offer exclusive discounts at various shops and restaurants within the airport. [short pause] Simply present your boarding pass to enjoy these offers. [short pause] We hope you have a pleasant journey. [pause] [Speaker2] [pause] What service is available throughout the airport? [short pause] A. [short pause] Free Wi-Fi access [short pause] B. [short pause] Complimentary meals [short pause] C. [short pause] Personal shopping assistants [short pause] D. [short pause] Free parking [pause] What should passengers show to get discounts? [short pause] A. [short pause] Passport [short pause] B. [short pause] Boarding pass [short pause] C. [short pause] Flight ticket [short pause] D. [short pause] ID card [pause] Where can families find a comfortable space? [short pause] A. [short pause] Information desks [short pause] B. [short pause] Family lounges [short pause] C. [short pause] Business lounges [short pause] D. [short pause] Security area',
        speakerAccent: "American",
        speakingRate: 1.0
    };
    const mockQuestionID = 'listening-part4-ABC12345';
    const audioFilePath = await apiservice.generateAudioContent(mockNewAudioReqDTO, mockQuestionID);
    console.log(`✅ 音声データ連結テスト成功: ${audioFilePath}`);
};
*/

export function createDummyRequest(): Partial<Request> {
    return {
        session: {
            id: 'test-session-12345',
            questionSet: {
                sectionNumber: 2,
                totalQuestionNum: 5,
                currentIndex: 0,
                speakerAccentList: ['American', 'British', 'Canadian', 'Australian', 'American'],
                settingList: [
                    { location: 'airport', speaker: 'traveler', situation: 'facility inquiry' },
                    { location: 'office', speaker: 'employee', situation: 'work progress' },
                    { location: 'restaurant', speaker: 'customer', situation: 'order taking' },
                    { location: 'hotel', speaker: 'guest', situation: 'check-in' },
                    { location: 'store', speaker: 'shopper', situation: 'product inquiry' }
                ],
                speakingRate: 1.0
            },
            // 最小限のセッションプロパティ
            save: (callback?: (err: any) => void) => {
                if (callback) callback(null);
            },
            destroy: (callback?: (err: any) => void) => {
                if (callback) callback(null);
            }
        } as any,
        body: {},
        headers: {},
        method: 'POST',
        url: '/api/question/part2/generate'
    };
}

interface TestResponse {
    res: Partial<Response>;
    responseData: any;
    statusCode: number;
}

export function createDummyResponse(): TestResponse {
    let responseData: any = null;
    let statusCode: number = 200;
    
    const res: Partial<Response> = {
        json: (data: any) => {
            responseData = data;
            console.log('📤 レスポンス:', data);
            return res as Response;
        },
        status: (code: number) => {
            statusCode = code;
            console.log(`📊 ステータス: ${code}`);
            return {
                json: (data: any) => {
                    responseData = data;
                    console.log(`❌ エラーレスポンス [${code}]:`, data);
                    return res as Response;
                }
            } as any;
        }
    };
    return { 
        res, 
        get responseData() { return responseData; }, 
        get statusCode() { return statusCode; } 
    };
}

async function testPart2Integration() {
    console.log('🚀 Part2統合テスト開始');
    console.log('=====================================');
    
    // Arrange
    const req = createDummyRequest() as Request;
    const { res, responseData, statusCode } = createDummyResponse();
    
    // テスト開始時刻
    const startTime = Date.now();
    console.log(`⏰ 開始時刻: ${new Date().toISOString()}`);
    
    try {
        // Act - 実際のController実行
        console.log('📋 セッション情報:');
        console.log('  - sectionNumber:', req.session.questionSet?.sectionNumber);
        console.log('  - currentIndex:', req.session.questionSet?.currentIndex);
        console.log('  - totalQuestionNum:', req.session.questionSet?.totalQuestionNum);
        console.log('  - speakingRate:', req.session.questionSet?.speakingRate);
        
        await controller.generatePart2LQuizController(req, res as Response);
        
        // Assert - 結果検証
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('=====================================');
        console.log('✅ テスト完了');
        console.log(`⏱️  総処理時間: ${executionTime}ms (${(executionTime/1000).toFixed(2)}秒)`);
        
        // レスポンス検証
        if (responseData) {
            console.log('📊 結果検証:');
            console.log(`  - questionHash: ${responseData} (${typeof responseData})`);
            console.log(`  - hash長さ: ${responseData.length}文字`);
            
            if (typeof responseData === 'string' && responseData.length === 12) {
                console.log('✅ questionHash形式: OK');
            } else {
                console.log('❌ questionHash形式: NG');
            }
        }
        
        // DB確認（オプション）
        console.log('📋 次の確認項目:');
        console.log('  - DBに問題データが保存されているか');
        console.log('  - 音声ファイルが生成されているか');
        console.log('  - セッションのcurrentIndexは更新されたか');
        
    } catch (error) {
        const endTime = Date.now();
        console.log('=====================================');
        console.log('❌ テスト失敗');
        console.log(`⏱️  実行時間: ${endTime - startTime}ms`);
        console.error('💥 エラー詳細:', error);
        
        if (error instanceof Error) {
            console.error('📝 エラーメッセージ:', error.message);
            console.error('📚 スタックトレース:', error.stack);
        }
    }
}

// テスト実行
testPart2Integration();
