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
import {ACCENT_PATTERNS, TTS_VOICE_CONFIG, partSpecificScenarios} from "./services.types.ts";

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
export async function generateLQuestionContent(domObj: domein.NewLQuestionInfo): Promise<dto.GeneratedQuestionDataResDTO[]> {
    //プロンプト生成
    const prompt = await generatePrompt(domObj);
    //・(ChatGPT-4o API)クイズ生成プロンプト生成
    const generatedQuizDataList = await callChatGPT(prompt); //バリデーション済

    //似たような問題の生成をどうやって防止するか？
    return  generatedQuizDataList;
};

/*
//問題生成プロンプトの生成
export async function generatePrompt(domObj: domein.NewLQuestionInfo): Promise<string> {

    const sectionSpecs = {
        1: {
            description: "写真描写問題",
            format: "1枚の写真について4つの短い説明文が読まれ、写真を最も適切に描写しているものを選ぶ",
            requirements: "写真に写っている人物の動作、物の状態、場所の様子を正確に描写"
        },
        2: {
            description: "応答問題", 
            format: "質問や文章に対する最も適切な応答を3つの選択肢から選ぶ",
            requirements: "自然な会話の流れに沿った適切な応答"
        },
        3: {
            description: "会話問題",
            format: "2人または3人の会話を聞き、設問に対する答えを4つの選択肢から選ぶ",
            requirements: "ビジネスや日常生活の場面での自然な会話"
        },
        4: {
            description: "説明文問題",
            format: "短いトークを聞き、設問に対する答えを4つの選択肢から選ぶ", 
            requirements: "アナウンス、広告、会議、講演などの実用的な内容"
        }
    };

    const spec = sectionSpecs[domObj.sectionNumber as keyof typeof sectionSpecs];
    
    let speakerAccentList: AccentType[];
    let accentPatternList: SpeakerAccent[];
    if (domObj.speakerAccent) {
        //固定選択
        speakerAccentList = [domObj.speakerAccent];
        accentPatternList = [ACCENT_PATTERNS[domObj.speakerAccent]];
    } else {
        //ランダム選択
        speakerAccentList = getRandomSpeakerAccent(domObj.requestedNumOfLQuizs as number);
        accentPatternList = speakerAccentList.map((accent: AccentType) => ACCENT_PATTERNS[accent]);
    };

    const speakerAccentAndPatternList = Array.from({ length: domObj.requestedNumOfLQuizs as number }, (_, i) => {
        return ({
            accent: speakerAccentList[i % speakerAccentList.length],
            pattern: accentPatternList[i % accentPatternList.length]
        });
    });
    try{
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');
        
        // 話者情報の生成
        const speakerAccentAndPatternText = speakerAccentAndPatternList.map((speaker, index) => `
**問題${index + 1}の話者:**
- 英語種別: ${speaker.pattern.description} (${speaker.accent})
- 発音特徴: ${speaker.pattern.characteristics.slice(0, 2).join(', ')}
- 語彙の特徴: ${speaker.pattern.vocabulary.slice(0, 2).join(', ')}
- 表現の特徴: ${speaker.pattern.expressions.slice(0, 2).join(', ')}
`).join('');
        console.log(speakerAccentAndPatternText);
        // 出力フォーマットの生成
        const outputFormat = `
[
    ${speakerAccentAndPatternList.map((speaker, index) => `    // 問題${index + 1}: ${speaker.accent}英語使用
    {
        "audioScript": "string (${domObj.sectionNumber === 2 ? '質問文' : domObj.sectionNumber === 4 ? 'トーク内容+設問文' : '問題文+設問文'}+選択肢の完全な読み上げ内容)",
        "jpnAudioScript": "string",
        "answerOption": ${domObj.sectionNumber === 2 ? '"A"|"B"|"C"' : '"A"|"B"|"C"|"D"'},
        "sectionNumber": ${domObj.sectionNumber},
        "explanation": "string",
        "speakerAccent": "${speaker.accent}"
    }`).join(',\n')}
]
`;
        console.log(outputFormat);
        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, domObj.sectionNumber.toString())
            .replace(/\{\{requestedNumOfQuizs\}\}/g, domObj.requestedNumOfLQuizs.toString())
            .replace(/\{\{spec\.description\}\}/g, spec.description)
            .replace(/\{\{spec\.format\}\}/g, spec.format)
            .replace(/\{\{spec\.requirements\}\}/g, spec.requirements)
            .replace(/\{\{speakerAccentAndPatternList\}\}/g, speakerAccentAndPatternText)
            .replace(/\{\{outputFormat\}\}/g, outputFormat);
            
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('Promptの生成に失敗しました');
    }
};
*/

//状況設定のランダム選択関数
function getRandomSettings(requestedNumOfLQuizs: number, sectionNumber: number) {
   const scenarios = partSpecificScenarios[sectionNumber as keyof typeof partSpecificScenarios];
   const shuffledScenarios = [...scenarios].sort(() => 0.5 - Math.random());
   
   return Array.from({ length: requestedNumOfLQuizs }, (_, i) => 
       shuffledScenarios[i % shuffledScenarios.length]
   );
};

function generateContentTopicInstruction(
    answerOptionList: string[], 
    sectionNumber: number, 
    settings: Array<{location: string, speaker: string, situation: string}>
): string {
    const instructions = answerOptionList.map((answerOption, index) => {
        const setting = settings[index];
        const topic = generateTopicFromSituation(setting.situation);
        
        return `**Question ${index + 1}**: Content must focus on **${topic}** → Correct answer choice must be ${answerOption}`;
    }).join('\n');

    return instructions;
}

//contentFrameworksを生成する関数（getRandomSettings対応版）
function generateContentFrameworks(
    answerOptionList: string[], 
    sectionNumber: number, 
    settings: Array<{location: string, speaker: string, situation: string}>
): string {
    //Part 4以外では空文字を返す
    if (sectionNumber !== 4) {
        return '';
    }
    
    return answerOptionList.map((answerOption, index) => {
        // 各問題ごとに配列から要素を取り出す
        const { location, speaker, situation } = settings[index];
        
        const topic = generateTopicFromSituation(situation);
        const keyElements = generateKeyElementsFromContext(situation, speaker, location);
        
        return `### Question ${index + 1}: ${situation} (Answer: ${answerOption})
- **Content Focus**: ${speaker} delivering ${situation.toLowerCase()} at ${location}
- **Speaker Context**: Professional ${speaker.toLowerCase()} providing ${topic}
- **Key Elements**: ${keyElements}
- **Correct Choice (Position ${answerOption})**: Must relate to ${topic}`;
    }).join('\n\n');
};



/**
 * generateTopicFromSituation
 * 役割: 論理的整合性の確保
 * 機能: situationから明確なトピックを生成し、Content→Question→Answerの論理的流れを保証
 */
function generateTopicFromSituation(situation: string): string {
    // situationを明確なトピックに変換するマッピング
    // これにより「何について話すか」が明確になり、正解選択肢との整合性が保たれる
    const TOPIC_MAPPING: Record<string, string> = {
        // 医療・健康関連
        'examination guidance': 'medical procedures',
        'conducting examination': 'medical procedures', 
        'medication guidance': 'medical instructions',
        'waiting for examination': 'medical appointments',
        'hospital facility guidance': 'medical facility information',
        
        // ビジネス・報告関連
        'progress report': 'status reporting',
        'quarterly report': 'business reporting',
        'performance report': 'performance analysis',
        'monthly report': 'periodic reporting',
        'project proposal': 'business proposals',
        
        // 教育・研修関連
        'academic lecture': 'educational presentations',
        'professional seminar': 'professional development',
        'technical training': 'training programs',
        'teaching class': 'instructional content',
        'training guidance': 'skill development',
        'lecture discussion': 'educational discourse',
        
        // 案内・説明関連
        'system explanation': 'technical explanations',
        'procedure explanation': 'operational procedures',
        'facility guidance': 'service information',
        'exhibition guidance': 'cultural presentations',
        'tourism guidance': 'travel information',
        
        // 発表・広告関連
        'product advertisement': 'marketing presentations',
        'service introduction': 'promotional content',
        'event promotion': 'event announcements',
        'product introduction': 'product demonstrations',
        'keynote speech': 'keynote presentations',
        
        // 交通・移動関連
        'boarding announcement': 'transportation announcements',
        'service information': 'operational updates',
        'evacuation drill announcement': 'safety procedures',
        'emergency notice': 'emergency communications',
        
        // 業務・作業関連
        'business hours information': 'operational announcements',
        'working at desk': 'workplace activities',
        'reviewing documents': 'document management',
        'preparing presentation': 'presentation preparation',
        'inspecting machinery': 'equipment inspection',
        'manufacturing work': 'production processes',
        
        // 顧客サービス関連
        'customer service': 'customer assistance',
        'complaint handling': 'customer service',
        'order taking': 'order processing',
        'reservation handling': 'booking services',
        'appointment booking': 'scheduling services',
        
        // 相談・確認関連
        'schedule confirmation': 'scheduling information',
        'task confirmation': 'work assignments',
        'price confirmation': 'pricing information',
        'fee confirmation': 'cost information',
        'location confirmation': 'navigation assistance',
        
        // インタビュー・取材関連
        'expert interview': 'expert discussions',
        'professor interview': 'academic interviews',
        'guest interview': 'interview content',
        'news interview': 'journalistic interviews',
        
        // 会議・相談関連
        'regular meeting': 'business meetings',
        'business negotiation': 'commercial discussions',
        'project consultation': 'project planning',
        'legal consultation': 'professional advice',
        'travel consultation': 'travel planning',
        
        // その他の活動
        'shopping': 'retail experiences',
        'dining': 'restaurant services',
        'attending event': 'event participation',
        'research discussion': 'academic research'
    };
    
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
}

/**
 * generateKeyElementsFromContext  
 * 役割: 品質の均一化と向上
 * 機能: situation、speaker、locationの文脈から具体的な要素を生成し、一貫した高品質な内容を保証
 */
function generateKeyElementsFromContext(
    situation: string, 
    speaker: string, 
    location: string
): string {
    
    // situation別の基本要素（何を含めるべきか）
    const SITUATION_ELEMENTS: Record<string, string[]> = {
        // 案内・説明系
        'announcement': ['important information', 'timing details', 'procedural instructions'],
        'guidance': ['step-by-step procedures', 'safety protocols', 'important guidelines'],
        'explanation': ['detailed procedures', 'system operations', 'technical specifications'],
        'information': ['service details', 'operational status', 'important updates'],
        
        // 報告・発表系
        'report': ['data analysis', 'progress metrics', 'performance indicators'],
        'presentation': ['key findings', 'strategic insights', 'actionable recommendations'],
        'lecture': ['educational content', 'theoretical concepts', 'practical applications'],
        'seminar': ['specialized knowledge', 'industry trends', 'professional development'],
        'speech': ['main message', 'supporting evidence', 'call to action'],
        
        // 医療・健康系
        'examination': ['medical procedures', 'health protocols', 'patient instructions'],
        'medication': ['dosage information', 'safety precautions', 'administration guidelines'],
        'facility': ['service locations', 'operating procedures', 'patient navigation'],
        
        // 研修・教育系
        'training': ['skill development', 'practical applications', 'best practices'],
        'teaching': ['learning objectives', 'key concepts', 'student engagement'],
        'instruction': ['procedural steps', 'safety requirements', 'quality standards'],
        
        // サービス・顧客系
        'service': ['service features', 'customer benefits', 'usage procedures'],
        'customer': ['service quality', 'customer satisfaction', 'problem resolution'],
        'consultation': ['expert advice', 'solution strategies', 'professional guidance'],
        
        // ビジネス・業務系
        'meeting': ['agenda items', 'decision points', 'action plans'],
        'negotiation': ['proposal terms', 'mutual benefits', 'agreement conditions'],
        'confirmation': ['verification processes', 'information accuracy', 'procedural compliance'],
        
        // インタビュー・取材系
        'interview': ['expert insights', 'professional experience', 'industry knowledge'],
        'discussion': ['topic analysis', 'different perspectives', 'collaborative insights']
    };
    
    // speaker別の専門性要素（誰の視点から話すか）
    const SPEAKER_ELEMENTS: Record<string, string[]> = {
        // 医療関係者
        'doctor': ['medical expertise', 'clinical procedures', 'patient safety'],
        'nurse': ['patient care', 'health protocols', 'medical assistance'],
        'pharmacist': ['medication safety', 'drug interactions', 'dosage guidelines'],
        
        // 教育関係者
        'professor': ['academic knowledge', 'research insights', 'educational methods'],
        'teacher': ['learning objectives', 'student engagement', 'educational content'],
        'instructor': ['skill development', 'practical training', 'learning outcomes'],
        
        // ビジネス関係者
        'manager': ['strategic planning', 'team coordination', 'operational efficiency'],
        'ceo': ['organizational vision', 'strategic direction', 'performance metrics'],
        'supervisor': ['quality control', 'team management', 'workflow optimization'],
        'coordinator': ['project coordination', 'resource management', 'timeline adherence'],
        
        // 専門職
        'expert': ['specialized knowledge', 'industry expertise', 'professional insights'],
        'engineer': ['technical specifications', 'system design', 'problem solving'],
        'analyst': ['data analysis', 'trend identification', 'strategic recommendations'],
        'consultant': ['professional advice', 'solution development', 'best practices'],
        
        // サービス業
        'staff': ['service procedures', 'customer assistance', 'quality assurance'],
        'assistant': ['support services', 'administrative procedures', 'customer care'],
        'representative': ['company policies', 'service information', 'customer relations'],
        'guide': ['informational content', 'navigation assistance', 'educational guidance'],
        
        // 技術・専門職
        'administrator': ['system management', 'operational procedures', 'policy implementation'],
        'technician': ['technical operations', 'equipment maintenance', 'safety procedures'],
        'specialist': ['domain expertise', 'specialized procedures', 'quality standards']
    };
    
    // location別の環境要素（どこで行われるか）
    const LOCATION_ELEMENTS: Record<string, string[]> = {
        'hospital': ['medical environment', 'patient safety', 'healthcare standards'],
        'office': ['professional setting', 'business operations', 'workplace efficiency'],
        'university': ['academic environment', 'educational resources', 'learning objectives'],
        'training': ['learning environment', 'skill development', 'practical application'],
        'meeting': ['collaborative setting', 'decision making', 'team coordination'],
        'seminar': ['professional development', 'knowledge sharing', 'industry insights']
    };
    
    // 要素収集ロジック
    let elements: string[] = [];
    
    // 1. situationから基本要素を取得
    const situationLower = situation.toLowerCase();
    for (const [keyword, elementList] of Object.entries(SITUATION_ELEMENTS)) {
        if (situationLower.includes(keyword)) {
            elements.push(...elementList);
            break; // 最初にマッチしたもので十分
        }
    }
    
    // 2. speakerから専門性要素を追加
    const speakerLower = speaker.toLowerCase();
    for (const [keyword, elementList] of Object.entries(SPEAKER_ELEMENTS)) {
        if (speakerLower.includes(keyword)) {
            elements.push(...elementList);
            break;
        }
    }
    
    // 3. locationから環境要素を追加
    const locationLower = location.toLowerCase();
    for (const [keyword, elementList] of Object.entries(LOCATION_ELEMENTS)) {
        if (locationLower.includes(keyword)) {
            elements.push(...elementList);
            break;
        }
    }
    
    // 4. 品質保証処理
    // 重複削除
    const uniqueElements = [...new Set(elements)];
    
    // 最適な要素数に調整（3-4個が適切）
    const finalElements = uniqueElements.slice(0, 4);
    
    // フォールバック（要素が見つからない場合）
    if (finalElements.length === 0) {
        finalElements.push('relevant information', 'important details', 'key procedures');
    }
    
    return finalElements.join(', ');
}

export async function generatePrompt(domObj: domein.NewLQuestionInfo): Promise<string> {

    const sectionSpecs = {
            1: {
                description: "Picture description problems",
                format: "Choose the option that most appropriately describes the picture",
                requirements: "Accurately describe people's actions, object states, and location scenes"
            },
            2: {
                description: "Response problems", 
                format: "Choose the most appropriate response to the question",
                requirements: "Appropriate responses that follow natural conversation flow"
            },
            3: {
                description: "Conversation problems",
                format: "Listen to conversations and answer questions",
                requirements: "Natural conversations in business and daily life situations"
            },
            4: {
                description: "Explanatory text problems",
                format: "Listen to short talks and answer questions", 
                requirements: "Practical content such as announcements, advertisements, meetings, and lectures"
            }
        };

    //audioScript構成の定義
    const audioScriptStructures = {
        1: {
            structure: "Read only 4 choices consecutively",
            rules: [
                "Do not add 'A', 'B', 'C', 'D' before each choice",
                "Insert [short pause] between each choice"
            ],
            example: "A businessman wearing a dark suit is carefully reading his morning newspaper. [short pause] Two professional women are walking together through the busy office corridor. [short pause] Several children are joyfully playing on the colorful playground equipment in the park. [short pause] A golden retriever dog is energetically running across the green field."
        },
        2: {
            structure: "Question + [pause] + 3 choices read consecutively",
            rules: [
                "Question and choices are handled by different speakers",
                "Question: Read by [Speaker1]",
                "Choices: Read by [Speaker2]",
                "Do not add 'A', 'B', 'C' before choices",
                "Insert [short pause] between each choice"
            ],
            example: "[Speaker1] Could you please tell me where the main conference room is located? [pause] [Speaker2] Go down this hallway and turn right at the end. [short pause] Yes, I would be happy to attend the important meeting today. [short pause] The quarterly business meeting is scheduled to start at three o'clock."
        },
        3: {
            structure: "Conversation + [pause] + question text + [pause] + 4 choices read consecutively",
            rules: [
                "Insert speaker identification tags for each statement when multiple speakers are present",
                "Insert appropriate intervals between speaker changes and each choice",
                "Speaker tag format: [Speaker1], [Speaker2], [Speaker3], etc.",
                "Question text and choices: Read by narrator (no speaker tag)"
            ],
            example: "[Speaker1] Good morning, Sarah. I was wondering if you have finished working on the quarterly financial report that's due today. [pause] [Speaker2] Almost completely done, Mike. I just need to add the final sales figures and revenue data before submitting it. [pause] [Speaker1] That's excellent news. We really need to submit the completed report to management by noon today for the board meeting. [pause] [Speaker2] Don't worry, I'll have everything ready well before the deadline. [pause] [Speaker1] Perfect. I appreciate your dedication to getting this done on time. [pause] What does Mike need Sarah to do with the report? [pause] Add the remaining sales figures and revenue data to complete it. [short pause] Submit the finished report to management before the noon deadline. [short pause] Schedule an important meeting with the board of directors. [short pause] Review all the financial data and make necessary corrections."
        },
        4: {
            structure: "Speech content + [pause] + question text + [pause] + 4 choices read consecutively",
            rules: [
                "Format of announcements, presentations, advertisements, etc.",
                "Speech content and questions/choices are handled by different speakers",
                "Speech content: Read by [Speaker1]",
                "Question text and choices: Read by [Speaker2]",
                "Insert [short pause] between each choice"
            ],
            example: "[Speaker1] Welcome to City Bank, where we value your financial future and security. We are extremely pleased to announce the launch of our innovative new mobile banking service that will revolutionize how you manage your finances. Starting next month, all our valued customers will be able to access their accounts anytime and anywhere using our user-friendly mobile application. This convenient service will allow you to check balances, transfer funds, pay bills, and deposit checks directly from your smartphone or tablet. [pause] [Speaker2] What is the main topic of this important announcement? [pause] The launch of an innovative new mobile banking service for customers. [short pause] The grand opening of a new branch location in the city. [short pause] The results of a comprehensive customer satisfaction survey. [short pause] Scheduled maintenance of the current online banking system."
        }
    };

    const partGenres = {
        1: [
            "Workplace scenes: People descriptions in offices, meeting rooms, factories",
            "Transportation/travel: Scenes at stations, airports, bus stops, roads",
            "Commercial facilities: Activities in stores, restaurants, banks",
            "Outdoor activities: Parks, construction sites, event venues",
            "Daily life: Situations at home, hospitals, schools"
        ],
        2: [
            "Work confirmation: Questions about schedules, tasks, progress",
            "Location/directions: Questions about position, routes, facilities",
            "Suggestions/requests: Questions about cooperation, participation, changes",
            "Information confirmation: Questions about time, cost, conditions",
            "Opinions/evaluations: Questions about impressions, judgments, choices"
        ],
        3: [
            "Business conversations: Meetings, negotiations, project consultations",
            "Customer service: Complaint handling, orders, reservations, inquiries",
            "Colleague dialogues: Cooperation, information sharing, schedule coordination",
            "Service usage: Repair requests, reservation changes, consultations",
            "Academic/training: Conversations about lectures, seminars, research"
        ],
        4: [
            "Announcements: Transportation, facilities, emergencies",
            "Advertisements: Product, service, event promotions",
            "Meetings/presentations: Business reports, project proposals",
            "Lectures: Academic, training, seminars",
            "Reports: News, research results, progress updates",
            "Explanations: Procedures, rules, system descriptions",
            "Interviews: Questions to experts and experienced persons",
            "Guides: Facility, event, service guidance"
        ]
    };

    //jpnAudioScript形式定義
    const jpnAudioScriptFormats = {
        1: "選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]",
        2: "質問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese]",
        3: "会話内容: [Conversation in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]",
        4: "スピーチ内容: [Speech in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]"
    };

    const answerDistributionRules = {
        1: "No restrictions",
        2: "Each choice maximum 1 problem",
        3: "Each choice maximum 2 problems",
        4: "Each choice maximum 2 problems",
        5: "Each choice maximum 2 problems",
        6: "Each choice maximum 2 problems",
        7: "Each choice maximum 2 problems",
        8: "Each choice maximum 2 problems",
        9: "Each choice 2-3 problems",
        10: "Each choice 2-3 problems (Distribution like A:3, B:3, C:2, D:2)"
    };

    //jpnAudioScript形式に対応した単語数制約定義（統一版）
    const wordConstraints = {
        1: { 
            "choices": {
                min: 4,
                max: 10,
                unit: "words"
            },
            "totalWords": {
                min: 20,
                max: 40,
                unit: "words"
            }
        },
        2: { 
            "question": {
                min: 5,
                max: 12,
                unit: "words"
            },
            "choices": {
                min: 3,
                max: 10,
                unit: "words"
            },
            "totalWords": {
                min: 20,
                max: 50,
                unit: "words"
            }
        },
        3: { 
            "talk": {
                min: 60,
                max: 100,
                unit: "words"
            },
            "questionText": {
                min: 8,
                max: 12,
                unit: "words"
            },
            "choices": {
                min: 3,
                max: 8,
                unit: "words"
            },
            "totalWords": {
                min: 110,
                max: 180,
                unit: "words"
            }
        },
        4: { 
            "speech": {
                min: 80,
                max: 120,
                unit: "words"
            },
            "questionText": {
                min: 8,
                max: 12,
                unit: "words"
            },
            "choices": {
                min: 3,
                max: 8,
                unit: "words"
            },
            "totalWords": {
                min: 130,
                max: 200,
                unit: "words"
            }
        }
    };

    const sectionNumber = domObj.sectionNumber as keyof typeof sectionSpecs;
    const spec = sectionSpecs[sectionNumber];
    const audioStructure = audioScriptStructures[sectionNumber];
    const genres = partGenres[sectionNumber];
    const jpnFormat = jpnAudioScriptFormats[sectionNumber];

    //話者の状況設定
    const settings = getRandomSettings(domObj.requestedNumOfLQuizs, domObj.sectionNumber);
    const settingVariationsText = settings.map((settings, index) => 
        `**Question ${index + 1}**: Location ${settings.location}, Speaker ${settings.speaker}, Situation ${settings.situation}`
    ).join('\n');

    const answerDistributionRulesText = `- **For ${domObj.requestedNumOfLQuizs} questions**: ${answerDistributionRules[domObj.requestedNumOfLQuizs as keyof typeof answerDistributionRules]}` +
   (domObj.sectionNumber === 2 ? `\n- **For Part2 (3 choices) **: Each choice (A, B, C) complies with the above rules` : '');

    const genresText = genres.map((genre, index) => `${index + 1}. **${genre}`).join('\n');

    const constraints = wordConstraints[sectionNumber];
    const constraintsText = Object.entries(constraints)
    .map(([key, value]) => {
        if (typeof value === 'object' && value.min && value.max) {
            return `- **${key}**: Minimum word count ${value.min}${value.unit}, Maximum word count ${value.max}${value.unit}`;
        }
        return `- **${key}**: ${value}`;
    })
    .join('\n');

    //answerOption生成
    function generateBalancedAnswers(requestedNumOfLQuizs: number, sectionNumber: number): string[] {
        if (sectionNumber === 2) {
            // Part2: A, B, C から選択
            const choices = ['A', 'B', 'C'];
            const answerOptionList: string[] = [];
            
            for (let i = 0; i < requestedNumOfLQuizs; i++) {
                const randomIndex = Math.floor(Math.random() * 3); // 0~2
                answerOptionList.push(choices[randomIndex]);
            }
            
            return answerOptionList;
        } else {
            // Part1, 3, 4: A, B, C, D から選択
            const choices = ['A', 'B', 'C', 'D'];
            const answerOptionList: string[] = [];
            
            for (let i = 0; i < requestedNumOfLQuizs; i++) {
                const randomIndex = Math.floor(Math.random() * 4); // 0~3
                answerOptionList.push(choices[randomIndex]);
            }
            
            return answerOptionList;
        }
    };
    function generateAnswerOptionPrompt(answerOptionList: string[]): string {
        const requestedNumOfQuizs = answerOptionList.length;
        const promptLines = answerOptionList.map((option, index) => 
            `**Question ${index + 1}**: The correct answer choice must be ${option}`
        ).join('\n');
        
        return `${promptLines}

### Important Notes
- The above correct answer choices cannot be changed
- Choice order in audioScript is always generated as A→B→C→D
- Place correct content in the specified choice position
- Place appropriate incorrect answers in other choices

### Generation Procedure
1. Determine the correct content for each question
2. Place that content in the specified choice position (${answerOptionList.join(', ')})
3. Place misleading incorrect answer choices in other positions
4. Set the specified values in the answerOption field`;
    }; 

    //Part別チェックリスト生成関数
    function generateChecklistForPart(sectionNumber: number): string {    
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

    //既存のspeaker処理
    let speakerAccentList: AccentType[];
    let accentPatternList: SpeakerAccent[];
    if (domObj.speakerAccent) {
        speakerAccentList = [domObj.speakerAccent];
        accentPatternList = [ACCENT_PATTERNS[domObj.speakerAccent]];
    } else {
        speakerAccentList = getRandomSpeakerAccent(domObj.requestedNumOfLQuizs as number);
        accentPatternList = speakerAccentList.map((accent: AccentType) => ACCENT_PATTERNS[accent]);
    }

    const speakerAccentAndPatternList = Array.from({ length: domObj.requestedNumOfLQuizs as number }, (_, i) => {
        return ({
            accent: speakerAccentList[i % speakerAccentList.length],
            pattern: accentPatternList[i % accentPatternList.length]
        });
    });

    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const promptPath = path.join(__dirname, 'prompts', 'prompt.md');
        const promptTemplate = await fs.readFile(promptPath, 'utf8');

        const speakerAccentAndPatternText = speakerAccentAndPatternList.map((speaker, index) => `**Speaker for Question ${index + 1}:**
- English Type: ${speaker.pattern.description} (${speaker.accent})
- Pronunciation Features: ${speaker.pattern.characteristics.slice(0, 2).join(', ')} (for explanation generation)
- Vocabulary Features: ${speaker.pattern.vocabulary.slice(0, 2).join(', ')}
- Expression Features: ${speaker.pattern.expressions.slice(0, 2).join(', ')}
`).join('');

        const audioStructureText = `
- **Structure**: ${audioStructure.structure}
- **Rules**: ${audioStructure.rules.map(rule => `  - ${rule}`).join('\n')}
- **Example**: "${audioStructure.example}"`;
        
        const answerOptionList = generateBalancedAnswers(domObj.requestedNumOfLQuizs as number, sectionNumber);
        console.log("answerOptionList: ", answerOptionList);
        const answerOptionInstructionText = generateAnswerOptionPrompt(answerOptionList);
        console.log("answerOptionInstructionText: ", answerOptionInstructionText); 

        const contentTopicInstruction = generateContentTopicInstruction(answerOptionList, sectionNumber, settings);
        const contentFrameworksText = generateContentFrameworks(answerOptionList, sectionNumber, settings);

        const outputFormat = `
[
${speakerAccentAndPatternList.map((speaker, index) => `// Question ${index + 1}: Using ${speaker.accent} English
{
    "audioScript": "string (Complete reading content of ${sectionNumber === 2 ? 'question text' : sectionNumber === 4 ? 'speech content + question text' : 'conversation + question text'} + choices)",
    "jpnAudioScript": "string",
    "answerOption": "${answerOptionList[index]}",
    "sectionNumber": ${sectionNumber},
    "explanation": "string",
    "speakerAccent": "${speaker.accent}"
}`).join(',\n')}
]
`;

        return promptTemplate
            .replace(/\{\{sectionNumber\}\}/g, sectionNumber.toString())
            .replace(/\{\{requestedNumOfQuizs\}\}/g, domObj.requestedNumOfLQuizs.toString())
            .replace(/\{\{spec\.description\}\}/g, spec.description)
            .replace(/\{\{spec\.format\}\}/g, spec.format)
            .replace(/\{\{spec\.requirements\}\}/g, spec.requirements)
            .replace(/\{\{speakerAccentAndPatternList\}\}/g, speakerAccentAndPatternText)
            .replace(/\{\{audioStructure\}\}/g, audioStructureText)
            .replace(/\{\{partGenres\}\}/g, genresText)
            .replace(/\{\{jpnAudioScriptFormat\}\}/g, jpnFormat)
            .replace(/\{\{wordConstraints\}\}/g, constraintsText)
            .replace(/\{\{settingVariations\}\}/g, settingVariationsText)
            .replace(/\{\{answerDistributionRules\}\}/g, answerDistributionRulesText)
            .replace(/\{\{outputFormat\}\}/g, outputFormat)
            .replace(/\{\{checkList\}\}/g, generateChecklistForPart(sectionNumber))
            .replace(/\{\{answerOptionInstruction\}\}/g, answerOptionInstructionText)
            .replace(/\{\{contentFrameworks\}\}/g, contentFrameworksText);
            
    } catch (error) {
        console.error('プロンプト生成失敗:', error);
        throw new apierror.PromptGenerateError('Promptの生成に失敗しました');
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
            .replace(/\[間\]/g, '<break time="1.5s"/>')
            .replace(/\[短い間\]/g, '<break time="0.8s"/>');

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