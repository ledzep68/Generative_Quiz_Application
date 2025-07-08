import { Pool, PoolClient, QueryResult } from "pg";
import * as domein from "./lquiz.domeinobject.js";
import * as mapper from "./mappers/lquiz.dbmapper.js";
import * as entity from "./lquiz.entity.js"
import * as dberror from "./errors/lquiz.dberrors.js";
import {config} from "dotenv";
import { omit } from "zod/v4-mini";
config();

//データベース接続用インスタンス
const pool = new Pool({
    database: process.env.POSTGRES_DB_NAME,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

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
export async function newQuestionBatchInsert(client: PoolClient, insertNewDataList: entity.LQuestionEntity[]): Promise<QueryResult> {
    try{
        const placeholders = insertNewDataList.map((_, index) => {
            const baseIndex = index * 9 + 1;
            return `($${baseIndex}, $${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8})`;
        }).join(', ');
        
        const sql = `INSERT INTO listening_questions 
                    (l_question_id, audio_script, jpn_audio_script, answer_option, section_number, explanation, speaker_accent, speaking_rate, duration, audio_file_path) 
                    VALUES ${placeholders}`;
        
        const values = insertNewDataList.flatMap(insertNewData => [
            insertNewData.lQuestionID,
            insertNewData.audioScript,
            insertNewData.jpnAudioScript,
            insertNewData.answerOption,
            insertNewData.sectionNumber,
            insertNewData.explanation,
            insertNewData.speakerAccent,
            insertNewData.speakingRate,
            insertNewData.duration,
            insertNewData.audioFilePath
        ]);
        
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (INSERT):', error);
        throw new dberror.DBQuestionDataError("問題データの挿入に失敗しました");
    }
};


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

//正誤判定用の解答番号取得
export async function answerOptionExtract(client: PoolClient, lQuestionIDList: string[]): Promise<QueryResult> { 
    try{
        //プレースホルダーを動的に生成
        const placeholders = lQuestionIDList.map((_, index) => `($${index + 1}`).join(', ');
        const sql = `SELECT l_question_id, answer_option FROM listening_questions WHERE l_question_id IN (${placeholders})`;
        const values = lQuestionIDList;
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("問題データの検索に失敗しました");
    }
};

//解答データ取得
export async function answerDataBatchExtract(client: PoolClient, lQuestionIDList: string[]): Promise<QueryResult> { 
    try{
        //プレースホルダーを動的に生成
        const placeholders = lQuestionIDList.map((_, index) => `$${index + 1}`).join(', ');
        const sql = `SELECT l_question_id, audio_script, jpn_audio_script, explanation FROM listening_questions WHERE l_question_id IN (${placeholders})`;
        const values = lQuestionIDList;
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (BATCH SELECT):', error);
        throw new dberror.DBQuestionDataError("解答データの取得に失敗しました");
    }
};

//回答結果データ登録　バッチ処理
export async function answerResultDataBatchInsert(client: PoolClient, insertAnswerDataList: entity.LAnswerResultEntity[]): Promise<QueryResult> {
    try {
        if (insertAnswerDataList.length === 0) {
            throw new Error("挿入データが空です");
        }

        // プレースホルダーを動的生成
        const placeholders = insertAnswerDataList.map((_, index) => {
            const baseIndex = index * 7; // 7カラム分
            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7})`;
        }).join(', ');
        
        const sql = `INSERT INTO listening_answer_results 
                    (l_answer_id, l_question_id, user_id, user_answer_option, true_or_false, review_tag, answer_date) 
                    VALUES ${placeholders}`;
        
        // 全データを平坦（一次元）な配列に変換
        const values = insertAnswerDataList.flatMap(insertAnswerData => [
            insertAnswerData.lAnswerID,
            insertAnswerData.lQuestionID,
            insertAnswerData.userID,
            insertAnswerData.userAnswerOption,
            insertAnswerData.trueOrFalse,
            insertAnswerData.reviewTag,
            insertAnswerData.answerDate
        ]);
        
        return await client.query(sql, values);
        
        } catch (error) {
            console.log('DB操作エラー (BATCH INSERT):', error);
            throw new dberror.DBAnswerDataError("回答結果データの登録に失敗しました");
        }
}