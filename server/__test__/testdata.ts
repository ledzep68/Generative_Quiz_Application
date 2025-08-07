import {callChatGPT} from '../listening-quiz-transactions/services/lquizapiservice.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import {config} from 'dotenv';
import * as apierror from '../listening-quiz-transactions/errors/lquiz.apierrors.ts';
import * as schema from '../listening-quiz-transactions/schemas/lquizapischema.ts';
import z from 'zod';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({path: path.join(__dirname, '../.env')});



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
}

async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const promptPath = path.join(__dirname, 'testprompt.md');
    const testprompt = await fs.readFile(promptPath, 'utf8');
    console.log("testprompt: ", testprompt);
    //const response = await callChatGPT(testprompt);
    const response = await callChatGPTForAudioScript(testprompt);
    console.log("response", response);
};

main().catch(console.error);