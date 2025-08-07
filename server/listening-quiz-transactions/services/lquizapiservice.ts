/*********************************************

lquizapiservice.tsの機能:
    ・外部API連携担当
    ・OpenAI APIとのAPI通信
    ・Google Cloud TTS APIとのAPI通信

******************************************/

import * as domein from "../lquiz.domeinobject.ts";
import * as dto from "../lquiz.dto.ts";
import * as apierror from "../errors/lquiz.apierrors.ts";
import * as schema from "../schemas/lquizapischema.ts";
import {SECTION_SPECS, AUDIO_SCRIPT_STRUCTURES, JPN_AUDIO_SCRIPT_FORMAT, PART_GENRES, ACCENT_PATTERNS, TTS_VOICE_CONFIG, PART_SPECIFIC_SCENARIOS, WORD_CONSTRAINTS, TOPIC_MAPPING, SITUATION_ELEMENTS, SPEAKER_ELEMENTS, LOCATION_ELEMENTS} from "./services.types.ts";

import { z } from "zod";
import {GoogleAuth} from "google-auth-library";
import { spawn } from 'child_process'; //ライブラリを通さず、直接他プログラムを実行するためのライブラリ
import fs from "fs/promises"; //音声バッファデータをローカルファイルに書き込むためのライブラリ
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({path: path.join(__dirname, '../../.env')});

//==========================================================================
//問題生成処理モジュール群
//==========================================================================

export type AccentType = keyof typeof ACCENT_PATTERNS; 
export type SpeakerAccent = typeof ACCENT_PATTERNS[keyof typeof ACCENT_PATTERNS]; 

//ランダム選択関数 リクエストされた問題数分のアクセントを返す
export function getRandomSpeakerAccent(requestedNumOfQuizs: number): AccentType[] {
    // TOEIC実際の出題頻度を反映した重み設定
    const accentWeights: Record<AccentType, number> = {
        'American': 0.5,    // 50% - 最も高頻度
        'British': 0.25,    // 25% - 中頻度
        'Australian': 0.15, // 15% - 低頻度
        'Canadian': 0.1     // 10% - 最低頻度
    };
    
    // 累積重みの配列を作成
    const accents = Object.keys(accentWeights) as AccentType[];
    const weights = accents.map(accent => accentWeights[accent]);
    const cumulativeWeights: number[] = [];
    
    weights.reduce((sum, weight) => {
        sum += weight;
        cumulativeWeights.push(sum);
        return sum;
    }, 0);
    
    // 重み付きランダム選択関数
    function selectWeightedRandom(): AccentType {
        const random = Math.random();
        const index = cumulativeWeights.findIndex(weight => random <= weight);
        return accents[index];
    }
    
    // 指定された問題数分のアクセントを選択
    return Array.from({ length: requestedNumOfQuizs }, () => selectWeightedRandom());
};

//問題生成関数 controllerで呼び出す
export async function generateLQuestionContent(domObj: domein.NewLQuestionInfo, currentIndex: number): Promise<dto.GeneratedQuestionDataResDTO[]> {
    //プロンプト生成
    const prompt = await generateSingleAudioScriptPrompt(domObj, currentIndex);
    //・(ChatGPT-4o API)クイズ生成プロンプト生成
    const generatedQuizDataList = await callChatGPT(prompt); //バリデーション済

    //似たような問題の生成をどうやって防止するか？
    return  generatedQuizDataList;
};

//audioScript構造の選択
function generateAudioStructureText(sectionNumber: number): string {
    const structure = AUDIO_SCRIPT_STRUCTURES[sectionNumber as keyof typeof AUDIO_SCRIPT_STRUCTURES];
    
    if (!structure) {
        return '';
    }
    
    return `
- **Structure**: ${structure.structure}
- **Rules**: ${structure.rules.map(rule => `  - ${rule}`).join('\n')}
- **Example**: "${structure.example}"`;
};

function selectAnswerOptionGenerationRules(sectionNumber: number): string {
    const rules = {
        1: "- **Part 1:** Generate 1 correct answer, return array with 1 element: [\"A\"] or [\"B\"] or [\"C\"] or [\"D\"]",
        2: "- **Part 2:** Generate 1 correct answer, return array with 1 element: [\"A\"] or [\"B\"] or [\"C\"]", 
        3: "- **Part 3:** Generate 3 correct answers, return array with 3 elements: [\"A\", \"B\", \"C\"] or [\"B\", \"C\", \"A\"] etc.",
        4: "- **Part 4:** Generate 3 correct answers, return array with 3 elements: [\"A\", \"B\", \"C\"] or [\"B\", \"C\", \"A\"] etc."
    };

    const specificRule = rules[sectionNumber as keyof typeof rules];
    
    if (!specificRule) {
        return "";
    }

    return specificRule;
};

//状況設定のランダム選択関数
function getRandomSettings(requestedNumOfLQuizs: number, sectionNumber: number) {
   const scenarios = PART_SPECIFIC_SCENARIOS[sectionNumber as keyof typeof PART_SPECIFIC_SCENARIOS];
   const shuffledScenarios = [...scenarios].sort(() => 0.5 - Math.random());
   
   return Array.from({ length: requestedNumOfLQuizs }, (_, i) => 
       shuffledScenarios[i % shuffledScenarios.length]
   );
};

function generateContentTopicInstructions(requestedNumOfLQuizs: number, /*sectionNumber: number,*/ settings: Array<{location: string, speaker: string, situation: string}>): string[] {
    return settings.slice(0, requestedNumOfLQuizs).map((setting, index) => {
        const topic = generateTopicFromSituation(setting.situation);
        
        return `**Question ${index + 1}**: Content must focus on **${topic}**`;
    });
};

//要求問題数の数だけcontentFrameworkを生成
function generateContentFrameworks(requestedNumOfLQuizs: number, sectionNumber: number, settings: Array<{location: string, speaker: string, situation: string}>): string[] {
    // Part 4以外では空配列を返す
    if (sectionNumber !== 4) {
        return Array(requestedNumOfLQuizs).fill('');
    }
    
    return settings.map((setting, index) => {
        // 各問題ごとに配列から要素を取り出す
        const { location, speaker, situation } = setting;
        
        const topic = generateTopicFromSituation(situation);
        const keyElements = generateKeyElementsFromContext(situation, speaker, location);
        
        return `### Question ${index + 1}: ${situation}
- **Content Focus**: ${speaker} delivering ${situation.toLowerCase()} at ${location}
- **Speaker Context**: Professional ${speaker.toLowerCase()} providing ${topic}
- **Key Elements**: ${keyElements}
- **Correct Choice**: Must relate to ${topic}`;
    });
};
/**
 * generateTopicFromSituation
 * 役割: 論理的整合性の確保
 * 機能: situationから明確なトピックを生成し、Content→Question→Answerの論理的流れを保証
 */
function generateTopicFromSituation(situation: string): string {
    
    // 1. 完全一致を最優先（論理的整合性の確保）
    const exactMatch = TOPIC_MAPPING[situation.toLowerCase()];
    if (exactMatch) {
        return exactMatch;
    }
    
    // 2. 部分一致による柔軟な対応
    const keywords = situation.toLowerCase().split(' ');
    for (const keyword of keywords) {
        for (const [mappedSituation, topic] of Object.entries(TOPIC_MAPPING)) {
            if (mappedSituation.includes(keyword)) {
                return topic;
            }
        }
    }
    
    // 3. フォールバック（100%の対応を保証）
    return `${situation.toLowerCase().replace(/\s+/g, ' ')} content`;
};

/**
 * generateKeyElementsFromContext  
 * 役割: 品質の均一化と向上
 * 機能: situation、speaker、locationの文脈から具体的な要素を生成し、一貫した高品質な内容を保証
 */
function generateKeyElementsFromContext(situation: string, speaker: string, location: string): string {
    // 要素収集ロジック
    let elements: string[] = [];
    
    //situationから基本要素を取得
    const situationLower = situation.toLowerCase();
    for (const [keyword, elementList] of Object.entries(SITUATION_ELEMENTS)) {
        if (situationLower.includes(keyword)) {
            elements.push(...elementList);
            break;
        }
    }
    
    //speakerから専門性要素を追加
    const speakerLower = speaker.toLowerCase();
    for (const [keyword, elementList] of Object.entries(SPEAKER_ELEMENTS)) {
        if (speakerLower.includes(keyword)) {
            elements.push(...elementList);
            break;
        }
    }
    
    //locationから環境要素を追加
    const locationLower = location.toLowerCase();
    for (const [keyword, elementList] of Object.entries(LOCATION_ELEMENTS)) {
        if (locationLower.includes(keyword)) {
            elements.push(...elementList);
            break;
        }
    }
    
    //品質保証処理
    //重複削除
    const uniqueElements = [...new Set(elements)];
    
    //最適な要素数に調整（3-4個が適切）
    const finalElements = uniqueElements.slice(0, 4);
    
    //要素が見つからない場合の処理
    if (finalElements.length === 0) {
        finalElements.push('relevant information', 'important details', 'key procedures');
    }
    
    return finalElements.join(', ');
};

function generateChecklistForPart(sectionNumber: number, constraints: any): string {    
    let checklist = `
## Verification Checklist (Must check before generation)
- □ Are correct answers properly distributed among A, B, C, D?`;
    
    //Part2は選択肢がA, B, Cのみ
    if (sectionNumber === 2) {
        checklist = checklist.replace('A, B, C, D', 'A, B, C');
    }
    
    checklist += `
- □ Are the same choices not consecutive for 3 or more questions?`;
    
    //Part別の単語数チェック項目を追加
    Object.entries(constraints).forEach(([key, value]) => {
        if (key === 'choices') {
            checklist += `
- □ Is each ${key} within the ${value} range?`;
        } else if (key === 'totalWords') {
            checklist += `
- □ Is the total word count within the ${value} range?`;
        } else {
            checklist += `
- □ Is each ${key} within the ${value} range?`;
        }
    });
    
    checklist += `
**Continue corrections until all checklist items are checked**`;
    
    return checklist;
};

//audioScriptと正解選択肢生成
export async function generateSingleAudioScriptPrompt(domObj: domein.NewLQuestionInfo, currentIndex: number): Promise<string> {
    //基本情報の取得
    const sectionNumber = domObj.sectionNumber as keyof typeof SECTION_SPECS;
    const spec = SECTION_SPECS[sectionNumber];
    const audioStructure = AUDIO_SCRIPT_STRUCTURES[sectionNumber];
    const genres = PART_GENRES[sectionNumber];
    const constraints = WORD_CONSTRAINTS[sectionNumber];

    //設定生成
    const settings = getRandomSettings(domObj.requestedNumOfLQuizs, domObj.sectionNumber);
    //const answerOptionList = generateBalancedAnswers(domObj.requestedNumOfLQuizs as number, sectionNumber);

    //テキスト構築
    const settingVariationsText = settings.map((setting, index) => 
        `**Question ${index + 1}**: Location ${setting.location}, Speaker ${setting.speaker}, Situation ${setting.situation}`
    ).join('\n');

    const genresText = genres.map((genre, index) => `${index + 1}. **${genre}`).join('\n');

    const constraintsText = Object.entries(constraints)
        .map(([key, value]) => {
            if (typeof value === 'object' && value.min && value.max) {
                return `- **${key}**: Minimum word count ${value.min}${value.unit}, Maximum word count ${value.max}${value.unit}`;
            }
            return `- **${key}**: ${value}`;
        })
        .join('\n');

    const audioStructureText = `
- **Structure**: ${audioStructure.structure}
- **Rules**: ${audioStructure.rules.map(rule => `  - ${rule}`).join('\n')}
- **Example**: "${audioStructure.example}"`;

    //プロンプトテンプレート処理
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'audioscript-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');

        const audioStructureText = generateAudioStructureText(sectionNumber);
        const answerOptionRule = selectAnswerOptionGenerationRules(sectionNumber);

        const contentTopicInstruction = generateContentTopicInstructions(domObj.requestedNumOfLQuizs, settings);
        const contentFrameworksText = generateContentFrameworks(domObj.requestedNumOfLQuizs, sectionNumber, settings);

        // 5. テンプレート置換
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{spec\.description\}\}/g, spec.description)
            .replace(/\{\{spec\.format\}\}/g, spec.format)
            .replace(/\{\{spec\.requirements\}\}/g, spec.requirements)
            .replace(/\{\{audioStructure\}\}/g, audioStructureText)
            .replace(/\{\{answerOptionRule\}\}/g, answerOptionRule)
            .replace(/\{\{partGenres\}\}/g, genresText)
            .replace(/\{\{wordConstraints\}\}/g, constraintsText)
            .replace(/\{\{settingVariations\}\}/g, settingVariationsText)
            .replace(/\{\{contentTopicInstruction\}\}/g, contentTopicInstruction[currentIndex])
            .replace(/\{\{contentFrameworks\}\}/g, contentFrameworksText[currentIndex])
            .replace(/\{\{checkList\}\}/g, generateChecklistForPart(sectionNumber, constraints));
            
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('audioScriptのPromptの生成に失敗しました');
    } 
};

//audioScript, answerOption生成
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
        let cleanedAudioScriptAndAnswerOption = audioScriptAndAnswerOption.trim();
        cleanedAudioScriptAndAnswerOption = cleanedAudioScriptAndAnswerOption.replace(/^```.*\n?/, ''); // 先頭の```を削除
        cleanedAudioScriptAndAnswerOption = cleanedAudioScriptAndAnswerOption.replace(/\n?```$/, '');   // 末尾の```を削除
        cleanedAudioScriptAndAnswerOption = cleanedAudioScriptAndAnswerOption.replace(/^"|"$/g, '');   // 前後のクォートを削除
        console.log("cleaned audioScript: ", cleanedAudioScriptAndAnswerOption);

        console.log('=== Step 6: audioScript検証完了 ===');
        console.log("generated audioScript length:", cleanedAudioScriptAndAnswerOption.length);

        const result = JSON.parse(cleanedAudioScriptAndAnswerOption);
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

export async function generateSingleJpnAudioScriptPrompt(sectionNumber: number, audioScript: string): Promise<string> {
    const jpnAudioScriptFormat = JPN_AUDIO_SCRIPT_FORMAT[sectionNumber as keyof typeof JPN_AUDIO_SCRIPT_FORMAT];
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'jpn-audioscript-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{audioScript\}\}/g, audioScript)
            .replace(/\{\{jpnAudioScriptFormat\}\}/g, jpnAudioScriptFormat);
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('jpnAudioScriptのPromptの生成に失敗しました');
    }
};

//jpnAudioScript生成
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
                        content: "You are an expert English-Japanese translator specializing in TOEIC educational materials. Provide natural and accurate Japanese translations in the specified format only."
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
        };
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();
        
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);

        console.log('=== Step 5: jpnAudioScript抽出 ===');
        const jpnAudioScript = validatedData.choices[0].message.content;
        return jpnAudioScript;
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

export async function generateSingleExplanationPrompt(domObj: domein.NewLQuestionInfo, jpnAudioScriptFormat: string, audioScript: string, answerOptionList: ("A" | "B" | "C" | "D")[]): Promise<string> {
    const sectionNumber = domObj.sectionNumber;
    const speakerAccent = domObj.speakerAccent as "American" | "British" | "Canadian" | "Australian";
    const accentPattern = ACCENT_PATTERNS[speakerAccent as keyof typeof ACCENT_PATTERNS];

    const accentDescription = accentPattern.description;
    const pronunciationCharacteristics = accentPattern.characteristics;
    const regionalVocabulary = accentPattern.vocabulary;
    const typicalExpressions = accentPattern.expressions;

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'explanation-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{speakerAccent\}\}/g, speakerAccent)
            .replace(/\{\{audioScript\}\}/g, audioScript)
            .replace(/\{\{answerOptionList\}\}/g, answerOptionList.toString())
            .replace(/\{\{accentDescription\}\}/g, accentDescription)
            .replace(/\{\{pronunciationCharacteristics\}\}/g, pronunciationCharacteristics.toString())
            .replace(/\{\{regionalVocabulary\}\}/g, regionalVocabulary.toString())
            .replace(/\{\{typicalExpressions\}\}/g, typicalExpressions.toString())
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('jpnAudioScriptのPromptの生成に失敗しました');
    }
};

//chatgpt
export async function callChatGPT(prompt: string): Promise<dto.GeneratedQuestionDataResDTO[]>/*lQuestionIDはnull(別途マッピング)*/ {
    try {
        console.log('=== Step 1: fetch開始 ===');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` //API key未作成
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in TOEIC problem creation. Please generate problems in JSON format according to the specified requirements."//"あなたはTOEIC問題作成の専門家です。指定された仕様に従ってJSON形式で問題を生成してください。"
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0,
                max_tokens: 4000
                //response_format: { type: "json_object" }
            }),
            signal: AbortSignal.timeout(200000)
        });
        console.log("response: ", response);
        console.log('=== Step 2: response確認 ===');
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();//パース① HTTPレスポンスボディ（バイトストリーム）→ JavaScriptオブジェクト
        console.log("parsed response: ", data);
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);//パース② OpenAI APIの応答構造を検証（choices配列の存在確認など）
        console.log("validated data: ", validatedData);

        if (validatedData.choices.length === 0) {
            console.log('=== Step 4: 失敗 ===');
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
        };

        console.log('=== Step 5: content抽出 ===');
        const content = validatedData.choices[0].message.content; //ChatGPTが生成したクイズデータのJSON文字列を抽出
        console.log("extraced quiz content: ", content);
        
        //文頭の「```json」 と 文末の「```」 を除去
        let cleanedContent = content;
        cleanedContent = cleanedContent.replace(/^```json\n?/, ''); // 先頭の```jsonを削除
        cleanedContent = cleanedContent.replace(/\n?```$/, '');     // 末尾の```を削除

        console.log('=== Step 6: content JSON parse ===');
        const parsedContent = JSON.parse(cleanedContent);//パース③ 文字列をJSONオブジェクトに変換
        console.log("parsed content: ", parsedContent);

        const dtoValidationResult = schema.generatedQuestionDataResDTOSchema.safeParse(parsedContent); //パース④ 予期されるDTO形式になっているか検証
        if (!dtoValidationResult.success) {
            console.error('DTO Validation Error:', dtoValidationResult.error);
            throw new apierror.ChatGPTAPIError('生成された問題データが期待する形式と一致しません');
        }
        console.log("dto validation result: ", dtoValidationResult);

        return dtoValidationResult.data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new apierror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        }else if (error instanceof apierror.ChatGPTAPIError) {
            throw error; // 既知のビジネスエラーはそのまま
        } else {
        console.error('Unexpected ChatGPT API Error:', error);
        throw new apierror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};





//==========================================================================
//音声生成処理モジュール群
//==========================================================================

//音声生成関数　controllerで呼び出す
export async function generateAudioContent(dtoList: dto.NewAudioReqDTO[], lQuestionIDList: string[]): Promise<domein.AudioURL[]> {
    // SSML生成
    const ssml = await TOEICSSMLGenerator.generateSSML(dtoList);
    //・(Google Cloud TTS)音声合成（ssmlバリデーションも含む）
    const generatedAudioURLList = await callGoogleCloudTTS(ssml, lQuestionIDList);
    return generatedAudioURLList;
};

//SSML生成モジュール
export class TOEICSSMLGenerator {
    //音声設定のランダム選択メソッド
    static selectRandomVoice(voices: readonly {name: string, gender: string}[]): {name: string, gender: string} {
            const randomIndex = Math.floor(Math.random() * voices.length);
            return voices[randomIndex];
        };
    
    static generateSSML(questionDataList: dto.NewAudioReqDTO[]): string {
        const baseConfig = questionDataList[0];
        const voiceSettings = TTS_VOICE_CONFIG[baseConfig.speakerAccent as AccentType];

        // ランダム音声選択
        const selectedVoice = this.selectRandomVoice(voiceSettings.voices);
        
        const questionParts = questionDataList.map((question, index) => {
            return this.createQuestionSSML(question, index + 1);
        });

        return `
<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voiceSettings.languageCode}">
    <voice name="${selectedVoice.name}">
        <prosody rate="${baseConfig.speakingRate}">
            <break time="1s"/>
            ${questionParts.join('\n')}
            <break time="2s"/>
        </prosody>
    </voice>
</speak>
`.trim();
    }

    private static createQuestionSSML(question: dto.NewAudioReqDTO, questionNumber: number): string {
        // [間]を<break>タグに変換するだけ
        const escapedScript = this.escapeSSML(question.audioScript);
        const processedScript = escapedScript
            .replace(/\[pause\]/g, '<break time="1.5s"/>')
            .replace(/\[short pause\]/g, '<break time="0.8s"/>');

        return `
<!-- Question ${questionNumber}: ${question.lQuestionID} -->
<mark name="q${questionNumber}_start"/>
<prosody rate="${question.speakingRate}">
    ${processedScript}
</prosody>
<mark name="q${questionNumber}_end"/>
`; //<mark>音声分割に必要なタグ
    }

    //XMLの特殊文字として解釈される文字をエスケープする
    private static escapeSSML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    } 
};

/*fetchモジュール
引数：SSML
動作：fetch
戻り値：問題数分の音声データ*/

//Google Cloud TTSで音声生成 音声を取得し、URLを返す
export async function callGoogleCloudTTS(ssml: string, lQuestionIDList: string[]): Promise<domein.AudioURL[]> {
    try {
        // 環境変数チェック
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new apierror.EnvironmentConfigError('GOOGLE_APPLICATION_CREDENTIALS環境変数が設定されていません');
        };

        // SSML検証
        validateSSML(ssml);

        // 認証トークン取得
        const accessToken = await getGoogleAccessToken();

        // Google Cloud TTS APIへのリクエスト
        const response = await fetch('https://texttospeech.googleapis.com/v1beta1/text:synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Goog-User-Project': process.env.GOOGLE_CLOUD_PROJECT_ID || ''
            },
            body: JSON.stringify({
                input: {
                    ssml: ssml //ssmlのみを単一のソースとする（Single Source Of Truth）
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    sampleRateHertz: 24000,
                    volumeGainDb: 0.0,
                    pitch: 0.0
                },
                enableTimePointing: ['SSML_MARK'] // 時間情報取得用
            })
        });

        // レスポンスチェック
        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS API Error:', response.status, errorText);
            throw new apierror.GoogleTTSAPIError(`TTS API Error: ${response.status} ${response.statusText}`);
        }

        const data = schema.GoogleTTSResponseSchema.parse(await response.json());
        
        if (!data.audioContent) {
            throw new apierror.GoogleTTSAPIError('音声コンテンツが生成されませんでした');
        };

        // Base64デコード
        const fullAudioBuffer = Buffer.from(data.audioContent, 'base64');
        
        // 問題毎に音声を分割
        const audioURLList = await splitAudioByQuestions(
            fullAudioBuffer, 
            data.timepoints || [],
            lQuestionIDList
        );
        const validatedAudioURLList = await schema.validateAudioURLList(audioURLList);

        const totalDuration = validatedAudioURLList.reduce((sum, segment) => sum + segment.duration, 0);

        console.log(`音声生成完了: ${audioURLList.length}問, 総時間: ${totalDuration}秒`);
        console.log(validatedAudioURLList);

        return  validatedAudioURLList;

    } catch (error) {
        console.error('TTS API呼び出しエラー:', error);
        if (error instanceof apierror.GoogleTTSAPIError || 
            error instanceof apierror.EnvironmentConfigError ||
            error instanceof apierror.SSMLValidationError ||
            error instanceof apierror.AudioProcessingError) {
            throw error;
        }
        throw new apierror.GoogleTTSAPIError(`TTS API呼び出しエラー: ${error}`);
    }
};

//SSMLの構造検証（TOEIC音声生成専用 - 簡略版）
export async function validateSSML(ssml: string): Promise<void> {
    // 1. 基本チェック
    if (!ssml || ssml.trim().length === 0) {
        throw new apierror.SSMLValidationError('SSMLが空です');
    }

    // 2. 必須要素の確認
    if (!ssml.includes('<speak') || !ssml.includes('</speak>')) {
        throw new apierror.SSMLValidationError('speak要素が見つかりません');
    }

    // 3. 音声分割用markタグの検証（最重要）
    const markTags = ssml.match(/<mark\s+name="q\d+_(start|end)"\s*\/>/g) || [];
    const startMarks = markTags.filter(tag => tag.includes('_start'));
    const endMarks = markTags.filter(tag => tag.includes('_end'));

    if (startMarks.length === 0) {
        throw new apierror.SSMLValidationError('問題分割用のstartマークが見つかりません');
    }

    if (startMarks.length !== endMarks.length) {
        throw new apierror.SSMLValidationError(`markタグのペアが不正です (start: ${startMarks.length}, end: ${endMarks.length})`);
    }

    // 4. 問題数制限
    if (startMarks.length > 10) {
        throw new apierror.SSMLValidationError(`問題数が上限を超えています (最大10問, 実際: ${startMarks.length}問)`);
    }

    console.log(`SSML検証完了: ${startMarks.length}問題`);
};

//音声データを問題毎に分割し保存　
// 引数: 音声データ、時間情報、識別子
// 戻り値: 保存した音声のURLリスト
export async function splitAudioByQuestions(
    audioBuffer: Buffer, //Base64でエンコードされた音声データ　未分割
    timepoints: Array<{ markName: string; timeSeconds: number }>, //時間情報　どこで切るかの指定
    lQuestionIDList: string[] //分割した各問題に付与する識別子
): Promise<domein.AudioURL[]> {

    console.time(`splitAudioByQuestions`);
    try{
        // 要素数が0でないか確認
        console.log(`timepoints.length: ${timepoints.length}, lQuestionIDList.length: ${lQuestionIDList.length}`);
        if(timepoints.length === 0 || lQuestionIDList.length === 0) {
            throw new apierror.AudioProcessingError('問題数もしくは時間数の要素数が0です');
        };

        const ffmpegStatic = await import('ffmpeg-static');  // 動的import モジュール実行タイミングのみ読み込み
        const ffmpegPath = ffmpegStatic.default;
        
        // 型安全確認
        if (typeof ffmpegPath !== 'string' || !ffmpegPath) {
            throw new apierror.FFmpegError('ffmpeg-static did not return a valid path');
        };

        // timepoints をペアにグループ化
        const questionTimeRangeList = extractQuestionTimeRangeList(timepoints);
        // 配列の長さが整合するか確認
        if(questionTimeRangeList.length !== lQuestionIDList.length) {
            throw new apierror.AudioProcessingError('問題数と時間範囲の数が整合しません');
        };
        console.log(questionTimeRangeList)
        
        /*// 各時間範囲で音声を分割
        const audioURLList: domein.AudioURL[] = [];*/
        
        console.log();
        // 一括でFFmpeg処理（全問題を一度に切り出し）
        const audioURLList = await extractMultipleAudioSegments(
            audioBuffer,
            questionTimeRangeList,
            lQuestionIDList,
            ffmpegPath
        );
        console.log(audioURLList);
        return audioURLList;
    } finally {
        console.timeEnd(`splitAudioByQuestions`);
    }
};

//時間範囲抽出
export function extractQuestionTimeRangeList(timePointList: Array<{ markName: string; timeSeconds: number }>): Array<{ startTime: number; endTime: number }> {
    
    // 型安全性確認
    if(timePointList.length === 0) {
        throw new apierror.AudioSplitError('timepointsの要素数が0です');
    };
    if((timePointList.length % 2) !== 0) {
        throw new apierror.AudioSplitError('要素数が偶数ではなく、startとendがどこかで欠損しています');
    };
    if(timePointList.length/2 > 10) {
        throw new apierror.AudioSplitError('要求の問題数が多すぎます（最大10問まで）');
    };
    
    // timepointlistをMap型に変換
    const markMap = new Map<string, number>();
        timePointList.forEach(tp => {
        markMap.set(tp.markName, tp.timeSeconds);
    }); 

    const rangeList = [];
    const questionCount = timePointList.length / 2;
    
    // 2. 検索（O(1) × 問題数）
    for (let i = 1; i <= questionCount; i++) {
        const startTime = markMap.get(`q${i}_start`);
        const endTime = markMap.get(`q${i}_end`);
        
        if (startTime !== undefined && endTime !== undefined) {
            rangeList.push({
                startTime: startTime,
                endTime: endTime
            });
        } else {
            throw new apierror.AudioSplitError(`問題${i}のstart/endペアが見つかりません`);
        } 
    }
    
    return rangeList;
};

//音声データの切り出し処理および保存、URL生成
export async function extractMultipleAudioSegments(
    audioBuffer: Buffer,
    questionTimeRangeList: Array<{ startTime: number; endTime: number }>,
    lQuestionIDList: string[],
    ffmpegPath: string
): Promise<domein.AudioURL[]> {
    if (questionTimeRangeList.length !== lQuestionIDList.length) {
        throw new apierror.AudioSplitError('問題数と時間範囲の数が整合しません');
    }

    const tempDir = os.tmpdir();
    const tempInputFile = path.join(tempDir, `input_${Date.now()}.mp3`);

    try {
        await fs.writeFile(tempInputFile, audioBuffer);

        const audioURLList = await Promise.all(
            questionTimeRangeList.map((range, index) =>
                extractSingleSegment(
                    tempInputFile,
                    range.startTime,
                    range.endTime,
                    lQuestionIDList[index],
                    ffmpegPath
                )
            )
        );
        console.log(audioURLList);
        return audioURLList;
    } catch (error) {
        console.log('音声切り出しエラー:', error);
        if (
            error instanceof apierror.AudioProcessingError ||
            error instanceof apierror.FFmpegError
        ) {
            throw error;
        }
        throw new apierror.AudioProcessingError(`音声切り出しエラー: ${error}`);
    } finally {
        //一時ファイルのクリーンアップ
        await fs.unlink(tempInputFile).catch(() => {});
    }
}

// 個別セグメント処理（importなし）
async function extractSingleSegment(
    inputFilePath: string,
    startTime: number,
    endTime: number,
    lQuestionID: string,
    ffmpegPath: string
): Promise<domein.AudioURL> {
    
    const tempDir = os.tmpdir();
    const tempOutputFile = path.join(tempDir, `output_${lQuestionID}_${Date.now()}.mp3`);
    
    // 最終保存先
    const resourcesDir = path.join(process.cwd(), 'resources', 'listening-quiz-resources');
    const questionFolder = `lQuestion_${lQuestionID}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}.`;
    const finalDir = path.join(resourcesDir, questionFolder);
    
    try {
        await fs.mkdir(finalDir, { recursive: true });
        
        // ファイル切り出し条件の指定
        const args = [
            '-i', inputFilePath,
            '-ss', startTime.toString(),
            '-t', (endTime - startTime).toString(),
            '-acodec', 'libmp3lame',
            '-b:a', '128k',
            '-y',
            tempOutputFile
        ];
        
        await executeFFmpegProcess(ffmpegPath, args);
        
        // 最終保存先にコピー
        const finalFilePath = path.join(finalDir, 'audio_segment.mp3');
        await fs.copyFile(tempOutputFile, finalFilePath);
        
        return {
            lQuestionID: lQuestionID,
            audioFilePath: finalFilePath,
            audioURL: `/api/audio/question/${lQuestionID}`,
            duration: endTime - startTime
        };
        
    } catch (error) {
        console.log(error);
        if (error instanceof apierror.FFmpegError) {
            throw error;
        }
        throw new apierror.AudioProcessingError(`音声切り出しエラー: ${error}`);
    } finally {
        await fs.unlink(tempOutputFile).catch(() => {});
    }
};

export function executeFFmpegProcess(ffmpegPath: string, args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
            //切り出し実行
            const ffmpegProcess = spawn(ffmpegPath, args);

            console.log(`FFmpeg process started with command: ${ffmpegPath} ${args.join(' ')}`);
            
            let stderr = '';
            ffmpegProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            ffmpegProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new apierror.FFmpegError(`FFmpeg failed: ${stderr}`));
            });
            
            ffmpegProcess.on('error', (error) => {reject(new apierror.FFmpegError(`FFmpeg process error: ${error}`));});
        });
}

//Google Cloud認証トークン取得
export async function getGoogleAccessToken(): Promise<string> {
    try {
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        
        if (!accessToken.token) {
            throw new apierror.GoogleAuthenticationError('アクセストークンの取得に失敗しました');
        }
        
        return accessToken.token;
    } catch (error) {
        if (error instanceof apierror.GoogleAuthenticationError) {
            throw error;
        }
        throw new apierror.GoogleAuthenticationError(`Google Cloud TTS認証エラー: ${error instanceof Error ? error.message : error}`);
    }
}