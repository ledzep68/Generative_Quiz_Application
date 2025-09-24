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

import {SPEAKER_PATTERNS, JPN_AUDIO_SCRIPT_FORMAT, ACCENT_PATTERNS, TTS_VOICE_CONFIG, PART_SPECIFIC_SCENARIOS, WORD_CONSTRAINTS, TOPIC_MAPPING, SITUATION_ELEMENTS, SPEAKER_ELEMENTS, LOCATION_ELEMENTS} from "./services.types.ts";

import { z } from "zod";
import {GoogleAuth} from "google-auth-library";
import { spawn } from 'child_process'; //ライブラリを通さず、直接他プログラムを実行するためのライブラリ
import fs from "fs/promises"; //音声バッファデータをローカルファイルに書き込むためのライブラリ
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

import { config } from "dotenv";
import { Session } from "inspector/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({path: path.join(__dirname, '../../.env')});

//==========================================================================
//問題生成処理モジュール群
//==========================================================================

export type AccentType = keyof typeof ACCENT_PATTERNS; 
export type SpeakerAccent = typeof ACCENT_PATTERNS[keyof typeof ACCENT_PATTERNS]; 

//クイズセッション開始処理
//問題セット生成初期化時（初回リクエスト時）
//新規登録/ログイン時に初期化したセッションデータnoutiquestionSetだけ追記する
export async function initializeNewQuestionSet(session: Express.Request["session"], domObj: domein.NewLQuestionInfo): Promise<void> {
    const speakerAccentList = getRandomSpeakerAccent(domObj.requestedNumOfLQuizs);
    const settingList = getRandomSettings(domObj.requestedNumOfLQuizs, domObj.sectionNumber);

    if(domObj.sectionNumber === 2){
        session.questionSet = {
            sectionNumber: domObj.sectionNumber,
            totalQuestionNum: domObj.requestedNumOfLQuizs,
            currentIndex: 0, //現在の問題番号 min:0, max:9（1-10に対応）
            //speakerList: speakerList, //問題毎に生成
            speakerAccentList: speakerAccentList,
            settingList: settingList,
            speakingRate: domObj.speakingRate
        };
    } else if (domObj.sectionNumber === 3 || domObj.sectionNumber === 4) {
        const contentTopicInstructionList = generateContentTopicInstructions(domObj.requestedNumOfLQuizs, settingList);
        const contentFrameworkList = generateContentFrameworks(domObj.sectionNumber, settingList);
        
        session.questionSet = {
            sectionNumber: domObj.sectionNumber,
            totalQuestionNum: domObj.requestedNumOfLQuizs,
            currentIndex: 0,
            //speakerList: speakerList,
            speakerAccentList: speakerAccentList,
            settingList: settingList,
            contentTopicInstructionList: contentTopicInstructionList,
            contentFrameworkTextList: contentFrameworkList,
            speakingRate: domObj.speakingRate
        }
    };

    return new Promise((resolve, reject) => {
        session.save((err) => {
            if (err) {
                console.error('Failed to save questionSet to session:', err);
                reject(new Error('Failed to initialize questionSet'));
            } else {
                console.info(`Question set initialized: section=${domObj.sectionNumber}, totalQuestions=${domObj.requestedNumOfLQuizs}`);
                resolve();
            }
        });
    });
}

//クイズセッション終了処理
//問題セット生成終了時（最後のリクエスト時）
export async function resetQuestionSet(session: Express.Request["session"]): Promise<void> {
    session.questionSet = undefined;

    return new Promise((resolve, reject) => {
        session.save((err) => {
            if (err) {
                console.error('Failed to reset questionSet to session:', err);
                reject(new Error('Failed to reset questionSet'));
            } else {
                console.info(`Question set reset`);
                resolve();
            }
        });
    });
}

//ランダム選択関数 リクエストされた問題数分のアクセントを返す
export function getRandomSpeakerAccent(requestedNumOfQuizs: number): AccentType[] {
    //TOEIC実際の出題頻度を反映した重み設定
    const accentWeights: Record<AccentType, number> = {
        'American': 0.5,    // 50% - 最も高頻度
        'British': 0.25,    // 25% - 中頻度
        'Australian': 0.15, // 15% - 低頻度
        'Canadian': 0.1     // 10% - 最低頻度
    };
    
    //累積重みの配列を作成
    const accents = Object.keys(accentWeights) as AccentType[];
    const weights = accents.map(accent => accentWeights[accent]);
    const cumulativeWeights: number[] = [];
    
    weights.reduce((sum, weight) => {
        sum += weight;
        cumulativeWeights.push(sum);
        return sum;
    }, 0);
    
    //重み付きランダム選択関数
    function selectWeightedRandom(): AccentType {
        const random = Math.random();
        const index = cumulativeWeights.findIndex(weight => random <= weight);
        return accents[index];
    }
    
    //指定された問題数分のアクセントを選択
    return Array.from({ length: requestedNumOfQuizs }, () => selectWeightedRandom());
};

//問題生成関数 controllerで呼び出す
export async function generatePart2Question(req: Express.Request["session"] /*requestedIndex: 0|1|2|3|4|5|6|7|8|9/*, domObj: domein.NewLQuestionInfo*/): Promise<dto.GeneratedQuestionDataResDTO> {
    if(!req.questionSet){
        throw new Error("Question set not found in session");
    };
    const questionSet = req.questionSet;
    const sectionNumber = questionSet.sectionNumber;
    const currentIndex = questionSet.currentIndex;
    
    //分離
    const speakerAccentList = questionSet.speakerAccentList;
    //状況設定（多様性担保）（分離）
    const settingList = questionSet.settingList
    //性別ランダム選択
    const speakerList = getRandomSpeakers(sectionNumber) as string[];

    //プロンプト生成
    const prompt = await generatePart2AudioScriptPrompt(sectionNumber, speakerAccentList[currentIndex], settingList[currentIndex], speakerList);
    const generatedAudioScript = await callChatGPTForPart2AudioScript(prompt);
    const generatedJpnAudioScript = await callChatGPTForJpnAudioScript(generatedAudioScript.audioScript);
    const generatedExplanation = await callChatGPTForExplanation(generatedAudioScript.audioScript);
    return {
        audioScript: generatedAudioScript.audioScript,
        jpnAudioScript: generatedJpnAudioScript,
        answerOption: generatedAudioScript.answerOption,
        sectionNumber: sectionNumber,
        explanation: generatedExplanation,
        speakerAccent: speakerAccentList[currentIndex]
    }
};
export async function generatePart34Question(req: Express.Request["session"]/*, requestedIndex: 0|1|2|3|4|5|6|7|8|9/*, domObj: domein.NewLQuestionInfo*/): Promise<dto.GeneratedQuestionDataResDTO> {
    if(!req.questionSet){
        throw new Error("Question set not found in session");
    };
    const questionSet = req.questionSet;
    const sectionNumber = questionSet.sectionNumber;
    const currentIndex = questionSet.currentIndex;

    const speakerAccentList = questionSet.speakerAccentList;
    //状況設定（多様性担保）（分離）
    const settingList = questionSet.settingList;
    const contentTopicInstructionList = questionSet.contentTopicInstructionList as string[];
    const contentFrameworkTextList = questionSet.contentFrameworkTextList as string[];

    //プロンプト生成
    const contentPrompt = await generatePart34AudioScriptContentPrompt(sectionNumber, speakerAccentList[currentIndex], settingList[currentIndex], contentTopicInstructionList[currentIndex], contentFrameworkTextList[currentIndex], currentIndex);
    //(ChatGPT-4o API)クイズ生成プロンプト生成
    const generatedContent = await callChatGPTForPart34AudioScriptContent(contentPrompt);

    const questionsAndChoicesPrompt = await generatePart34AudioScriptQuestionsPrompt(sectionNumber, generatedContent, speakerAccentList[currentIndex]);
    
    const generatedQuestionsAndChoices = await callChatGPTForPart34AudioScriptQuestionsAndChoices(questionsAndChoicesPrompt);
    const answerOptionList = generatedQuestionsAndChoices.answerOptionList as ("A" | "B" | "C" | "D")[];

    const audioScript = combineContentAndQuestions(generatedContent, generatedQuestionsAndChoices.questionsAndChoices);

    const jpnAudioScriptPrompt = await generateSingleJpnAudioScriptPrompt(sectionNumber, audioScript);
    const generatedJpnAudioScript = await callChatGPTForJpnAudioScript(jpnAudioScriptPrompt);

    const relevantAccentFeaturesText = extractAccentSpecificPoints(audioScript, speakerAccentList[currentIndex]);   

    const explanationPrompt = await generatePart34SingleExplanationPrompt(sectionNumber, speakerAccentList[currentIndex], relevantAccentFeaturesText, audioScript, answerOptionList);

    const generatedExplanation = await callChatGPTForExplanation(explanationPrompt);

    //似たような問題の生成をどうやって防止するか？
    return  {
        audioScript: audioScript,
        jpnAudioScript: generatedJpnAudioScript,
        answerOption: answerOptionList,
        sectionNumber: sectionNumber,
        explanation: generatedExplanation,
        speakerAccent: speakerAccentList[currentIndex]
    };
};
export async function generatePart34JpnAudioScript(sectionNumber: 1|2|3|4, audioScript: string): Promise<string> {
    const jpnAudioScriptPrompt = await generateSingleJpnAudioScriptPrompt(sectionNumber, audioScript);
    const generatedJpnAudioScript = await callChatGPTForJpnAudioScript(jpnAudioScriptPrompt);

    return  generatedJpnAudioScript;
};
export async function generatePart34Explanation(
    sectionNumber: 1|2|3|4, 
    speakerAccent: AccentType, 
    //settings: {
    //    location: string;
    //    speaker: string;
    //    situation: string
    //}, 
    //contentTopicInstruction: string,
    //contentFrameworkText: string,
    audioScript: string, 
    answerOptionList: ("A" | "B" | "C" | "D")[]/*, requestedIndex: 0|1|2|3|4|5|6|7|8|9/*, domObj: domein.NewLQuestionInfo*/
): Promise<string> {
    
    /*const sectionNumber = questionSet.sectionNumber;
    const currentIndex = questionSet.currentIndex;

    const speakerAccentList = questionSet.speakerAccentList;
    //状況設定（多様性担保）（分離）
    const settingList = questionSet.settingList;
    const contentTopicInstructionList = questionSet.contentTopicInstructionList as string[];
    const contentFrameworkTextList = questionSet.contentFrameworkTextList as string[];*/

    const relevantAccentFeaturesText = extractAccentSpecificPoints(audioScript, speakerAccent);   

    const explanationPrompt = await generatePart34SingleExplanationPrompt(sectionNumber, speakerAccent, relevantAccentFeaturesText, audioScript, answerOptionList);

    const generatedExplanation = await callChatGPTForExplanation(explanationPrompt);

    return  generatedExplanation;
};

/**
 * 指定されたsectionNumberのpatternをランダム選択し、speakers配列を取得
 * @param sectionNum - Part番号 (1, 2, 3, 4)
 * @returns 選択されたパターンのspeakers配列
 */
export function getRandomSpeakers(sectionNum: 1 | 2 | 3 | 4): readonly string[] {
    const partKey = `part${sectionNum}` as keyof typeof SPEAKER_PATTERNS;
    const availablePatterns = SPEAKER_PATTERNS[partKey];
    
    const randomIndex = Math.floor(Math.random() * availablePatterns.length);
    return availablePatterns[randomIndex].speakers;
};

/*
audioScriptタグ構造の選択
*/
//Part 2: 問題文(コメント/質問)&選択肢(応答)生成（応答選択肢に話者タグ必要）
export function generatePart2Structure(): string {
    const patterns = SPEAKER_PATTERNS.part2;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const [questioner, responder] = pattern.speakers;
    
    return `**Structure:** Generate question/comment + 3 response choices

**Rules:**
- Question/comment read by actual speakers with gender-specific tags
- Response choices read by actual speakers with gender-specific tags

**Speaker Assignment:**
- Selected Pattern: ${pattern.pattern}
- Questioner: ${questioner} (reads the question/comment)
- Responder: ${responder} (reads the response choices)

**Structure Tagging:**
- \`[QUESTION]\` followed by question text with ${questioner} tag
- \`[CHOICES]\` followed by 3 response options with ${responder} tags

**Output Format:** Question with questioner tag + 3 response choices with responder tags.`;
};

//Part 3: 会話生成（会話に話者タグ必要）
export function generatePart3ContentStructure(): string {
    const patterns = SPEAKER_PATTERNS.part3;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const [speaker1, speaker2] = pattern.speakers;
    
    return `**Structure:** Generate conversation content only (no questions or choices)

**Rules:**
- Conversation between 2 speakers
- Alternate speakers naturally based on dialogue context

**Speaker Assignment:**
- Selected Pattern: ${pattern.pattern}
- Conversation Speaker 1: ${speaker1}
- Conversation Speaker 2: ${speaker2}

**Structure Tagging:**
- Each speaker's line must start with their speaker tag: ${speaker1} or ${speaker2}
- Format: ${speaker1} [speaker's dialogue text] ${speaker2} [speaker's dialogue text]

**Output Format:** Conversation content with proper speaker and structure tags only. Do not include questions or answer choices.`;
};

//Part 3: 設問&選択肢生成（話者タグ不要）
export function generatePart3QuestionsStructure(): string {
    return `**Structure:** Generate 3 questions with 4 choices each (based on provided conversation)

**Rules:**
- Each question should focus on different aspects of the conversation
- Questions should test various comprehension levels (literal, inferential, critical)`;
}

//Part 4: スピーチ生成（スピーチに話者タグ必要）
export function generatePart4ContentStructure(): string {
    const patterns = SPEAKER_PATTERNS.part4;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const [presenter] = pattern.speakers;
    
    return `**Structure:** Generate speech/announcement content only (no questions or choices)

**Rules:**
- Each question should focus on different aspects of the speech
- Questions should test various comprehension levels (literal, inferential, critical)

**Speaker Assignment:**
- Selected Pattern: ${pattern.pattern}
- Presenter/Announcer: ${presenter}

**Structure Tagging:**
- Speech content must start with ${presenter} tag
- Format: ${presenter} [presenter's speech text continues...]

**Output Format:** Speech content with proper speaker and structure tags only. Do not include questions or answer choices.`;
}

//Part 4: 設問&選択肢生成（話者タグ不要）
export function generatePart4QuestionsStructure(): string {
    return `**Structure:** Generate 3 questions with 4 choices each (based on provided speech)

**Rules:**
- Each question should focus on different aspects of the speech
- Questions require inference rather than direct information recall`;
}

/*
アクセント設定
*/
//Part1専用のアクセント指示
export function generatePart1AccentInstructions(accentType: AccentType): string {
    const accent = ACCENT_PATTERNS[accentType];
    return `**Accent Requirements: ${accent.description}**

**Vocabulary to Use in Descriptions:**
- ${accent.vocabulary.slice(0, 4).join(', ')}

**Pronunciation Features to Consider:**
- ${accent.characteristics.slice(0, 2).join('\n- ')}

**Part 1 Specific Guidelines:**
- Use accent-specific vocabulary for objects and actions
- Choose descriptive words that reflect pronunciation patterns
- Ensure descriptions sound natural in this accent
- Consider regional variations in terminology`;
}
//Part2専用のアクセント指示
export function generatePart2AccentInstructions(accentType: AccentType): string {
    const accent = ACCENT_PATTERNS[accentType];
    return `**Accent Requirements: ${accent.description}**

**Question Vocabulary:**
- ${accent.vocabulary.slice(0, 3).join(', ')}

**Response Expressions:**
- ${accent.expressions.slice(0, 5).join(', ')}

**Pronunciation Features:**
- ${accent.characteristics.slice(0, 2).join('\n- ')}

**Part 2 Specific Guidelines:**
- Questions should use accent-appropriate vocabulary
- Response choices must reflect natural expressions for this accent
- Consider accent-specific politeness levels and formality
- Ensure conversational flow matches accent patterns`;
}
//Part3,4アクセント指示
export function generatePart34AccentInstructionsForContent(accentType: AccentType): string {
    const accent = ACCENT_PATTERNS[accentType];
    return `**Accent Requirements: ${accent.description}**

**Vocabulary to Use:**
- ${accent.vocabulary.slice(0, 6).join(', ')}

**Expressions to Include:**
- ${accent.expressions.slice(0, 4).join(', ')}

**Pronunciation Features to Reflect:**
- ${accent.characteristics.slice(0, 3).join('\n- ')}

**Implementation Guidelines:**
- Naturally incorporate accent-specific vocabulary in dialogue/speech
- Use characteristic expressions that reflect this accent
- Choose words that demonstrate pronunciation patterns
- Maintain authenticity while keeping content comprehensible`;
}
//Part3,4設問文&選択肢生成時のアクセント指示
export function generatePart34AccentInstructionsForQuestions(accentType: AccentType): string {
    const accent = ACCENT_PATTERNS[accentType];
    return `**Accent Context from Content: ${accent.description}**

**Consider these accent features when creating questions:**
- Vocabulary used: ${accent.vocabulary.slice(0, 4).join(', ')}
- Expressions used: ${accent.expressions.slice(0, 3).join(', ')}

**Question Design Guidelines:**
- Questions should test comprehension of accent-specific vocabulary
- Answer choices may include accent-related synonyms
- Consider pronunciation variations that affect meaning
- Ensure questions are fair regardless of accent familiarity`;
}

/*
状況設定（問題の多様性確保目的）
*/
//状況設定のランダム選択関数
export function getRandomSettings(requestedNumOfLQuizs: number, sectionNumber: number): {location: string, speaker: string, situation: string}[] {
    const scenarioList = PART_SPECIFIC_SCENARIOS[sectionNumber as keyof typeof PART_SPECIFIC_SCENARIOS];
    //シャッフル
    const arr = [...scenarioList];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    };
    const shuffledScenarioList = arr;
    //必要数だけ切り出し
    return shuffledScenarioList.slice(0, requestedNumOfLQuizs); 
};

export function generateContentTopicInstructions(requestedNumOfLQuizs: number, /*sectionNumber: number,*/ settings: {location: string, speaker: string, situation: string}[]): string[] {
    return settings.slice(0, requestedNumOfLQuizs).map((setting, index) => {
        const topic = generateTopicFromSituation(setting.situation);
        
        return `**Question ${index + 1}**: Content must focus on **${topic}**`;
    });
};
//要求問題数の数だけcontentFrameworkを生成
export function generateContentFrameworks(sectionNumber: number, settings: {location: string, speaker: string, situation: string}[]): string[] {
    return settings.map((setting, index) => {
        const { location, speaker, situation } = setting;
        const topic = generateTopicFromSituation(situation);
        const keyElements = generateKeyElementsFromContext(situation, speaker, location);
        
        if (sectionNumber === 3) {
            return `### Question ${index + 1}: ${situation}
- **Conversation Context**: ${speaker} engaging in ${situation.toLowerCase()} at ${location}
- **Speaker Roles**: Define relationship and information exchange
- **Key Discussion Points**: ${keyElements}
- **Conversation Flow**: Problem → Discussion → Resolution/Decision
- **Focus Areas**: Must include ${topic} elements for question development`;
        } else if (sectionNumber === 4) {
            return `### Question ${index + 1}: ${situation}
- **Content Focus**: ${speaker} delivering ${situation.toLowerCase()} at ${location}
- **Speaker Context**: Professional ${speaker.toLowerCase()} providing ${topic}
- **Key Elements**: ${keyElements}
- **Correct Choice**: Must relate to ${topic}`;
        }
        
        return '';
    });
}
/**
 * generateTopicFromSituation
 * 役割: part3,4の論理的整合性の確保
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
 * 役割: Part3,4の品質の均一化と向上
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


/*
チェックリスト
*/
//Part3,4 問題文生成用チェックリスト関数
function generatePart34ContentChecklist(sectionNumber: number, constraints: any): string {
    let checklist = '';
    
    //Part別の専用チェック項目
    if (sectionNumber === 3) {
        checklist += `
- □ Is the dialogue natural with believable speaker interactions?
- □ Does the conversation flow logically with meaningful content?`;
    } else if (sectionNumber === 4) {
        checklist += `
- □ Does the speech follow a logical, well-organized structure?
- □ Is the tone and formality appropriate for the context?`;
    }
    
    //共通の必須品質チェック項目
    checklist += `
- □ Does the content contain 3-4 distinct information areas?
- □ Is the difficulty level appropriate for TOEIC 600-990 points?
- □ Are accent-specific vocabulary and expressions included?
- □ Does the content support multiple inference-based questions?`;
    
    //単語数制約のチェックリスト
    Object.entries(constraints).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
            const unit = 'words';
            if (key === 'conversation') {
                checklist += `
- □ Is the conversation content within the ${value.min}-${value.max} ${unit} range?`;
            } else if (key === 'speech') {
                checklist += `
- □ Is the speech content within the ${value.min}-${value.max} ${unit} range?`;
            }
        }
    });
    
    return checklist;
};
//Part 2専用 質問&応答生成チェックリスト関数
function generatePart2QuestionsAndChoicesChecklist(constraints: any): string {
    let checklist = '';
    // 必須品質チェック項目
    checklist += `
- □ Does the setting match the specified location and speaker role?
- □ Are accent-specific vocabulary and expressions included?
- □ Are incorrect responses plausible but inappropriate?
- □ Is the difficulty level appropriate for TOEIC 600-990 points?
- □ Direct Response: Does the selected answer directly address the specific question asked?
- □ Complete Information: Does the answer provide the exact information requested (location, time, confirmation, etc.)?`;
    
    // 動的な単語数チェック項目
    Object.entries(constraints).forEach(([key, value]) => {
        // オブジェクト型の値の処理
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
            const unit = 'words';
            if (key === 'choices') {
                checklist += `
- □ Is each choice within the ${value.min}-${value.max} ${unit} range?`;
            } else if (key === 'question') {
                checklist += `
- □ Is the question within the ${value.min}-${value.max} ${unit} range?`;
            }
        } 
    });
    
    return checklist;
};
//Part3&4専用 設問文&選択肢生成チェックリスト関数
function generatePart34QuestionsAndChoicesChecklist(sectionNumber: 1|2|3|4, constraints: any): string {
    let checklist = `### Smart Keyword Usage
- □ Specific facts/numbers use direct keywords when appropriate?
- □ Main ideas/concepts use natural paraphrasing?
- □ Wrong answers include direct keywords for realistic traps?
- □ Avoid obvious word-for-word copying in all choices?

### TOEIC Requirements
- □ Do the 3 questions cover different types (main idea, detail, inference)?
- □ Are all choices based on content mentioned or clearly implied?
- □ Is the difficulty level appropriate for TOEIC 600-990 points?
`;
    
    //単語数制約チェックリスト
    Object.entries(constraints).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
            if (key === 'choices') {
                checklist += `- □ Is each choice within ${value.min}-${value.max} words?\n`;
            } else if (key === 'questionText') {
                checklist += `- □ Is each question within ${value.min}-${value.max} words?\n`;
            }
        }
    });
    
    checklist += `
### Technical Requirements
- □ Does JSON contain both "audioScript" and "answerOptionList" fields?
- □ Are structure tags ([QUESTION_1], [CHOICES_1]) used correctly?
- □ **Do all choices include A. B. C. D. labels?**`;
    
    return checklist;
};

//part1専用 audioScript生成

//part2専用 audioScript生成
export async function generatePart2AudioScriptPrompt(
    sectionNumber: 1|2|3|4,
    speakerAccent: AccentType, 
    setting: { location: string; speaker: string; situation: string; },
    speakerList: string[]
): Promise<string> {
        //アクセント設定（domObjのspeakerAccentは使わない）
        const accentInstructions = generatePart2AccentInstructions(speakerAccent as AccentType);
        //設定
        const settingInstruction = `**Setting**: Generate content for a ${setting.location.toLowerCase()} setting where a ${setting.speaker.toLowerCase()} is involved in ${setting.situation.toLowerCase()}. The ${setting.speaker.toLowerCase()} should ask questions or make comments that would naturally occur in this ${setting.location.toLowerCase()} context during ${setting.situation.toLowerCase()}. Ensure the language and formality match what a ${setting.speaker.toLowerCase()} would typically use in ${setting.location.toLowerCase()} interactions.`
        //設問文の単語数制約
        const constraints = WORD_CONSTRAINTS[sectionNumber];
        const contentConstraints = { questionOrComment: WORD_CONSTRAINTS[2].question, responses: WORD_CONSTRAINTS[2].responses };
        const constraintsText = Object.entries(contentConstraints)
        .map(([key, value]) => {
            if (typeof value === 'object' && value.min && value.max) {
                return `- **${key}**: Minimum word count ${value.min}${value.unit}, Maximum word count ${value.max}${value.unit}`;
            }
            return `- **${key}**: ${value}`;
        })
        .join('\n');
    
        //チェックリスト
        const checkList = generatePart2QuestionsAndChoicesChecklist(constraints);
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'part2-audioscript-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');

        return promptTemplate
            .replace(/\{\{accentInstructions\}\}/g, accentInstructions)
            .replace(/\{\{settingInstruction\}\}/g, settingInstruction)
            .replace(/\{\{wordConstraints\}\}/g, constraintsText)
            .replace(/\{\{speaker1\}\}/g, speakerList[0])
            .replace(/\{\{speaker2\}\}/g, speakerList[1])
            .replace(/\{\{checkList\}\}/g, checkList);
            
    } catch (error) {
        console.error(`Part${sectionNumber}プロンプト生成失敗:`, error);
        throw new apierror.PromptGenerateError(`Part${sectionNumber}のaudioScriptのPromptの生成に失敗しました`);
    } 
};

export async function callChatGPTForPart2AudioScript(prompt: string): Promise<{audioScript: string, answerOption: ("A"|"B"|"C"|"D")[]}> {
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
            answerOption: [parsedJson.answerOption]
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

//part3,4専用audioScript問題文生成
export async function generatePart34AudioScriptContentPrompt(
    sectionNumber: 1|2|3|4,
    speakerAccent: AccentType, 
    setting: { location: string; speaker: string; situation: string; }, 
    contentTopicInstruction: string, 
    contentFrameworksText: string,
    currentIndex: number
    ): Promise<string> {
    //speakerAccent
    //const speakerAccent = domObj.speakerAccent as AccentType;
    //構造
    const audioStructure = sectionNumber === 3 ? generatePart3ContentStructure() : generatePart4ContentStructure();
    //アクセント設定（domObjのspeakerAccentは使わない）
    const accentInstructions = generatePart34AccentInstructionsForContent(speakerAccent as AccentType);
    //単語数制約
    const constraints = WORD_CONSTRAINTS[sectionNumber];
    const contentConstraints = sectionNumber === 3 
        ? { conversation: WORD_CONSTRAINTS[3].conversation }
        : { speech: WORD_CONSTRAINTS[4].speech };
    const constraintsText = Object.entries(contentConstraints)
        .map(([key, value]) => {
            if (typeof value === 'object' && value.min && value.max) {
                return `- **${key}**: Minimum word count ${value.min}${value.unit}, Maximum word count ${value.max}${value.unit}`;
            }
            return `- **${key}**: ${value}`;
        })
        .join('\n');
    //設定生成
    //const settings = getRandomSettings(domObj.requestedNumOfLQuizs, domObj.sectionNumber);
    const settingVariationText = `**Question ${currentIndex + 1}**: Location ${setting.location}, Speaker ${setting.speaker}, Situation ${setting.situation}`;
    //状況設定（多様性担保）
    //const contentTopicInstruction = generateContentTopicInstructions(domObj.requestedNumOfLQuizs, settings);
    //const contentFrameworksText = generateContentFrameworks(domObj.requestedNumOfLQuizs, sectionNumber, settings);
    //チェックリスト    
    const checkList = generatePart34ContentChecklist(sectionNumber, constraints);

    //プロンプトテンプレート処理
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'part3_4-audioscript-content-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');

        // 5. テンプレート置換
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{conversationOrSpeech\}\}/g, sectionNumber === 3 ? 'conversation' : 'speech')
            .replace(/\{\{audioStructure\}\}/g, audioStructure)
            .replace(/\{\{accentInstructions\}\}/g, accentInstructions)
            .replace(/\{\{settingVariations\}\}/g, settingVariationText)
            .replace(/\{\{contentTopicInstruction\}\}/g, contentTopicInstruction)
            .replace(/\{\{contentFrameworks\}\}/g, contentFrameworksText)
            .replace(/\{\{wordConstraints\}\}/g, constraintsText)
            .replace(/\{\{checkList\}\}/g, checkList);
            
    } catch (error) {
        console.error(`Part${sectionNumber}プロンプト生成失敗:`, error);
        throw new apierror.PromptGenerateError(`Part${sectionNumber}のaudioScriptのPromptの生成に失敗しました`);
    } 
};

function selectAnswerOptionGenerationRules(sectionNumber: number): string {
    const rules = {
        1: "- **Part 1:** Generate 1 correct answer, return array with 1 element: [\"A\"], [\"B\"], [\"C\"], or [\"D\"] - distribute randomly across options",
        2: "- **Part 2:** Generate 1 correct answer, return array with 1 element: [\"A\"], [\"B\"], or [\"C\"] - distribute randomly across options", 
        3: "- **Part 3:** Generate 3 DIFFERENT correct answers, return array with 3 elements like [\"A\", \"C\", \"B\"], [\"D\", \"B\", \"A\"], [\"C\", \"A\", \"D\"] etc. **CRITICAL:** Each question MUST have a different correct answer letter. NEVER use clustering like [\"A\", \"A\", \"C\"] or [\"B\", \"B\", \"D\"]",
        4: "- **Part 4:** Generate 3 DIFFERENT correct answers, return array with 3 elements like [\"B\", \"D\", \"A\"], [\"C\", \"A\", \"B\"], [\"A\", \"D\", \"C\"] etc. **CRITICAL:** Each question MUST have a different correct answer letter. NEVER use clustering like [\"A\", \"A\", \"B\"] or [\"C\", \"C\", \"A\"]"
    };
    const specificRule = rules[sectionNumber as keyof typeof rules];
    if (!specificRule) {
        return "";
    }
    return specificRule;
};

export async function generatePart34AudioScriptQuestionsPrompt(sectionNumber: 1|2|3|4, content: string, speakerAccent: AccentType): Promise<string> {
        //構造
        const audioStructureText = sectionNumber === 3 ? generatePart3QuestionsStructure() : generatePart4QuestionsStructure();
        //アクセント設定（domObjのspeakerAccentは使わない）
        const accentInstructions = generatePart34AccentInstructionsForQuestions(speakerAccent as AccentType);
        //answerOption制約
        const answerOptionRule = selectAnswerOptionGenerationRules(sectionNumber);
        //設問文の単語数制約
        const constraints = WORD_CONSTRAINTS[sectionNumber];
        const contentConstraints = sectionNumber === 3 
        ? { questions: WORD_CONSTRAINTS[3].questionText, choices: WORD_CONSTRAINTS[3].choices }
        : { questions: WORD_CONSTRAINTS[4].questionText, choices: WORD_CONSTRAINTS[4].choices };
        const constraintsText = Object.entries(contentConstraints)
        .map(([key, value]) => {
            if (typeof value === 'object' && value.min && value.max) {
                return `- **${key}**: Minimum word count ${value.min}${value.unit}, Maximum word count ${value.max}${value.unit}`;
            }
            return `- **${key}**: ${value}`;
        })
        .join('\n');
    
        //チェックリスト
        const checkList = generatePart34QuestionsAndChoicesChecklist(sectionNumber, constraints);
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'part3_4-audioscript-question-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');

        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{content\}\}/g, content)
            .replace(/\{\{accentInstructions\}\}/g, accentInstructions)
            .replace(/\{\{audioStructure\}\}/g, audioStructureText)
            .replace(/\{\{answerOptionRule\}\}/g, answerOptionRule)
            .replace(/\{\{wordConstraints\}\}/g, constraintsText)
            .replace(/\{\{checkList\}\}/g, checkList);
            
    } catch (error) {
        console.error(`Part${sectionNumber}プロンプト生成失敗:`, error);
        throw new apierror.PromptGenerateError(`Part${sectionNumber}のaudioScriptのPromptの生成に失敗しました`);
    } 
}

//chatgpt - audioScript generation only
export async function callChatGPTForPart34AudioScriptContent(prompt: string): Promise<string> {
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

        // 不要な文字列の除去（markdown形式等）
        let cleanedAudioScript = audioScriptContent.trim();
        cleanedAudioScript = cleanedAudioScript.replace(/^```.*\n?/, ''); // 先頭の```を削除
        cleanedAudioScript = cleanedAudioScript.replace(/\n?```$/, '');   // 末尾の```を削除
        cleanedAudioScript = cleanedAudioScript.replace(/^"|"$/g, '');   // 前後のクォートを削除
        
        console.log("cleaned audioScript: ", cleanedAudioScript);
        console.log('=== Step 6: audioScript検証完了 ===');
        console.log("generated audioScript length:", cleanedAudioScript.length);

        // JSONパースを削除し、クリーンアップされたテキストをそのまま返す
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

export async function callChatGPTForPart34AudioScriptQuestionsAndChoices(prompt: string): Promise<{questionsAndChoices: string, answerOptionList: string[]}> {
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
                        content: "You are an expert in TOEIC question creation. Return ONLY a valid JSON object with questionsAndChoices and answerOption fields. Do not use markdown code blocks or any other formatting. Output only the JSON object exactly as specified in the prompt."
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
        
        // レスポンス形式の検証
        if (!result.questionsAndChoices || !result.answerOptionList) {
            throw new apierror.ChatGPTAPIError('必要なフィールド（questionsAndChoices, answerOptionList）が不足しています');
        }
        
        // answerOptionが配列かどうかチェック
        if (!Array.isArray(result.answerOptionList)) {
            throw new apierror.ChatGPTAPIError('answerOptionListは配列である必要があります');
        }
        
        console.log('=== Step 7: 検証完了 ===');
        console.log("questionsAndChoices length:", result.questionsAndChoices.length);
        console.log("answerOptionList:", result.answerOptionList);

        return {
            questionsAndChoices: result.questionsAndChoices,
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

/**
 * contentとquestions&choicesを結合して一つのaudioScriptを生成
 * @param content - 元の音声内容 (例: "[Speaker1_MALE] Good morning...")
 * @param questionsAndChoices - 生成された問題と選択肢 (例: "[QUESTION_1] What is...")
 * @returns audioScript - 結合された文字列
 */
function combineContentAndQuestions(content: string, questionsAndChoices: string): string {
    return `Content: ${content.trim()}

Questions and Choices: ${questionsAndChoices.trim()}`;
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

        //不要な文字列除去
        let cleanedJpnAudioScript = jpnAudioScriptContent.trim();
        cleanedJpnAudioScript = cleanedJpnAudioScript.replace(/^```.*\n?/, ''); // 先頭の```を削除
        cleanedJpnAudioScript = cleanedJpnAudioScript.replace(/\n?```$/, '');   // 末尾の```を削除
        cleanedJpnAudioScript = cleanedJpnAudioScript.replace(/^"|"$/g, '');   // 前後のクォートを削除
        
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

export function extractAccentSpecificPoints(audioScript: string, speakerAccent: AccentType): string {
    const accentPattern = ACCENT_PATTERNS[speakerAccent];
    
    // 音声に含まれるアクセント特有語彙を抽出
    const foundVocabulary = accentPattern.vocabulary.filter(item => {
        const word = item.split(' ')[0];
        return audioScript.toLowerCase().includes(word.toLowerCase());
    });
    
    // 音声に含まれるアクセント特有表現を抽出
    const foundExpressions = accentPattern.expressions.filter(expr => {
        return audioScript.toLowerCase().includes(expr.toLowerCase());
    });
    
    // そのアクセントの最重要発音特徴（上位2-3項目）
    const keyPronunciationFeatures = accentPattern.characteristics.slice(0, 3);

    const relevantAccentFeatures = {
        foundVocabulary,
        foundExpressions,
        keyPronunciationFeatures,
        accentName: speakerAccent
    }

    let relevantAccentFeaturesText = `${relevantAccentFeatures.accentName} English Features:\n`;
    
    //テキスト化
    relevantAccentFeaturesText += `Pronunciation: ${relevantAccentFeatures.keyPronunciationFeatures.join('; ')}\n`;
    //検出された語彙（ある場合のみ）
    if (relevantAccentFeatures.foundVocabulary.length > 0) {
        relevantAccentFeaturesText += `Vocabulary: ${relevantAccentFeatures.foundVocabulary.join(', ')}\n`;
    };
    //検出された表現（ある場合のみ）
    if (relevantAccentFeatures.foundExpressions.length > 0) {
        relevantAccentFeaturesText += `Expressions: ${relevantAccentFeatures.foundExpressions.join(', ')}`;
    };
    
    return relevantAccentFeaturesText;
};

export async function generatePart2SingleExplanationPrompt(
    //sectionNumber: 1|2|3|4,
    speakerAccent: AccentType, 
    audioScript: string, 
    answerOption: "A" | "B" | "C" | "D"
): Promise<string> {
    const accentPattern = ACCENT_PATTERNS[speakerAccent];

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'part2-explanation-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');
        return promptTemplate
            .replace(/\{\{speakerAccent\}\}/g, speakerAccent)
            .replace(/\{\{audioScript\}\}/g, audioScript)
            .replace(/\{\{answerOption\}\}/g, answerOption)
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('explanationのPromptの生成に失敗しました');
    }
};
export async function generatePart34SingleExplanationPrompt(
    sectionNumber: 1|2|3|4,
    speakerAccent: AccentType, 
    relevantAccentFeaturesText: string, 
    audioScript: string, 
    answerOptionList: ("A" | "B" | "C" | "D")[]
): Promise<string> {
    const accentPattern = ACCENT_PATTERNS[speakerAccent];

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'part3_4-explanation-prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{speakerAccent\}\}/g, speakerAccent)
            .replace(/\{\{relevantAccentFeatures\}\}/g, relevantAccentFeaturesText)
            .replace(/\{\{audioScript\}\}/g, audioScript)
            .replace(/\{\{answerOptionList\}\}/g, answerOptionList.join(','))
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('explanationのPromptの生成に失敗しました');
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
    //audioScript分割）（sectionNumber必要）
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

/**
 * Part2専用: audioScriptに音声合成用タグ[pause]と[short pause]を付与する関数
 * @param audioScript - 元のaudioScript
 * @returns pause付きのaudioScript
 */
export function addPausesToPart2AudioScript(audioScript: string): string {
    //Speaker1とSpeaker2の境界を検出するパターン
    const speakerBoundaryPattern = /(\[Speaker1_(?:MALE|FEMALE)\]\s+[^[]+?)(\s+\[Speaker2_(?:MALE|FEMALE)\])/;
    
    //選択肢A, B, Cの前に[short pause]を挿入するパターン
    const choicePattern = /(\s+)([ABC]\.\s+)/g;
    
    let result = audioScript;
    
    //Speaker1の質問後に[pause]を挿入
    result = result.replace(speakerBoundaryPattern, '$1 [pause]$2');
    
    //各選択肢A, B, Cの前に[short pause]を挿入
    result = result.replace(choicePattern, '$1[short pause] $2');
    
    return result;
};

/**
 * Part3&4専用: audioScriptに[Narrator]タグを追加する
 * [QUESTION_1]の直前に[Narrator]タグを挿入
 * @param audioScript - 元のaudioScript
 * @returns [Narrator]タグが追加されたaudioScript
 */
export function addNarratorTagToPart34AudioScript(audioScript: string): string {
    let result = audioScript;
    
    // [QUESTION_1]直前に[Narrator]タグを挿入
    result = result.replace(/(\[QUESTION_1\])/g, '[Narrator] $1');
    
    return result;
}

/**
 * Part3&4専用: 不要なタグを除去・audioScriptに[pause]と[short pause]を付与する関数
 * @param audioScript - 元のaudioScript
 * @returns pause付きのaudioScript
 * 
出力形式: 
[Speaker1_MALE] 発言内容 [short pause]
[Speaker2_MALE] 発言内容 [short pause]
[Speaker1_MALE] 発言内容 [short pause]
... 最後の発言内容 [pause]

[QUESTION_1] 質問文 [short pause] 
[CHOICES_1] A. [short pause] choice A B. [short pause] choice B C. [short pause] choice C D. [short pause] choice D

[QUESTION_2] 以降も同様...
 */
export function addPausesToPart34AudioScript(audioScript: string): string {
    let result = audioScript;
    
    //"Content: "と"Questions and Choices: "を除去
    result = result.replace(/Content:\s*/g, '');
    result = result.replace(/Questions and Choices:\s*/g, '');

    //各Speaker発言の後に[short pause]を挿入
    const speakerPattern = /(\[Speaker[12]_(?:MALE|FEMALE)\]\s+[^[]+?)(\s*)(?=\[)/g;
    result = result.replace(speakerPattern, '$1 [short pause] ');
    
    //[QUESTION_n]の前に[pause]を配置
    result = result.replace(/(\[QUESTION_)/g, '[pause] $1');
    
    //A. B. C. D.の前に[short pause]を配置
    result = result.replace(/(\s+)([A-D]\.\s)/g, '$1[short pause] $2');
    
    //連続する[short pause] [pause]を[pause]に統合
    result = result.replace(/\[short pause\]\s+\[pause\]/g, '[pause]');
    
    //[short pause] [Narrator] [pause] → [Narrator] [pause] に修正
    result = result.replace(/\[short pause\]\s+\[Narrator\]\s+\[pause\]/g, '[Narrator] [pause]');
    
    //[QUESTION_N]タグと[CHOICES_N]タグを除去（音声生成に不要）
    result = result.replace(/\[QUESTION_\d+\]\s*/g, '');
    result = result.replace(/\[CHOICES_\d+\]\s*/g, '');

    return result;
};

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
                //Part1: ナレーターのみ（空配列）
                return [];
                
            case 2:
                //Part2: 質問者のみ（ナレーター除く）
                const questionerGender = genderTags.Speaker1 || 'MALE'; // デフォルト
                return [questionerGender];
                
            case 3:
                //Part3: 会話者1 + 会話者2（ナレーター除く）
                const speaker1Gender = genderTags.Speaker1 || 'MALE';
                const speaker2Gender = genderTags.Speaker2 || 'FEMALE';
                return [speaker1Gender, speaker2Gender];
                
            case 4:
                //Part4: 発表者のみ（ナレーター除く）
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
        
        //[Speaker1_MALE], [Speaker1_FEMALE]などのパターンを検索
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

    //指定性別の音声からランダム選択
    static selectVoiceByGender(
        voices: readonly {name: string, gender: string}[], 
        requiredGender: 'MALE' | 'FEMALE'
    ): {name: string, gender: string} {
        const filteredVoices = voices.filter(voice => voice.gender === requiredGender);
        
        if (filteredVoices.length === 0) {
            //フォールバック: 指定性別の音声がない場合は任意の音声を選択
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
     * 性別タグ付きSpeakerタグとNarratorタグに対応した分割（結合処理付き）
     * @param audioScript - [Speaker1_MALE]等の性別タグを含むaudioScript
     * @param selectedVoice - 各話者に対応する音声設定配列
     * @returns 分割されたセグメント配列
     */
    static segmentAudioScriptWithGender(
        audioScript: string,
        selectedVoice: {name: string, gender: string}[]
    ): AudioSegment[] {
        const segments: AudioSegment[] = [];
        
        //[Speaker1], [Speaker1_MALE], [Speaker1_FEMALE], [Narrator]等のパターンでsplit
        const parts = audioScript.split(/(\[Speaker[123](?:_(?:MALE|FEMALE))?\]|\[Narrator\])/);
        console.log('parts: ', parts);
        
        let currentSpeaker: number | null = null;
        let currentContent: string = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            //空文字列はスキップ
            if (!part) continue;
            
            //タグパターンのチェック（[で始まる場合）
            if (part.startsWith('[')) {
                //[SpeakerN]または[SpeakerN_GENDER]タグを検出
                const speakerMatch = part.match(/\[Speaker([123])(?:_(?:MALE|FEMALE))?\]/);
                //[Narrator]タグを検出
                const narratorMatch = part.match(/\[Narrator\]/);
                
                //無効なタグの場合はエラー
                if (!speakerMatch && !narratorMatch) {
                    throw new Error(`Invalid tag detected: ${part}`);
                }
                
                //Narratorの場合はselectedVoice.length、Speakerの場合は番号を取得
                const newSpeaker = narratorMatch ? selectedVoice.length : parseInt(speakerMatch![1]);
                console.log('newSpeaker: ', newSpeaker);
                
                //前の話者のセグメントを保存（話者が変わった場合）
                if (currentSpeaker !== null && currentContent && currentSpeaker !== newSpeaker) {
                    const voiceIndex = currentSpeaker - 1;
                    
                    //配列範囲外チェック
                    if (!selectedVoice[voiceIndex]) {
                        throw new Error(`Voice not found for speaker ${currentSpeaker} at index ${voiceIndex}`);
                    }
                    
                    segments.push({
                        speaker: currentSpeaker,
                        content: currentContent.trim(),
                        voice: selectedVoice[voiceIndex]
                    });
                    currentContent = '';
                }
                
                //新しい話者に切り替え
                currentSpeaker = newSpeaker;
                console.log('currentSpeaker: ', currentSpeaker);
                continue;
            }
            
            //話者が設定されており、内容がある場合（タグ以外のテキスト）
            if (currentSpeaker !== null && part) {
                currentContent += (currentContent ? ' ' : '') + part;
                console.log('currentContent: ', currentContent);
            }
        }
        
        //最後のSpeakerのセグメントを保存
        if (currentSpeaker !== null && currentContent) {
            const voiceIndex = currentSpeaker - 1;
            if (!selectedVoice[voiceIndex]) {
                throw new Error(`Voice not found for speaker ${currentSpeaker} at index ${voiceIndex}`);
            }
            
            segments.push({
                speaker: currentSpeaker,
                content: currentContent.trim(),
                voice: selectedVoice[voiceIndex]
            });
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
        const expectedSpeakersCount = this.getExpectedSpeakersCount(sectionNumber);
        
        //AudioSegmentListの妥当性チェック
        /*if (audioSegmentList.length !== expectedSpeakers) {
            throw new Error(`Part ${sectionNumber} requires ${expectedSpeakers} speakers, but got ${audioSegmentList.length}`);
        }*/
        const actualSpeakers = new Set(audioSegmentList.map((segment)=>(segment.speaker)))
        const actualSpeakersCount = actualSpeakers.size
        if(actualSpeakersCount!==expectedSpeakersCount){
            throw new Error(`Part ${sectionNumber} requires ${expectedSpeakersCount} speakers, but got ${actualSpeakersCount}`);
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
            case 2: return 2; //会話者1 + 会話者2
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
            .replace(/\[short pause\]/g, '<break time="0.5s"/>');
    };
    
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
    };
    
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

//SSML構造検証
export async function validateSSML(ssml: string): Promise<void> {
    
    //基本チェック
    if (!ssml || ssml.trim().length === 0) {
        throw new apierror.SSMLValidationError('SSMLが空です');
    }
    
    //必須要素の確認
    if (!ssml.includes('<speak') || !ssml.includes('</speak>')) {
        throw new apierror.SSMLValidationError('speak要素が見つかりません');
    }
    
    //全voice要素（セグメント数）とユニークな話者数を取得
    const voiceTagsTotal = ssml.match(/<voice\s+name="[^"]+"\s*>/g) || [];
    const voiceNames = [...new Set(
        voiceTagsTotal.map(tag => tag.match(/name="([^"]+)"/)?.[1])
            .filter(Boolean)
    )];
    
    //voice要素の存在確認
    if (voiceTagsTotal.length === 0) {
        throw new apierror.SSMLValidationError('voice要素が見つかりません');
    }
    
    //TOEIC話者数制限の確認（1-4人）
    if (voiceNames.length < 1 || voiceNames.length > 4) {
        throw new apierror.SSMLValidationError(`話者数が範囲外です (1-4人, 実際: ${voiceNames.length}人)`);
    }
    
    //ナレーター固定音声の確認
    const narratorVoice = 'en-US-Wavenet-B';
    if (!voiceNames.includes(narratorVoice)) {
        throw new apierror.SSMLValidationError(`固定ナレーター音声(${narratorVoice})が見つかりません`);
    }
    
    //prosody要素の確認（話速設定）
    //セグメント数と一致する必要がある
    const prosodyTags = ssml.match(/<prosody\s+rate="[^"]+"\s*>/g) || [];
    if (prosodyTags.length !== voiceTagsTotal.length) {
        throw new apierror.SSMLValidationError(
            `voice要素とprosody要素の数が一致しません (voice: ${voiceTagsTotal.length}個, prosody: ${prosodyTags.length}個)`
        );
    }
    
    //break要素の基本確認（音声制御）
    const breakTags = ssml.match(/<break\s+time="[^"]+"\s*\/>/g) || [];
    if (breakTags.length === 0) {
        throw new apierror.SSMLValidationError('break要素が見つかりません（音声制御が不正）');
    }
    
    console.log(`SSML検証完了: ${voiceNames.length}人の話者構成, ${voiceTagsTotal.length}セグメント`);
};

export async function validateDetailSSML(ssml: string, expectedPartNumber?: 1|2|3|4): Promise<void> {
    
    //基本検証を実行
    await validateSSML(ssml);
    
    //Part別の詳細検証
    if (expectedPartNumber) {
        const voiceTags = ssml.match(/<voice\s+name="[^"]+"\s*>/g) || [];
        
        //Part別の期待話者数
        const expectedSpeakers = {
            1: 1, //ナレーターのみ
            2: 2, //質問者 + ナレーター
            3: 3, //会話者1 + 会話者2 + ナレーター
            4: 2  //発表者 + ナレーター
        };
        
        const expected = expectedSpeakers[expectedPartNumber];
        if (voiceTags.length !== expected) {
            throw new apierror.SSMLValidationError(
                `Part ${expectedPartNumber}の話者数が不正です (期待: ${expected}人, 実際: ${voiceTags.length}人)`
            );
        }
        
        //ナレーター固定の確認（Part1は全員ナレーター、他Partは最後がナレーター）
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
        //フォルダ作成 命名形式 listening-partX-${lQuestionID}
        const audioDir = createAudioDirectory(lQuestionID);
        await fs.mkdir(audioDir, { recursive: true });
        console.log(`音声フォルダ作成完了`);
        
        //ファイル名生成と保存
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
    return path.join(audioDir, 'audio_segment.mp3');
}