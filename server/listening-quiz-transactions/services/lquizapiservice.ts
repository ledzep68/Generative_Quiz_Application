/*********************************************

lquizapiservice.tsの機能:
    ・外部API連携担当
    ・OpenAI APIとのAPI通信
    ・Google Cloud TTS APIとのAPI通信

******************************************/

import * as domein from "../lquiz.domeinobject.js";
import * as dto from "../lquiz.dto.js";
import * as businesserror from "../errors/lquiz.businesserrors.js";
import fetch from "node-fetch";
import * as schema from "../schemas/lquizapischema.js";
import { z } from "zod";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
//import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import {GoogleAuth} from "google-auth-library";

//発話パターン定義
export const ACCENT_PATTERNS = {
    American: {
        description: "アメリカ英語",
        characteristics: [
            "Rhoticity: 語尾のrを明確に発音",
            "Flat 'a': cat, hat等で平坦な'a'音", 
            "T-flapping: better → 'bedder'のような音",
            "語尾の't'の弱化: mountain → 'moun'in'"
        ],
        vocabulary: [
            "elevator (not lift)",
            "apartment (not flat)", 
            "truck (not lorry)",
            "gas (not petrol)"
        ],
        expressions: [
            "I guess...",
            "You bet!",
            "Sure thing",
            "No problem"
        ]
    },
    Canadian: {
        description: "カナダ英語", 
        characteristics: [
            "Canadian raising: about → 'aboot'のような音",
            "アメリカ英語に近いがイギリス英語の影響も",
            "語尾の'eh'の使用",
            "'ou'音の特徴的な発音"
        ],
        vocabulary: [
            "washroom (not bathroom/toilet)",
            "toque (winter hat)",
            "loonie (one dollar coin)",
            "double-double (coffee with cream and sugar)"
        ],
        expressions: [
            "How's it going, eh?",
            "That's pretty good",
            "No worries",
            "Take care"
        ]
    },
    British: {
        description: "イギリス英語",
        characteristics: [
            "Non-rhotic: 語尾のrを発音しない",
            "Received Pronunciation (RP)の特徴",
            "'a'音の長さの違い: bath → 'baath'",
            "Clear distinction of short and long vowels"
        ],
        vocabulary: [
            "lift (not elevator)",
            "flat (not apartment)",
            "lorry (not truck)", 
            "petrol (not gas)"
        ],
        expressions: [
            "Brilliant!",
            "Cheers",
            "I reckon...",
            "Quite right"
        ]
    },
    Australian: {
        description: "オーストラリア英語",
        characteristics: [
            "Vowel shifts: 'day' → 'die'のような音",
            "Rising intonation: 平叙文でも語尾が上がる",
            "Short vowel changes: 'bit' → 'bet'のような音",
            "Consonant reduction: 'going' → 'goin''"
        ],
        vocabulary: [
            "arvo (afternoon)",
            "brekkie (breakfast)",
            "uni (university)",
            "mate (friend)"
        ],
        expressions: [
            "No worries, mate",
            "Fair dinkum",
            "She'll be right",
            "Good on ya"
        ]
    }
};

export type AccentType = keyof typeof ACCENT_PATTERNS; 
export type SpeakerAccent = typeof ACCENT_PATTERNS[keyof typeof ACCENT_PATTERNS]; //要確認

// ランダム選択関数
export function getRandomSpeakerAccent(): AccentType {
    const accents = Object.keys(ACCENT_PATTERNS) as AccentType[];
    const randomIndex = Math.floor(Math.random() * accents.length);
    return accents[randomIndex];
};//要確認

//問題生成プロンプトの生成
export function generatePrompt(domObj: domein.LQuestionInfo): string {

    const sectionSpecs = {
        1: {
            description: "写真描写問題",
            format: "1枚の写真について4つの短い説明文が読まれ、写真を最も適切に描写しているものを選ぶ",
            requirements: "写真に写っている人物の動作、物の状態、場所の様子を正確に描写",
            audioStructure: "4つの選択肢のみを読み上げ（A, B, C, Dの順序で）"
        },
        2: {
            description: "応答問題", 
            format: "質問や文章に対する最も適切な応答を3つの選択肢から選ぶ",
            requirements: "自然な会話の流れに沿った適切な応答",
            audioStructure: "まず質問文、その後3つの選択肢を読み上げ（A, B, Cの順序で）"
        },
        3: {
            description: "会話問題",
            format: "2人または3人の会話を聞き、設問に対する答えを4つの選択肢から選ぶ",
            requirements: "ビジネスや日常生活の場面での自然な会話",
            audioStructure: "会話文 + 設問文 + 4つの選択肢を連続して読み上げ（A, B, C, Dの順序で）"
        },
        4: {
            description: "説明文問題",
            format: "短いトークを聞き、設問に対する答えを4つの選択肢から選ぶ", 
            requirements: "アナウンス、広告、会議、講演などの実用的な内容",
            audioStructure: "トーク内容 + 設問文 + 4つの選択肢を連続して読み上げ（A, B, C, Dの順序で）"
        }
    };

    const spec = sectionSpecs[domObj.sectionNumber as keyof typeof sectionSpecs];

    // 話者アクセントをランダム選択（指定がない場合）
    const speakerAccent = domObj.speakerAccent || getRandomSpeakerAccent();
    const accentPattern = ACCENT_PATTERNS[speakerAccent]; //要確認

    return `
TOEICリスニング Part${domObj.sectionNumber} の練習問題を${domObj.requestedNumOfQuizs}問生成してください。

## Part${domObj.sectionNumber} 仕様
- 問題形式: ${spec.description}
- 出題方法: ${spec.format}
- 要件: ${spec.requirements}
- 音声構造: ${spec.audioStructure}

## 話者設定
**話者の英語種別: ${accentPattern.description} (${speakerAccent})**

### ${speakerAccent}英語の特徴
**発音特徴:**
${accentPattern.characteristics.map(char => `- ${char}`).join('\n')}

**語彙の特徴:**
${accentPattern.vocabulary.map(vocab => `- ${vocab}`).join('\n')}

**表現の特徴:**
${accentPattern.expressions.map(expr => `- ${expr}`).join('\n')}

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
- answerOption: 正解選択肢（"A", "B", "C", "D"のいずれか）（必須）
- explanation: 解説（必須）
- speakerAccent: "${speakerAccent}" （固定値）

## 出力形式
必ずJSON形式で以下の構造で回答してください：

{
  "questions": [
    {
    "audioScript": "string (問題文+設問文+選択肢の完全な読み上げ内容)",
    "jpnAudioScript": "string",
    "answerOption": "A"|"B"|"C"|"D",
    "explanation": "string",
    "speakerAccent": "${speakerAccent}"
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
- ${speakerAccent}英語の語彙・表現・発音特徴を自然に組み込む
- 文法・語彙は中級レベル（TOEIC 600-800点相当）
- 音声として聞いた時の自然さを重視
- 選択肢も実際のTOEIC試験レベルの紛らわしさを持つ
`.trim();
};

//chatgpt
export async function callChatGPT(prompt: string): Promise<dto.GeneratedQuestionDataResDTO[]> {
    try {
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
                        content: "あなたはTOEIC問題作成の専門家です。指定された仕様に従ってJSON形式で問題を生成してください。"
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            })
        });
        if (!response.ok) {
            throw new businesserror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();//パース① HTTPレスポンスボディ（バイトストリーム）→ JavaScriptオブジェクト
        const validatedData = schema.openAIResponseSchema.parse(data);//パース② OpenAI APIの応答構造を検証（choices配列の存在確認など）

        const content = validatedData.choices[0].message.content; //ChatGPTが生成したクイズデータのJSON文字列を抽出
        const parsedContent = JSON.parse(content);//パース③ 文字列をJSONオブジェクトに変換

        const dtoValidationResult = schema.generatedQuestionDataResDTOSchema.safeParse(parsedContent); //パース④ 予期されるDTO形式になっているか検証
        if (!dtoValidationResult.success) {
            console.error('DTO Validation Error:', dtoValidationResult.error);
            throw new businesserror.ChatGPTAPIError('生成された問題データが期待する形式と一致しません');
        }

        return dtoValidationResult.data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`OpenAI APIから予期しない形式のレスポンスを受信しました:`, error);
            throw new businesserror.ChatGPTAPIError(`OpenAI APIから予期しない形式のレスポンスを受信しました: ${error.message}`);
        }else if (error instanceof businesserror.ChatGPTAPIError) {
            throw error; // 既知のビジネスエラーはそのまま
        } else {
        console.error('Unexpected ChatGPT API Error:', error);
        throw new businesserror.ChatGPTAPIError('ChatGPT APIとの通信で予期しないエラーが発生しました');
        }
    }
};



//音声設定（話者アクセント）
export const TTS_VOICE_CONFIG = {
    American: {
        languageCode: 'en-US',
        voices: [
            { name: 'en-US-Neural2-A', gender: 'FEMALE' },
            { name: 'en-US-Neural2-C', gender: 'FEMALE' },
            { name: 'en-US-Neural2-D', gender: 'MALE' },
            { name: 'en-US-Neural2-F', gender: 'MALE' }
        ]
    },
    Canadian: {
        languageCode: 'en-US', // カナダ英語は en-US で代用
        voices: [
            { name: 'en-US-Neural2-A', gender: 'FEMALE' },
            { name: 'en-US-Neural2-D', gender: 'MALE' }
        ]
    },
    British: {
        languageCode: 'en-GB',
        voices: [
            { name: 'en-GB-Neural2-A', gender: 'FEMALE' },
            { name: 'en-GB-Neural2-B', gender: 'MALE' },
            { name: 'en-GB-Neural2-C', gender: 'FEMALE' },
            { name: 'en-GB-Neural2-D', gender: 'MALE' }
        ]
    },
    Australian: {
        languageCode: 'en-AU',
        voices: [
            { name: 'en-AU-Neural2-A', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-B', gender: 'MALE' },
            { name: 'en-AU-Neural2-C', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-D', gender: 'MALE' }
        ]
    }
} as const; //リテラル型の保持、readonlyによる値の変更防止によって設定値の予期しない変更を防ぎ、より厳密な型チェックが可能になる

/*SSML生成モジュール
引数：
    [
        {
        lQuestionID: string.
        audioScript: string.
        speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian',
        speakingRate: number
        },
        ...(問題数分のオブジェクト)...
    ]
戻り値：SSML
*/
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
            ${questionParts.join('\n            ')}
            <break time="2s"/>
        </prosody>
    </voice>
</speak>
`.trim();
    }

    private static createQuestionSSML(question: dto.NewAudioReqDTO, questionNumber: number): string {
        // [間]を<break>タグに変換するだけ
        const processedScript = question.audioScript
            .replace(/\[間\]/g, '<break time="1.5s"/>')
            .replace(/\[短い間\]/g, '<break time="0.8s"/>');
        
        const escapedScript = this.escapeSSML(processedScript);

        return `
<!-- Question ${questionNumber}: ${question.lQuestionID} -->
<mark name="q${questionNumber}_start"/>
<prosody rate="${question.speakingRate}">
    ${escapedScript}
</prosody>
<mark name="q${questionNumber}_end"/>
`; //<mark>音声分割に必要なタグ
    }

    private static escapeSSML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    } //XMLの特殊文字として解釈される文字を、XMLの特殊文字として解釈しないようにエスケープする
}

/*fetchモジュール
引数：SSML
動作：fetch
戻り値：問題数分の音声データ
*/
export interface AudioSegment {
    questionId: string;
    audioData: Buffer;
    startTime: number;    // 秒
    duration: number;     // 秒
    format: 'mp3' | 'wav';
}

export interface TTSResponse {
    success: boolean;
    audioSegments: AudioSegment[];
    totalDuration: number;
    fullAudioData: Buffer;
    error?: string;
}

//Google Cloud TTSで音声生成
export async function callGoogleCloudTTS(ssml: string): Promise<TTSResponse> {
    try {
        // 環境変数チェック
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS環境変数が設定されていません');
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
                /*voice: {
                    languageCode: extractLanguageCodeFromSSML(ssml),
                    name: extractVoiceNameFromSSML(ssml),
                    ssmlGender: 'NEUTRAL'
                },*/
                audioConfig: {
                    audioEncoding: 'MP3',
                    sampleRateHertz: 24000,
                    volumeGainDb: 0.0,
                    /*speakingRate: extractSpeakingRateFromSSML(ssml),*/
                    pitch: 0.0
                },
                enableTimePointing: ['SSML_MARK'] // 時間情報取得用
            })
        });

        // レスポンスチェック
        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS API Error:', response.status, errorText);
            throw new Error(`TTS API Error: ${response.status} ${response.statusText}`);
        }

        const data = schema.GoogleTTSResponseSchema.parse(await response.json());
        
        if (!data.audioContent) {
            throw new Error('音声コンテンツが生成されませんでした');
        }

        // Base64デコード
        const fullAudioBuffer = Buffer.from(data.audioContent, 'base64');
        
        // 問題毎に音声を分割
        const audioSegments = await splitAudioByQuestions(
            fullAudioBuffer, 
            ssml,
            data.timepoints || []
        );

        const totalDuration = audioSegments.reduce((sum, segment) => sum + segment.duration, 0);

        console.log(`音声生成完了: ${audioSegments.length}問, 総時間: ${totalDuration}秒`);

        return {
            success: true,
            audioSegments,
            totalDuration,
            fullAudioData: fullAudioBuffer
        };

    } catch (error) {
        console.error('TTS API呼び出しエラー:', error);
        return {
            success: false,
            audioSegments: [],
            totalDuration: 0,
            fullAudioData: Buffer.alloc(0),
            error: error instanceof Error ? error.message : 'TTS API呼び出しエラー'
        };
    }
}



//SSMLの構造検証
function validateSSML(ssml: string): void {
    if (!ssml || ssml.trim().length === 0) {
        throw new Error('SSMLが空です');
    }

    if (!ssml.includes('<speak>') || !ssml.includes('</speak>')) {
        throw new Error('無効なSSML形式です');
    }

    /*if (ssml.length > 100000) {
        throw new Error('SSMLが長すぎます（100,000文字以下）');
    }*/

    // XML形式の基本チェック
    try {
        // 簡易的なXML構文チェック
        const openTags = (ssml.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (ssml.match(/<\/[^>]*>/g) || []).length;
        const selfCloseTags = (ssml.match(/<[^>]*\/>/g) || []).length;
        
        if (openTags !== closeTags + selfCloseTags) {
            throw new Error('SSML構文エラー: タグの開始と終了が一致しません');
        }
    } catch (error) {
        throw new Error(`SSML構文エラー: ${error}`);
    }
}

//音声データを問題毎に分割
async function splitAudioByQuestions(
    audioBuffer: Buffer, //Base64でエンコードされた音声データ　未分割
    timepoints: Array<{ markName: string; timeSeconds: number }>, //時間情報　どこで切るかの指定
    lQuestionIDList: string[] //分割した各問題に付与する識別子
): Promise<AudioSegment[]> {
    // 1. timepoints をペアにグループ化
    const questionTimeRanges = extractQuestionTimeRanges(timepoints);
    
    // 2. 各時間範囲で音声を分割
    const segments: AudioSegment[] = [];
    
    for (let i = 0; i < questionTimeRanges.length; i++) {
        const { startTime, endTime } = questionTimeRanges[i];
        const questionId = lQuestionIDList[i];
        
        // 3. 音声切り出し（FFmpeg等を使用）
        const segmentBuffer = await extractAudioSegment(
            audioBuffer,
            startTime,
            endTime
        );
        
        segments.push({
            questionId,
            audioData: segmentBuffer,
            startTime,
            duration: endTime - startTime,
            format: 'mp3'
        });
    }
    
    return segments;
};

//時間範囲抽出
function extractQuestionTimeRanges(timepoints: Array<{ markName: string; timeSeconds: number }>): Array<{ startTime: number; endTime: number }> {
    const ranges = [];
    
    // "q1_start", "q1_end" のペアを探す
    for (let i = 1; i <= 100; i++) { // 最大100問まで
        const startMark = timepoints.find(tp => tp.markName === `q${i}_start`);
        const endMark = timepoints.find(tp => tp.markName === `q${i}_end`);
        
        if (startMark && endMark) {
            ranges.push({
                startTime: startMark.timeSeconds,
                endTime: endMark.timeSeconds
            });
        }
    }
    
    return ranges;
};

//音声データの切り出し処理
async function extractAudioSegment(
    audioBuffer: Buffer,
    startTime: number,
    endTime: number
): Promise<Buffer> {
    // Option 1: FFmpeg を使用
    return await ffmpegExtract(audioBuffer, startTime, endTime);
    
    // Option 2: 音声処理ライブラリを使用
    // return await audioLibraryExtract(audioBuffer, startTime, endTime);
}

//Google Cloud認証トークン取得
async function getGoogleAccessToken(): Promise<string> {
    try {
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        
        if (!accessToken.token) {
            throw new Error('アクセストークンの取得に失敗しました');
        }
        
        return accessToken.token;
    } catch (error) {
        throw new Error(`認証エラー: ${error instanceof Error}`);
    }
}