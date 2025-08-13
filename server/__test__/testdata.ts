import {callChatGPT} from '../listening-quiz-transactions/services/lquizapiservice.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import {config} from 'dotenv';
import * as apierror from '../listening-quiz-transactions/errors/lquiz.apierrors.ts';
import * as schema from '../listening-quiz-transactions/schemas/lquizapischema.ts';
import {JPN_AUDIO_SCRIPT_FORMAT} from '../listening-quiz-transactions/services/services.types.ts';
import * as apiservice from '../listening-quiz-transactions/services/lquizapiservice.ts';
import * as dto from '../listening-quiz-transactions/lquiz.dto.ts';
import z from 'zod';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//config({path: path.join(__dirname, '../../.env')});
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../credentials/listening-quiz-audio-generator-b5d3be486e8f.json');


//chatgpt - audioScript generation only
export async function callChatGPTForAudioScript(prompt: string): Promise<string> {
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
                        content: "You are an expert in TOEIC question creation. Return ONLY a valid JSON object with audioScript and answerOption fields. Do not use markdown code blocks."
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
        const audioScriptAndAnswerOption = validatedData.choices[0].message.content;

        // 不要な文字列の除去（markdown形式等）
        let cleanedAudioScript = audioScriptAndAnswerOption.trim();
        cleanedAudioScript = cleanedAudioScript.replace(/^```.*\n?/, ''); // 先頭の```を削除
        cleanedAudioScript = cleanedAudioScript.replace(/\n?```$/, '');   // 末尾の```を削除
        cleanedAudioScript = cleanedAudioScript.replace(/^"|"$/g, '');   // 前後のクォートを削除
        console.log("cleaned audioScript: ", cleanedAudioScript);

        console.log('=== Step 6: audioScript検証完了 ===');
        console.log("generated audioScript length:", cleanedAudioScript.length);

        const result = JSON.parse(cleanedAudioScript);
        console.log("result: ", result);
        return result;
        
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



/*
async function audioScript() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audioScriptPromptPath = path.join(__dirname, 'test-audioscript-prompt.md');
    const audioScriptPrompt = await fs.readFile(audioScriptPromptPath, 'utf8');
    console.log("testprompt: ", audioScriptPrompt);
    //const response = await callChatGPT(testprompt);
    const response = await callChatGPTForAudioScript(audioScriptPrompt);
    console.log("response", response);
};
*/

/*async function jpnAudioScript() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jpnAudioScriptPromptPath = path.join(__dirname, 'test-jpnaudioscript-prompt.md');
    const jpnAudioScriptPrompt = await fs.readFile(jpnAudioScriptPromptPath, 'utf8');
    console.log("testprompt: ", jpnAudioScriptPrompt);
    //const response = await callChatGPT(testprompt);
    const response = await apiservice.callChatGPTForJpnAudioScript(jpnAudioScriptPrompt);
    console.log("response", response);
};*/
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

generateAudioContentTest().catch(console.error);