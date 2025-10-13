import { Pool, PoolClient, QueryResult } from "pg";
import { parse } from "postgres-array";

import * as domein from "./lquiz.domeinobject.js";
import * as mapper from "./mappers/lquiz.dbmapper.js";
import * as entity from "./lquiz.entity.js"
import * as dberror from "./errors/lquiz.dberrors.js";
import {config} from "dotenv";
import { omit } from "zod/v4-mini";
import {UUID} from "crypto";

import path from 'path'; 
import { fileURLToPath } from 'url'; 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
config({ path: path.join(__dirname, '../.env') });

//データベース接続用インスタンス
const isProduction = process.env.NODE_ENV === 'production';
let pool: Pool;
if(isProduction){
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    pool = new Pool({
        database: process.env.POSTGRES_DB_NAME,
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
    });
};

//DB接続
export async function dbGetConnect(): Promise<PoolClient> {
    try {
        return await pool.connect();
    } catch (error) {
        console.log('DB接続エラー (プール取得失敗):', error);
        throw new dberror.DBConnectError("プールの取得に失敗しました");
    }
};

//コネクションリリース
export async function dbRelease(client: PoolClient): Promise<void> {
    try {
        client.release();
    } catch (error) {
        console.log('DB接続エラー (プール返却失敗):', error);
        throw new dberror.DBConnectError("プールの返却に失敗しました");
    }
};

//新規クイズデータの挿入
export async function newQuestionInsert(client: PoolClient, dataForInsert: entity.LQuestionEntity): Promise<QueryResult> {
    try{
        const placeholders = `($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
        
        const values = [
            dataForInsert.lQuestionID,
            dataForInsert.questionHash,
            dataForInsert.audioScript,
            dataForInsert.jpnAudioScript || null, //NULL
            dataForInsert.answerOption,
            dataForInsert.sectionNumber,
            dataForInsert.explanation || null, //NULL
            dataForInsert.speakerAccent,
            dataForInsert.speakingRate,
            dataForInsert.duration,
            dataForInsert.audioFilePath
        ];

        const sql = `INSERT INTO listening_questions 
                    (l_question_id, question_hash, audio_script, jpn_audio_script, answer_option, section_num, explanation, speaker_accent, speaking_rate, duration, audio_file_path) 
                    VALUES ${placeholders}`;
        
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (INSERT):', error);
        throw new dberror.DBQuestionDataError("問題データの挿入に失敗しました");
    }
};
export async function newJpnAudioScriptExplanationUpdate(
    client: PoolClient, 
    jpnAudioScript: string, 
    explanation: string, 
    questionHash: string
): Promise<QueryResult> {
    try {
        //questionHashで該当の問題レコード検索→jpnAudioScriptとexplanationをUPDATE
        const sql = `
            UPDATE listening_questions
            SET 
                jpn_audio_script = $1,
                explanation = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE question_hash = $3
        `;
        
        const values = [jpnAudioScript, explanation, questionHash];
        
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (UPDATE):', error);
        throw new dberror.DBQuestionDataError("問題データの更新に失敗しました");
    }
}

/*
//指定された問題番号の既存問題のIDをlistening_answer_resultsから取得
export async function answeredQuestionIdSelect(client: PoolClient, domObjList: domein.ReviewQuestionInfo[]): Promise<QueryResult> {
    try{
        //lQuestionIDのみ、プレースホルダーを動的に生成
        const placeholders = domObjList.map((_, index) => `$${index + 2}`).join(', ');
        const sql = 
            `
            SELECT DISTINCT ON (l_question_id) l_question_id
            FROM listening_answer_results 
            WHERE user_id = $1 AND l_question_id IN (${placeholders})
            ORDER BY l_question_id, created_at DESC;
            `;
        const values = [domObjList[0].userID, ...[domObjList.flatMap(domObj => domObj.lQuestionID)]];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBAnswerDataError("問題データの検索に失敗しました");
    }
};
//nsweredQuestionIdSelectで取得した問題IDと一致する問題をlistening_questionsから取得
export async function answeredQuestionDataSelect(client: PoolClient, domObjList: domein.ReviewQuestionInfo[]): Promise<QueryResult> {
    try{
        //lQuestionIDのみ、プレースホルダーを動的に生成
        const placeholders = domObjList.map((_, index) => `$${index + 1}`).join(', ');
        const sql = `SELECT * FROM listening_questions WHERE l_question_id IN (${placeholders})`;
        const values = [domObjList.flatMap(domObj => domObj.lQuestionID)];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("問題データの検索に失敗しました");
    }
};

//既存問題データをlistening_questionsから「ランダム」に取得
export async function answeredQuestionDataRandomSelect(client: PoolClient, domObj: domein.ReviewQuestionInfo): Promise<QueryResult> {
    try{
        const sql = `SELECT * FROM listening_questions WHERE review_tag = true AND section_number = $1 ORDER BY RANDOM() LIMIT $2`;
        const values = [domObj.sectionNumber, domObj.requestedNumOfQuizs];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("問題データの検索に失敗しました");
    }
};
*/

//正誤判定用の解答番号取得
export async function answerOptionExtract(client: PoolClient, questionHash: string): Promise<QueryResult> { 
    try{
        const sql = `SELECT l_question_id, answer_option FROM listening_questions WHERE question_hash = $1`;
        const value = [questionHash];
        return await client.query(sql, value);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("問題データの検索に失敗しました");
    }
};

//解答データ取得
export async function answerDataExtract(client: PoolClient, lQuestionID: string): Promise<QueryResult> { 
    try{
        const sql = `SELECT l_question_id, answer_option, audio_script, jpn_audio_script, explanation FROM listening_questions WHERE l_question_id = $1`;
        const value = [lQuestionID];
        return await client.query(sql, value);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("解答データの取得に失敗しました");
    }
};

export async function attemptsExtract(client: PoolClient, lQuestionID: string, userID: UUID): Promise<QueryResult> {
    try{
        const sql = `SELECT total_attempts, correct_attempts FROM listening_answer_results WHERE user_id = $1 AND l_question_id = $2`;
        const value = [userID, lQuestionID];
        return await client.query(sql, value);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("解答データの取得に失敗しました");
    }
}

//回答結果データ登録
export async function answerResultDataBatchInsert(client: PoolClient, insertAnswerData: entity.LAnswerResultEntity): Promise<QueryResult> {
    try {
        if (!insertAnswerData) {
            throw new Error("挿入データが空です");
        }
        
        const sql = `INSERT INTO listening_answer_results 
                    (l_answer_id, user_id, l_question_id, latest_user_answer, latest_is_correct, total_attempts, correct_attempts, review_tag, first_answered_at, last_answered_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        
        const value = [
            insertAnswerData.lAnswerID,
            insertAnswerData.userID,
            insertAnswerData.lQuestionID,
            insertAnswerData.latestUserAnswerOption,
            insertAnswerData.latestIsCorrect,
            insertAnswerData.totalAttempts ?? 1, //INSERT時点では必ず1
            insertAnswerData.correctAttempts,
            insertAnswerData.reviewTag,
            insertAnswerData.firstAnsweredAt,
            insertAnswerData.lastAnsweredAt
        ];
        
        return await client.query(sql, value);
        
    } catch (error) {
        console.log('DB操作エラー (INSERT):', error);
        throw new dberror.DBAnswerDataError("回答結果データの登録に失敗しました");
    }
};

//復習時回答データ処理
//userIDとlQuestionIDの複合indexでanswer_resultsから回答データをSELECT
//latestIsCorrect、totalAttempts、correctAttemptsをUPDATE