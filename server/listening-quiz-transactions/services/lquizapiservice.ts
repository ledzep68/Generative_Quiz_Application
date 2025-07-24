/*********************************************

lquizapiservice.tsの機能:
    ・外部API連携担当
    ・OpenAI APIとのAPI通信
    ・Google Cloud TTS APIとのAPI通信

******************************************/

import * as domein from "../lquiz.domeinobject.ts";
import * as dto from "../lquiz.dto.ts";
import * as apierror from "../errors/lquiz.apierrors.ts";
//import fetch from "node-fetch";
import * as schema from "../schemas/lquizapischema.ts";
import { z } from "zod";
import {GoogleAuth} from "google-auth-library";
import { spawn } from 'child_process'; //ライブラリを通さず、直接他プログラムを実行するためのライブラリ
import fs from "fs/promises"; //音声バッファデータをローカルファイルに書き込むためのライブラリ
import path from "path";
import os from "os";


//==========================================================================
//問題生成処理モジュール群
//==========================================================================
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
export type SpeakerAccent = typeof ACCENT_PATTERNS[keyof typeof ACCENT_PATTERNS]; 

// ランダム選択関数 リクエストされた問題数分のアクセントを返す
export function getRandomSpeakerAccent(requestedNumOfQuizs: number): AccentType[] {
    const accents = Object.keys(ACCENT_PATTERNS) as AccentType[];
    return Array.from({ length: requestedNumOfQuizs }, () => 
        accents[Math.floor(Math.random() * accents.length)]
    );
};

//問題生成関数 controllerで呼び出す
export async function generateLQuestionContent(domObj: domein.NewQuestionInfo): Promise<dto.GeneratedQuestionDataResDTO[]> {
     //プロンプト生成
    const prompt = await generatePrompt(domObj);
    //・(ChatGPT-4o API)クイズ生成プロンプト生成
    const generatedQuizDataList = await callChatGPT(prompt); //バリデーション済
    //似たような問題の生成をどうやって防止するか？
    return  generatedQuizDataList;
};

//問題生成プロンプトの生成
export function generatePrompt(domObj: domein.NewQuestionInfo): string {

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

    // 話者アクセントをランダム選択
    const speakerAccentList: AccentType[] = getRandomSpeakerAccent(domObj.requestedNumOfQuizs as number);
    const accentPatternList = speakerAccentList.map((accent: AccentType) => ACCENT_PATTERNS[accent]);

    const speakerAccentAndPatternList = Array.from({ length: domObj.requestedNumOfQuizs as number }, (_, i) => {
        return ({
            accent: speakerAccentList[i % speakerAccentList.length],
            pattern: accentPatternList[i % accentPatternList.length]
        });
    });

    return `
TOEICリスニング Part${domObj.sectionNumber} の練習問題を${domObj.requestedNumOfQuizs}問生成してください。

## Part${domObj.sectionNumber} 仕様
- 問題形式: ${spec.description}
- 出題方法: ${spec.format}
- 要件: ${spec.requirements}
- 音声構造: ${spec.audioStructure}

${speakerAccentAndPatternList.map((speaker, index) => `
**問題${index + 1}の話者:**
- 英語種別: ${speaker.pattern.description} (${speaker.accent})
- 発音特徴: ${speaker.pattern.characteristics.slice(0, 2).join(', ')}
- 語彙の特徴: ${speaker.pattern.vocabulary.slice(0, 2).join(', ')}
- 表現の特徴: ${speaker.pattern.expressions.slice(0, 2).join(', ')}
`).join('')}

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
- 選択肢も実際のTOEIC試験レベルの紛らわしさを持つ
`.trim();
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
        console.log('=== Step 2: response確認 ===');
        if (!response.ok) {
            throw new apierror.ChatGPTAPIError(`ChatGPT API Error: ${response.status} ${response.statusText}`);
        }
        
        console.log('=== Step 3: JSON parse開始 ===');
        const data = await response.json();//パース① HTTPレスポンスボディ（バイトストリーム）→ JavaScriptオブジェクト
        console.log('=== Step 4: OpenAI APIの応答構造検証 ===');
        const validatedData = schema.openAIResponseSchema.parse(data);//パース② OpenAI APIの応答構造を検証（choices配列の存在確認など）

        if (validatedData.choices.length === 0) {
            throw new apierror.ChatGPTAPIError('ChatGPT APIからの応答に問題があります');
            console.log('=== Step 4: 失敗 ===');
        }

        console.log('=== Step 5: content抽出 ===');
        const content = validatedData.choices[0].message.content; //ChatGPTが生成したクイズデータのJSON文字列を抽出
        console.log('=== Step 6: content JSON parse ===');
        const parsedContent = JSON.parse(content);//パース③ 文字列をJSONオブジェクトに変換

        const dtoValidationResult = schema.generatedQuestionDataResDTOSchema.safeParse(parsedContent); //パース④ 予期されるDTO形式になっているか検証
        if (!dtoValidationResult.success) {
            console.error('DTO Validation Error:', dtoValidationResult.error);
            throw new apierror.ChatGPTAPIError('生成された問題データが期待する形式と一致しません');
        }

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
}

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
} as const; //リテラル型の保持、readonlyによる値の変更防止 によって設定値の予期しない変更を防ぎ、より厳密な型チェックが可能になる

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

        const totalDuration = audioURLList.reduce((sum, segment) => sum + segment.duration, 0);

        console.log(`音声生成完了: ${audioURLList.length}問, 総時間: ${totalDuration}秒`);
        console.log(audioURLList);

        return audioURLList;

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