import { Pool, PoolClient, QueryResult } from "pg";
import { LQuestionDTO, LAnswerResultDTO } from "./lquizdto.js";
//import * as userdberrors from "../errors/userdberrors.js";
import {config} from "dotenv";
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
export async function DBGetConnect(): Promise<PoolClient> {
    try {
        return await pool.connect();
    } catch (error) {
        console.log('DB接続エラー (プール取得失敗):', error);
        throw new Error("プールの取得に失敗しました");
    }
};

//コネクションリリース
export async function DBRelease(client: PoolClient): Promise<void> {
    try {
        client.release();
    } catch (error) {
        console.log('DB接続エラー (プール返却失敗):', error);
        throw new Error("プールの返却に失敗しました");
    }
};

//正誤判定用の解答番号取得
export async function AnswerOptionExtract(client: PoolClient, LQuestionID: string): Promise<QueryResult> { 
    try{
        const sql ="SELECT answer_option FROM listening_questions WHERE l_question_id = $1";
        const values = [LQuestionID];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new Error("問題データの検索に失敗しました");
    }
};

//解答データ取得
export async function AnswerDataExtract(client: PoolClient, LQuestionID: string): Promise<QueryResult> { 
    try{
        const sql ="SELECT audio_script, jpn_audio_script, explanation FROM listening_questions WHERE l_question_id = $1";
        const values = [LQuestionID];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new Error("問題データの検索に失敗しました");
    }
};

//回答結果データ登録
export async function AnswerResultDataInsert(client: PoolClient, LAnswerResultDTO: LAnswerResultDTO): Promise<QueryResult> {
    try{
        const lAnswerID = LAnswerResultDTO.LAnswerID
        const lQuestionId = LAnswerResultDTO.LQuestionID;
        const userId = LAnswerResultDTO.UserID;
        const userAnswerOption = LAnswerResultDTO.UserAnswerOption;
        const trueOrFalse = LAnswerResultDTO.TrueOrFalse;
        const reviewTag = LAnswerResultDTO.ReviewTag;
        const answerDate = LAnswerResultDTO.AnswerDate;
        const sql = "INSERT INTO listening_answer_results (l_answer_id, l_question_id, user_id, user_answer_option, true_or_false, review_tag, answer_date) VALUES ($1, $2, $3, $4, $5, $6, $7)";
        const values = [lAnswerID, lQuestionId, userId, userAnswerOption, trueOrFalse, reviewTag, answerDate];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (INSERT):', error);
        throw new Error("回答結果データの挿入に失敗しました");
    }
}