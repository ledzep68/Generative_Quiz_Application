/*********************************************

lquizservice.tsの機能:
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）
    ・DBトランザクション管理(BEGIN, COMMIT, ROLLBACK)

******************************************/

import {randomUUID, UUID} from "crypto";
import { PoolClient} from "pg";
import * as model from "./lquizmodel.js";
import * as domein from "./lquiz.domeinobject.js";
import * as dbmapper from "./mappers/lquiz.dbmapper.js";
import * as dto from "./lquiz.dto.js";
import * as dberror from "./errors/lquiz.dberrors.js";
import * as businesserror from "./errors/lquiz.businesserrors.js";
import fetch from "node-fetch";
import * as schema from "./lquizschema.js";
import { z } from "zod";

//DB接続
export async function dbConnect(): Promise<PoolClient> {
    const client = await model.dbGetConnect();
    return client
};


//問題IDの生成
export function lQuestionIDGenerate(requestedNumOfLQuizs: number): UUID[] {
    const lQuestionIDList: UUID[] = [];
    for (let i = 0; i < requestedNumOfLQuizs; i++) {
        const lQuestionID = randomUUID();
        lQuestionIDList.push(lQuestionID);
    };
    return lQuestionIDList
};

//問題生成プロンプトの生成
export function generatePrompt(domObj: domein.LQuestionInfo): string {
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

    return `
    TOEICリスニング Part${domObj.sectionNumber} の練習問題を${domObj.requestedNumOfQuizs}問生成してください。

    ## Part${domObj.sectionNumber} 仕様
    - 問題形式: ${spec.description}
    - 出題方法: ${spec.format}
    - 要件: ${spec.requirements}

    ## 生成要件
    - audioScript: 英語音声テキスト（必須）
    - jpnAudioScript: 日本語訳（必須）
    - question: 設問文（Part1,2は不要、Part3,4は必須）
    - options: 選択肢配列（Part1,3,4は4択、Part2は3択）
    - correctAnswer: 正解選択肢（"A", "B", "C", "D"のいずれか）
    - explanation: 解説（必須）

    ## 出力形式
    必ずJSON形式で以下の構造で回答してください：

    {
    "questions": [
        {
        "audioScript": "string",
        "jpnAudioScript": "string",
        "question": "${domObj.sectionNumber <= 2 ? '' : 'string'}",
        "options": ["A option", "B option", "C option"${domObj.sectionNumber !== 2 ? ', "D option"' : ''}],
        "correctAnswer": "A",
        "explanation": "string"
        }
    ]
    }

    ## 品質基準
    - TOEIC公式問題集レベルの難易度
    - ビジネス・学術・日常生活の実用的な語彙を使用
    - 文法・語彙は中級レベル（TOEIC 600-800点相当）
    - 不正解選択肢も文法的に正しく、紛らわしいものにする
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

//Google TTS
export async function callGoogleTTS(prompt: string) {
    const response = await fetch('https://text-to-speech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`
        },
        body: JSON.stringify({
            input: {
                text: prompt
            },
            voice: {
                languageCode: 'en-US',
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: {
                audioEncoding: 'MP3'
            }
        })
    })
};

//既存問題IDを指定して問題データ取得
export async function answeredQuestionDataExtract(client: PoolClient, domObj: domein.LQuestionInfo[]): Promise<domein.LQuestionData[]> {
    try{
        // トランザクション開始
        await client.query('BEGIN');
        const resultId = await model.answeredQuestionIdSelect(client, domObj);
        const lQuestionIDList = resultId.rows.map(row => row.lQuestionID);
        const resultData = await model.answeredQuestionDataSelect(client, lQuestionIDList);
        // コミット
        await client.query('COMMIT');
        const lQuestionDomObjList = dbmapper.LQuestionExtractedDataMapper.toDomainObject(resultData);
        return lQuestionDomObjList;
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('SELECTエラー:', error);
        throw new Error("問題の取得に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};
//既存問題のランダム取得
export async function answeredQuestionDataRandomExtract(client: PoolClient, domObj: domein.LQuestionInfo): Promise<domein.LQuestionData[]> {
    try{
        // トランザクション開始
        await client.query('BEGIN');
        const result = await model.answeredQuestionDataRandomSelect(client, domObj);
        // コミット
        await client.query('COMMIT');
        const lQuestionDomObjList = dbmapper.LQuestionExtractedDataMapper.toDomainObject(result);
        return lQuestionDomObjList;
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('SELECTエラー:', error);
        throw new Error("問題の取得に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};


//回答IDの生成　配列対応済
export function lAnswerIdGenerate(length: number /*配列の要素数*/): UUID[] {
    const lAnswerIDList: UUID[] = [];
    for (let i = 0; i < length; i++) {
        const lAnswerID = randomUUID();
        lAnswerIDList.push(lAnswerID);
    };
    return lAnswerIDList
};

//正誤判定（問題テーブル参照も行う） 配列対応済
export async function trueOrFalseJudge(client: PoolClient, domObjList: domein.TorFData[]): Promise<boolean[]> {
    try{
        // トランザクション開始
        await client.query('BEGIN');

        const results: boolean[] = [];
        const lQuestionIDList = domObjList.map(domObj => domObj.lQuestionID);
        // クエリ実行
        const answerOptionQueryResult = await model.answerOptionExtract(client, lQuestionIDList);

        // コミット
        await client.query('COMMIT');

        for (let i = 0; i < domObjList.length; i++) {
            const { userAnswerOption } = domObjList[i];
            const { AnswerOption } = answerOptionQueryResult.rows[i];
            results.push(userAnswerOption === AnswerOption ? true : false);
        }
        
        return results;
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('正誤判定エラー:', error);
        throw new Error("正誤判定に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
}

//回答結果データの挿入　バッチ処理
export async function answerResultDataInsert(client: PoolClient, domObjList: domein.LAnswerData[]): Promise<boolean> {
    // トランザクション開始
    await client.query('BEGIN');
    
    try {
        // domObjListの全要素を一括でentityにマッピング
        const insertAnswerDataList = domObjList.map(domObj => 
            dbmapper.InsertAnswerDataMapper.toDomeinObject(domObj)
        );
        
        // バッチINSERT実行
        const result = await model.answerResultDataBatchInsert(client, insertAnswerDataList);
        
        // コミット
        await client.query('COMMIT');
        
        // 全件成功の場合true
        return result.rowCount === domObjList.length;
        
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('バッチINSERTエラー:', error);
        throw new Error("回答結果データの一括挿入に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};


//解答データの取得 配列対応済　バッチ処理
export async function answerDataExtract(client: PoolClient, lQuestionIDList: string[]): Promise<domein.AnswerScripts[]> {
    // トランザクション開始
    await client.query('BEGIN');
    
    try{
        const result = await model.answerDataBatchExtract(client, lQuestionIDList);
        // コミット
        await client.query('COMMIT');
        //const results: domein.AnswerScripts[] = [];
        const results = dbmapper.AnswerScriptsListMapper.toDomainObject(result);
        return results;
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('バッチSELECTエラー:', error);
        throw new Error("解答データの取得に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
}