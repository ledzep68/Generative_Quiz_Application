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

//audioScript構造の選択（話者タグ対応版）
function generateAudioStructureText(sectionNumber: number): string {
    const structure = AUDIO_SCRIPT_STRUCTURES[sectionNumber as keyof typeof AUDIO_SCRIPT_STRUCTURES];
    
    if (!structure) {
        return '';
    }
    
    // Part別の簡潔な構造説明
    let simpleStructure = '';
    switch (sectionNumber) {
        case 1:
            simpleStructure = 'Read only 4 choices consecutively';
            break;
        case 2:
            simpleStructure = 'Question + [pause] + 3 choices read consecutively';
            break;
        case 3:
            simpleStructure = 'Conversation + [pause] + 3 questions with 4 choices each';
            break;
        case 4:
            simpleStructure = 'Speech content + [pause] + 3 questions with 4 choices each';
            break;
        default:
            simpleStructure = '';
    }
    
    // 話者タグ指示の生成
    function generateSpeakerInstructions(structure: any): string {
        if (!structure.tagging || !structure.tagging.speakerTag) {
            return '';
        }
        
        const speakerAssignment = structure.tagging.speakerAssignment;
        const speakerInstructions = `
**Speaker and Structure Tagging Requirements**

**Available Speakers:** ${structure.tagging.speakerTag.join(', ')}

**Speaker Assignment:**
${Object.entries(speakerAssignment)
    .map(([role, speaker]) => `- ${role}: ${Array.isArray(speaker) ? speaker.join(', ') : speaker}`)
    .join('\n')}

${structure.tagging.structureTag}

**CRITICAL:** Every content section MUST be preceded by the appropriate speaker tag.`;
        
        return speakerInstructions;
    };
    
    // Part 1, 2の場合は簡潔な構造
    if (sectionNumber === 1 || sectionNumber === 2) {
        return `**Structure:** ${simpleStructure}

**Rules:**
${structure.rules.map(rule => `- ${rule}`).join('\n')}

**IMPORTANT: Structure and Speaker Tagging**
Include the following structure and speaker tags in your audioScript output:

${generateSpeakerInstructions(structure)}`;
    }
    
    // Part 3, 4の場合は詳細な構造
    return `**Structure:** ${simpleStructure}

**Rules:**
${structure.rules.map(rule => `- ${rule}`).join('\n')}

**Structure for Japanese Translation:**
${structure.structure}

**IMPORTANT: Structure and Speaker Tagging**
Include the following structure and speaker tags in your audioScript output:

${generateSpeakerInstructions(structure)}`;
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
    
    //1. 完全一致を最優先（論理的整合性の確保）
    const exactMatch = TOPIC_MAPPING[situation.toLowerCase()];
    if (exactMatch) {
        return exactMatch;
    }
    
    //2. 部分一致による柔軟な対応
    const keywords = situation.toLowerCase().split(' ');
    for (const keyword of keywords) {
        for (const [mappedSituation, topic] of Object.entries(TOPIC_MAPPING)) {
            if (mappedSituation.includes(keyword)) {
                return topic;
            }
        }
    }
    
    //3. フォールバック（100%の対応を保証）
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

//チェックリスト生成関数
function generateChecklistForPart(sectionNumber: number, constraints: any): string {    
    let checklist = `- □ Are correct answers properly distributed among A, B, C, D?`;
    
    //Part2は選択肢がA, B, Cのみ
    if (sectionNumber === 2) {
        checklist = checklist.replace('A, B, C, D', 'A, B, C');
    }
    
    checklist += `
- □ Are the same choices not consecutive for 3 or more questions?`;
    
    //Part別の単語数チェック項目を追加
    Object.entries(constraints).forEach(([key, value]) => {
        // オブジェクト型の値の処理
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
            const unit = 'words';
            if (key === 'choices') {
                checklist += `
- □ Is each choice within the ${value.min}-${value.max} ${unit} range?`;
            } else if (key === 'totalWords') {
                checklist += `
- □ Is the total word count within the ${value.min}-${value.max} ${unit} range?`;
            } else {
                checklist += `
- □ Is each ${key} within the ${value.min}-${value.max} ${unit} range?`;
            }
        } 
        // プリミティブ型の値の処理
        else {
            if (key === 'questionsCount') {
                checklist += `
- □ Does the output contain exactly ${value} questions?`;
            } else if (key === 'choicesPerQuestion') {
                checklist += `
- □ Does each question have exactly ${value} choices?`;
            } else {
                checklist += `
- □ Is ${key} set to ${value}?`;
            }
        }
    });
    
    checklist += `
- □ Are choices sufficiently detailed (MINIMUM 3 words per choice)?
- □ Do choices require comprehension, not just vocabulary recall?`;
    
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

//audioScriptから構造化タグ除去
//要件：[SPEECH_CONTENT] [CONVERSATION] [QUESTION_[123]] [CHOICES_[123]] [CHOICES] [QUESTION]が完全に除去されている
function removeStructureTags(audioScript: string): string {
        return audioScript
            // 構造化タグを除去
            .replace(/\[SPEECH_CONTENT\]/g, '')
            .replace(/\[CONVERSATION\]/g, '')
            .replace(/\[QUESTION_[123]\]/g, '')
            .replace(/\[CHOICES_[123]\]/g, '')
            .replace(/\[CHOICES\]/g, '')
            .replace(/\[QUESTION\]/g, '')
            // 余分な空白を整理
            .replace(/\s+/g, ' ')
            .trim();
    };

/*
除去前
'[Speaker1] [SPEECH_CONTENT] Welcome to City International Airport. We are pleased to offer a range of services to enhance your travel experience. For your convenience, our information desks are located throughout the terminal, staffed with friendly personnel ready to assist you. We also provide complimentary Wi-Fi access, available in all areas of the airport. For those traveling with children, our family lounges offer a comfortable space with play areas. Additionally, we have partnered with local businesses to offer exclusive discounts at various shops and restaurants within the airport. Simply present your boarding pass to enjoy these offers. We hope you have a pleasant journey. [pause] [Speaker2] [QUESTION_1] What service is available throughout the airport? [Speaker2] [CHOICES_1] A. Free Wi-Fi access B. Complimentary meals C. Personal shopping assistants D. Free parking [pause] [Speaker2] [QUESTION_2] What should passengers show to get discounts? [Speaker2] [CHOICES_2] A. Passport B. Boarding pass C. Flight ticket D. ID card [pause] [Speaker2] [QUESTION_3] Where can families find a comfortable space? [Speaker2] [CHOICES_3] A. Information desks B. Family lounges C. Business lounges D. Security area [pause]'
除去後
'[Speaker1] Welcome to City International Airport. We are pleased to offer a range of services to enhance your travel experience. For your convenience, our information desks are located throughout the terminal, staffed with friendly personnel ready to assist you. We also provide complimentary Wi-Fi access, available in all areas of the airport. For those traveling with children, our family lounges offer a comfortable space with play areas. Additionally, we have partnered with local businesses to offer exclusive discounts at various shops and restaurants within the airport. Simply present your boarding pass to enjoy these offers. We hope you have a pleasant journey. [pause] [Speaker2] What service is available throughout the airport? [Speaker2] A. Free Wi-Fi access B. Complimentary meals C. Personal shopping assistants D. Free parking [pause] [Speaker2] What should passengers show to get discounts? [Speaker2] A. Passport B. Boarding pass C. Flight ticket D. ID card [pause] [Speaker2] Where can families find a comfortable space? [Speaker2] A. Information desks B. Family lounges C. Business lounges D. Security area [pause]'
性別タグ付与
'[Speaker1_FEMALE] Welcome to City International Airport. We are pleased to offer a range of services to enhance your travel experience. For your convenience, our information desks are located throughout the terminal, staffed with friendly personnel ready to assist you. We also provide complimentary Wi-Fi access, available in all areas of the airport. For those traveling with children, our family lounges offer a comfortable space with play areas. Additionally, we have partnered with local businesses to offer exclusive discounts at various shops and restaurants within the airport. Simply present your boarding pass to enjoy these offers. We hope you have a pleasant journey. [pause] [Speaker2] viWhat serce is available throughout the airport? [Speaker2] A. Free Wi-Fi access B. Complimentary meals C. Personal shopping assistants D. Free parking [pause] [Speaker2] What should passengers show to get discounts? [Speaker2] A. Passport B. Boarding pass C. Flight ticket D. ID card [pause] [Speaker2] Where can families find a comfortable space? [Speaker2] A. Information desks B. Family lounges C. Business lounges D. Security area [pause]'
分割後
1. 

content: 
2. 
content: [pause] What service is available throughout the airport? [short pause] A. Free Wi-Fi access [short pause] B. Complimentary meals [short pause] C. Personal shopping assistants [short pause] D. Free parking [pause] What should passengers show to get discounts? [short pause] A. Passport [short pause] B. Boarding pass [short pause] C. Flight ticket [short pause] D. ID card [pause] Where can families find a comfortable space? [short pause] A. Information desks [short pause] B. Family lounges [short pause] C. Business lounges [short pause] D. Security area [pause]


'[Speaker1_FEMALE] Welcome to City International Airport. We are pleased to offer a range of services to enhance your travel experience. For your convenience, our information desks are located throughout the terminal, staffed with friendly personnel ready to assist you. We also provide complimentary Wi-Fi access, available in all areas of the airport. For those traveling with children, our family lounges offer a comfortable space with play areas. Additionally, we have partnered with local businesses to offer exclusive discounts at various shops and restaurants within the airport. Simply present your boarding pass to enjoy these offers. We hope you have a pleasant journey. [pause] [Speaker2] [pause] What service is available throughout the airport? [short pause] A. Free Wi-Fi access [short pause] B. Complimentary meals [short pause] C. Personal shopping assistants [short pause] D. Free parking [pause] What should passengers show to get discounts? [short pause] A. Passport [short pause] B. Boarding pass [short pause] C. Flight ticket [short pause] D. ID card [pause] Where can families find a comfortable space? [short pause] A. Information desks [short pause] B. Family lounges [short pause] C. Business lounges [short pause] D. Security area [pause]'
*/

//audioScriptから性別要件を抽出する関数
export class GenderRequirementsExtracter {
    /**
     * sectionNumとaudioScriptから性別要件を抽出
     * @param sectionNum - Part番号 (1, 2, 3, 4)
     * @param audioScript - 性別タグを含むaudioScript
     * @returns Part構成に応じた性別要件配列（ナレーター除く）
     */
    static extractGenderRequirements(
        sectionNum: 1 | 2 | 3 | 4, 
        audioScript: string
    ): ('MALE' | 'FEMALE')[] {
        
        // audioScriptから性別付きSpeakerタグを抽出
        const genderTags = this.extractGenderTags(audioScript);
        
        switch (sectionNum) {
            case 1:
                // Part 1: ナレーターのみ（空配列）
                return [];
                
            case 2:
                // Part 2: 質問者のみ（ナレーター除く）
                const questionerGender = genderTags.Speaker1 || 'MALE'; // デフォルト
                return [questionerGender];
                
            case 3:
                // Part 3: 会話者1 + 会話者2（ナレーター除く）
                const speaker1Gender = genderTags.Speaker1 || 'MALE';
                const speaker2Gender = genderTags.Speaker2 || 'FEMALE';
                return [speaker1Gender, speaker2Gender];
                
            case 4:
                // Part 4: 発表者のみ（ナレーター除く）
                const announcerGender = genderTags.Speaker1 || 'FEMALE'; // デフォルト
                return [announcerGender];
                
            default:
                throw new Error(`Invalid section number: ${sectionNum}`);
        }
    }
    /**
     * audioScriptから性別付きSpeakerタグを抽出
     * @param audioScript - 分析対象のaudioScript
     * @returns Speaker番号と性別のマッピング
     */
    private static extractGenderTags(audioScript: string): {
        Speaker1?: 'MALE' | 'FEMALE';
        Speaker2?: 'MALE' | 'FEMALE';
        Speaker3?: 'MALE' | 'FEMALE';
    } {
        const genderTags: {
            Speaker1?: 'MALE' | 'FEMALE';
            Speaker2?: 'MALE' | 'FEMALE';
            Speaker3?: 'MALE' | 'FEMALE';
        } = {};
        
        // [Speaker1_MALE], [Speaker1_FEMALE]などのパターンを検索
        const speakerGenderPattern = /\[Speaker([123])_(MALE|FEMALE)\]/g;
        let match;
        
        while ((match = speakerGenderPattern.exec(audioScript)) !== null) {
            const speakerNum = match[1] as '1' | '2' | '3';
            const gender = match[2] as 'MALE' | 'FEMALE';
            genderTags[`Speaker${speakerNum}`] = gender;
        }
        
        return genderTags;
    }
};

export class TOEICVoiceSelector {
    //ランダム選択
    static selectRandomVoice(voices: readonly {name: string, gender: string}[]): {name: string, gender: string} {
        const randomIndex = Math.floor(Math.random() * voices.length);
        return voices[randomIndex];
    }

    // 指定性別の音声からランダム選択
    static selectVoiceByGender(
        voices: readonly {name: string, gender: string}[], 
        requiredGender: 'MALE' | 'FEMALE'
    ): {name: string, gender: string} {
        const filteredVoices = voices.filter(voice => voice.gender === requiredGender);
        
        if (filteredVoices.length === 0) {
            // フォールバック: 指定性別の音声がない場合は任意の音声を選択
            return this.selectRandomVoice(voices);
        }
        
        return this.selectRandomVoice(filteredVoices);
    }

    /**
     * 固定ナレーター選択（全Part共通）
     * US、落ち着いた男性の声を固定選択
     */
    private static selectNarrator(): {name: string, gender: string} {
        // 固定でUS男性ナレーターを返す
        return { name: 'en-US-Wavenet-B', gender: 'MALE' };
    }

    /**
     * Part 1用音声選択
     * ナレーター1人のみ
     */
    static selectPart1Voices(
        voices: readonly {name: string, gender: string}[],
        genderRequirements: ('MALE' | 'FEMALE')[] = []
    ): {name: string, gender: string}[] {
        return [this.selectNarrator()];
    }

    /**
     * Part 2用音声選択  
     * 質問者1人（性別指定） + ナレーター1人（固定）
     */
    static selectPart2Voices(
        voices: readonly {name: string, gender: string}[],
        genderRequirements: ('MALE' | 'FEMALE')[]
    ): {name: string, gender: string}[] {
        const questionerGender = genderRequirements[0] || 'MALE'; // デフォルト
        const questioner = this.selectVoiceByGender(voices, questionerGender);
        const narrator = this.selectNarrator();
        
        return [questioner, narrator];
    }

    /**
     * Part 3用音声選択
     * 会話者2人（性別指定、異なる音声） + ナレーター1人（固定）
     */
    static selectPart3Voices(
        voices: readonly {name: string, gender: string}[],
        genderRequirements: ('MALE' | 'FEMALE')[]
    ): {name: string, gender: string}[] {
        const speaker1Gender = genderRequirements[0] || 'MALE';
        const speaker2Gender = genderRequirements[1] || 'FEMALE';
        
        // 会話者1人目を性別指定で選択
        const conversationSpeaker1 = this.selectVoiceByGender(voices, speaker1Gender);
        
        // 会話者2人目を性別指定かつ1人目と異なる音声から選択
        const speaker2FilteredVoices = voices.filter(voice => 
            voice.gender === speaker2Gender && voice.name !== conversationSpeaker1.name
        );
        
        const conversationSpeaker2 = speaker2FilteredVoices.length > 0
            ? this.selectRandomVoice(speaker2FilteredVoices)
            : this.selectVoiceByGender(voices, speaker2Gender); // フォールバック
        
        const narrator = this.selectNarrator();
        
        return [conversationSpeaker1, conversationSpeaker2, narrator];
    }

    /**
     * Part 4用音声選択
     * 発表者1人（性別指定） + ナレーター1人（固定）
     */
    static selectPart4Voices(
        voices: readonly {name: string, gender: string}[],
        genderRequirements: ('MALE' | 'FEMALE')[]
    ): {name: string, gender: string}[] {
        const announcerGender = genderRequirements[0] || 'FEMALE'; // デフォルト
        const announcer = this.selectVoiceByGender(voices, announcerGender);
        const narrator = this.selectNarrator();
        
        return [announcer, narrator];
    }

    /**
     * Part番号に応じた音声選択（統合関数）
     */
    static selectVoicesForPart(
        sectionNumber: 1 | 2 | 3 | 4,
        voices: readonly {name: string, gender: string}[],
        genderRequirements: ('MALE' | 'FEMALE')[] = []
    ): {name: string, gender: string}[] {
        switch (sectionNumber) {
            case 1:
                return this.selectPart1Voices(voices, genderRequirements);
            case 2:
                return this.selectPart2Voices(voices, genderRequirements);
            case 3:
                return this.selectPart3Voices(voices, genderRequirements);
            case 4:
                return this.selectPart4Voices(voices, genderRequirements);
            default:
                throw new Error(`Invalid part number: ${sectionNumber}`);
        }
    }
};

/**
 * audioScriptを[Speaker]タグで分割し、音声設定と統合する関数
 */
export interface AudioSegment {
    speaker: number;
    content: string;
    voice: {name: string, gender: string};
}

export class AudioScriptSegmenter {
    
    /**
     * audioScriptを[Speaker]タグで分割し、selectedVoiceと統合
     * 同じSpeakerの連続セグメントは結合する
     * @param audioScript - 分割対象のaudioScript
     * @param selectedVoice - 各話者に対応する音声設定配列
     * @returns 分割されたセグメント配列
     */
    static segmentAudioScript(
        audioScript: string,
        selectedVoice: {name: string, gender: string}[]
    ): AudioSegment[] {
        const segments: AudioSegment[] = [];
        
        // [Speaker1], [Speaker2], [Speaker3]のパターンでsplit
        const parts = audioScript.split(/(\[Speaker[123]\])/);
        
        let currentSpeaker: number | null = null;
        let currentContent: string = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            // [SpeakerN]タグを検出
            const speakerMatch = part.match(/\[Speaker([123])\]/);
            if (speakerMatch) {
                const newSpeaker = parseInt(speakerMatch[1]);
                
                // 前のSpeakerのセグメントを保存（話者が変わった場合）
                if (currentSpeaker !== null && currentContent && currentSpeaker !== newSpeaker) {
                    const voiceIndex = currentSpeaker - 1;
                    if (selectedVoice[voiceIndex]) {
                        segments.push({
                            speaker: currentSpeaker,
                            content: currentContent.trim(),
                            voice: selectedVoice[voiceIndex]
                        });
                    }
                    currentContent = '';
                }
                
                currentSpeaker = newSpeaker;
                continue;
            }
            
            // 話者が設定されており、内容がある場合
            if (currentSpeaker !== null && part && !part.startsWith('[')) {
                // 同じSpeakerの内容を結合
                currentContent += (currentContent ? ' ' : '') + part;
            }
        }
        
        // 最後のSpeakerのセグメントを保存
        if (currentSpeaker !== null && currentContent) {
            const voiceIndex = currentSpeaker - 1;
            if (selectedVoice[voiceIndex]) {
                segments.push({
                    speaker: currentSpeaker,
                    content: currentContent.trim(),
                    voice: selectedVoice[voiceIndex]
                });
            }
        }
        
        return segments;
    }
    
    /**
     * 性別タグ付きSpeakerタグにも対応した分割（結合処理付き）
     * @param audioScript - [Speaker1_MALE]等の性別タグを含むaudioScript
     * @param selectedVoice - 各話者に対応する音声設定配列
     * @returns 分割されたセグメント配列
     */
    static segmentAudioScriptWithGender(
        audioScript: string,
        selectedVoice: {name: string, gender: string}[]
    ): AudioSegment[] {
        const segments: AudioSegment[] = [];
        
        //[Speaker1], [Speaker1_MALE], [Speaker1_FEMALE]等のパターンでsplit
        const parts = audioScript.split(/(\[Speaker[123](?:_(?:MALE|FEMALE))?\])/);
        console.log('parts: ', parts);
        
        let currentSpeaker: number | null = null;
        let currentContent: string = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            //[SpeakerN]または[SpeakerN_GENDER]タグを検出
            const speakerMatch = part.match(/\[Speaker([123])(?:_(?:MALE|FEMALE))?\]/);
            if (speakerMatch) {
                const newSpeaker = parseInt(speakerMatch[1]);
                console.log('newSpeaker: ', newSpeaker);
                
                //前のSpeakerのセグメントを保存（話者が変わった場合）
                if (currentSpeaker !== null && currentContent && currentSpeaker !== newSpeaker) {
                    const voiceIndex = currentSpeaker - 1;
                    if (selectedVoice[voiceIndex]) {
                        segments.push({
                            speaker: currentSpeaker,
                            content: currentContent.trim(),
                            voice: selectedVoice[voiceIndex]
                        });
                    }
                    currentContent = '';
                }
                
                currentSpeaker = newSpeaker;
                console.log('currentSpeaker: ', currentSpeaker);
                continue;
            }
            
            //話者が設定されており、内容がある場合
            if (currentSpeaker !== null && part && !/^\[Speaker[123](?:_(?:MALE|FEMALE))?\]$/.test(part.trim())) {
                currentContent += (currentContent ? ' ' : '') + part;
            }
            console.log('currentContent: ', currentContent);
        }
        
        // 最後のSpeakerのセグメントを保存
        if (currentSpeaker !== null && currentContent) {
            const voiceIndex = currentSpeaker - 1;
            if (selectedVoice[voiceIndex]) {
                segments.push({
                    speaker: currentSpeaker,
                    content: currentContent.trim(),
                    voice: selectedVoice[voiceIndex]
                });
            }
        }
        
        console.log('segments: ', segments);
        
        return segments;
    }
}

//SSML生成モジュール
export class TOEICSSMLGenerator {
    /**
     * sectionNumberとAudioSegmentListからSSMLを生成
     * @param sectionNumber - Part番号 (1, 2, 3, 4)
     * @param audioSegmentList - 分割された音声セグメント配列
     * @param speakingRate - 話速 (オプション、デフォルト1.0)
     * @returns 生成されたSSML文字列
     */
    static generateSSML(
        sectionNumber: 1 | 2 | 3 | 4,
        audioSegmentList: AudioSegment[],
        speakingRate: number = 1.0
    ): string {
        
        //sectionNumberに基づいて必要な話者数を判定
        const expectedSpeakers = this.getExpectedSpeakersCount(sectionNumber);
        
        //AudioSegmentListの妥当性チェック
        if (audioSegmentList.length !== expectedSpeakers) {
            throw new Error(`Part ${sectionNumber} requires ${expectedSpeakers} speakers, but got ${audioSegmentList.length}`);
        }
        
        //各セグメントのSSMLを生成
        const voiceSegments = audioSegmentList.map((segment, index) => {
            return this.createVoiceSegment(segment, sectionNumber, index, speakingRate);
        });
        
        return this.assembleSSML(voiceSegments);
    }
    
    /**
     * sectionNumberに基づいて必要な話者数を返す
     * @param sectionNumber - Part番号
     * @returns 必要な話者数
     */
    private static getExpectedSpeakersCount(sectionNumber: 1 | 2 | 3 | 4): number {
        switch (sectionNumber) {
            case 1: return 1; //ナレーターのみ
            case 2: return 2; //質問者 + ナレーター
            case 3: return 3; //会話者1 + 会話者2 + ナレーター
            case 4: return 2; //発表者 + ナレーター
            default:
                throw new Error(`Invalid section number: ${sectionNumber}`);
        }
    }
    
    /**
     * 各音声セグメントのSSMLを生成
     * @param segment - 音声セグメント
     * @param sectionNumber - Part番号
     * @param segmentIndex - セグメントのインデックス
     * @param speakingRate - 話速
     * @returns 生成されたvoiceセグメントSSML
     */
    private static createVoiceSegment(
        segment: AudioSegment,
        sectionNumber: number,
        segmentIndex: number,
        speakingRate: number
    ): string {
        
        //コンテンツをエスケープ
        const escapedContent = this.escapeSSML(segment.content);
        
        //音声制御タグをSSMLに変換
        const processedContent = this.processAudioControlTags(escapedContent);
        
        //セグメントの役割を特定
        const segmentRole = this.identifySegmentRole(sectionNumber, segmentIndex);
        
        return `
    <!-- ${segmentRole} -->
    <voice name="${segment.voice.name}">
        <prosody rate="${speakingRate}">
            <break time="0.5s"/>
            ${processedContent}
            <break time="0.5s"/>
        </prosody>
    </voice>`;
    }
    
    /**
     * セグメントの役割を特定
     * @param sectionNumber - Part番号
     * @param segmentIndex - セグメントのインデックス
     * @returns セグメントの役割説明
     */
    private static identifySegmentRole(sectionNumber: number, segmentIndex: number): string {
        switch (sectionNumber) {
            case 1:
                return 'Narrator - Photo descriptions';
            case 2:
                return segmentIndex === 0 ? 'Questioner' : 'Narrator - Response choices';
            case 3:
                if (segmentIndex === 0) return 'Conversation Speaker 1';
                if (segmentIndex === 1) return 'Conversation Speaker 2';
                return 'Narrator - Questions and choices';
            case 4:
                return segmentIndex === 0 ? 'Announcer/Presenter' : 'Narrator - Questions and choices';
            default:
                return `Speaker ${segmentIndex + 1}`;
        }
    }
    
    /**
     * 音声制御タグをSSMLタグに変換
     * @param content - 変換対象のコンテンツ
     * @returns 変換されたコンテンツ
     */
    private static processAudioControlTags(content: string): string {
        return content
            .replace(/\[pause\]/g, '<break time="1.5s"/>')
            .replace(/\[short pause\]/g, '<break time="0.8s"/>');
    }
    
    /**
     * SSMLの特殊文字をエスケープ
     * @param text - エスケープ対象のテキスト
     * @returns エスケープされたテキスト
     */
    private static escapeSSML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    /**
     * 最終的なSSMLを組み立て
     * @param voiceSegments - 音声セグメント配列
     * @returns 完成したSSML
     */
    private static assembleSSML(voiceSegments: string[]): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
    <break time="1s"/>
${voiceSegments.join('\n')}
    <break time="2s"/>
</speak>`.trim();
    }
};

/*fetchモジュール
引数：SSML
動作：fetch
戻り値：問題数分の音声データ*/

//Google Cloud TTSで音声生成 音声を取得し、Bufferを返す
export async function callGoogleCloudTTS(ssml: string, lQuestionID: string): Promise<Buffer<ArrayBuffer>> {
    try {
        // 環境変数チェック
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new apierror.EnvironmentConfigError('GOOGLE_APPLICATION_CREDENTIALS環境変数が設定されていません');
        };

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
                voice:{
                    languageCode:'en-US'
                    //name:'en-US-Wavenet-B',
                    //ssmlGender:'MALE'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    sampleRateHertz: 24000,
                    volumeGainDb: 0.0,
                    pitch: 0.0
                },
                enableTimePointing: ['SSML_MARK'] //時間情報取得用
            })
        });

        //レスポンスチェック
        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS API Error:', response.status, errorText);
            throw new apierror.GoogleTTSAPIError(`TTS API Error: ${response.status} ${response.statusText}`);
        }
        console.log("TTS API呼び出し成功", response);

        //timepointsはduration計算に使うが現時点では未実装
        const data = schema.GoogleTTSResponseSchema.parse(await response.json());
        console.log("TTSレスポンスバリデーション成功: ", data);
        
        if (!data.audioContent) {
            throw new apierror.GoogleTTSAPIError('音声コンテンツが生成されませんでした');
        };

        //Base64デコード
        const fullAudioBuffer = Buffer.from(data.audioContent, 'base64');

        return fullAudioBuffer;

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
};

//SSMLの構造検証（TOEIC音声生成専用 - 簡略版）
export async function validateSSML(ssml: string): Promise<void> {
    
    //基本チェック
    if (!ssml || ssml.trim().length === 0) {
        throw new apierror.SSMLValidationError('SSMLが空です');
    }
    
    //必須要素の確認
    if (!ssml.includes('<speak') || !ssml.includes('</speak>')) {
        throw new apierror.SSMLValidationError('speak要素が見つかりません');
    }
    
    //voice要素の存在確認
    const voiceTags = ssml.match(/<voice\s+name="[^"]+"\s*>/g) || [];
    if (voiceTags.length === 0) {
        throw new apierror.SSMLValidationError('voice要素が見つかりません');
    }
    
    //TOEIC Part数制限の確認（1-4問）
    if (voiceTags.length > 4) {
        throw new apierror.SSMLValidationError(`voice要素数が上限を超えています (最大4個, 実際: ${voiceTags.length}個)`);
    }
    
    //ナレーター固定音声の確認
    const narratorVoice = 'en-US-Wavenet-B';
    if (!ssml.includes(narratorVoice)) {
        throw new apierror.SSMLValidationError(`固定ナレーター音声(${narratorVoice})が見つかりません`);
    }
    
    //prosody要素の確認（話速設定）
    const prosodyTags = ssml.match(/<prosody\s+rate="[^"]+"\s*>/g) || [];
    if (prosodyTags.length !== voiceTags.length) {
        throw new apierror.SSMLValidationError(`voice要素とprosody要素の数が一致しません (voice: ${voiceTags.length}, prosody: ${prosodyTags.length})`);
    }
    
    //break要素の基本確認（音声制御）
    const breakTags = ssml.match(/<break\s+time="[^"]+"\s*\/>/g) || [];
    if (breakTags.length === 0) {
        throw new apierror.SSMLValidationError('break要素が見つかりません（音声制御が不正）');
    }
    
    console.log(`SSML検証完了: ${voiceTags.length}人の話者構成`);
};
export async function validateDetailSSML(ssml: string, expectedPartNumber?: 1|2|3|4): Promise<void> {
    
    // 基本検証を実行
    await validateSSML(ssml);
    
    // art別の詳細検証
    if (expectedPartNumber) {
        const voiceTags = ssml.match(/<voice\s+name="[^"]+"\s*>/g) || [];
        
        // Part別の期待話者数
        const expectedSpeakers = {
            1: 1, // ナレーターのみ
            2: 2, // 質問者 + ナレーター
            3: 3, // 会話者1 + 会話者2 + ナレーター
            4: 2  // 発表者 + ナレーター
        };
        
        const expected = expectedSpeakers[expectedPartNumber];
        if (voiceTags.length !== expected) {
            throw new apierror.SSMLValidationError(
                `Part ${expectedPartNumber}の話者数が不正です (期待: ${expected}人, 実際: ${voiceTags.length}人)`
            );
        }
        
        // ナレーター固定の確認（Part1は全員ナレーター、他Partは最後がナレーター）
        const narratorVoice = 'en-US-Wavenet-B';
        if (expectedPartNumber === 1) {
            // Part1: 全てナレーター
            if (!ssml.includes(`<voice name="${narratorVoice}">`)) {
                throw new apierror.SSMLValidationError('Part1のナレーター音声が正しくありません');
            }
        } else {
            // Part2-4: 最後がナレーター
            const lastVoiceMatch = ssml.match(/<voice\s+name="([^"]+)"\s*>[^<]*<\/voice>\s*<break[^>]*>\s*<\/speak>/);
            if (!lastVoiceMatch || !lastVoiceMatch[1].includes(narratorVoice)) {
                throw new apierror.SSMLValidationError(`Part ${expectedPartNumber}の最後の話者がナレーターではありません`);
            }
        }
        
        console.log(`Part ${expectedPartNumber}のSSML検証完了`);
    }
};

/**
 * 単一の音声ファイルを保存する
 * @param audioBuffer - 保存する音声データ
 * @param lQuestionID - 問題識別子
 * @param duration - 音声の長さ（秒）（オプション）
 * @returns 保存したファイルの情報
 */
export async function saveAudioFile(audioBuffer: Buffer, lQuestionID: string, duration?: number): Promise<domein.AudioFilePath> {
    
    try {
        // フォルダ作成
        const audioDir = createAudioDirectory(lQuestionID);
        await fs.mkdir(audioDir, { recursive: true });
        console.log(`音声フォルダ作成完了`);
        
        // ファイル名生成と保存
        const audioFilePath = generateAudioFilePath(audioDir);
        await fs.writeFile(audioFilePath, audioBuffer);

        console.log(`音声生成完了`/*層時間は一旦省略*/);
        console.log(`音声ファイルパス: ${audioFilePath}`);
        
        return {
            lQuestionID: lQuestionID,
            audioFilePath: audioFilePath,
            ...(duration !== undefined && { duration })  // durationが提供された場合のみ含める
        };
    } catch (error) {
        throw new Error(`音声ファイル保存エラー: ${error}`);
    }
}

/**
 * 音声ファイル用のディレクトリパスを作成
 * @param lQuestionID - 問題識別子
 * @returns ディレクトリパス
 */
function createAudioDirectory(lQuestionID: string): string {
    const resourcesDir = path.join(process.cwd(), 'resources', 'listening-quiz-resources');
    const questionFolder = `lQuestion_${lQuestionID}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}`;
    return path.join(resourcesDir, questionFolder);
}

/**
 * 音声ファイルの完全パスを生成
 * @param audioDir - 保存先ディレクトリ
 * @returns ファイルパス
 */
function generateAudioFilePath(audioDir: string): string {
    return path.join(audioDir, 'audio.mp3');
}