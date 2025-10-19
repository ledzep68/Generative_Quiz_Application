import { Pool, PoolClient, QueryResult } from "pg";
import {config} from "dotenv";

import * as dberror from "./errors/audio.dberrors.js";
import { pool } from "../db.js";

//DB接続
export async function dbGetConnect(): Promise<PoolClient> {
    try {
        return await pool.connect();
    } catch (error) {
        console.log('DB接続エラー (プール取得失敗):', error);
        throw new dberror.DBConnectError("プールの取得に失敗しました");
    }
};

//接続リリース
export async function dbRelease(client: PoolClient): Promise<void> {
    try {
        client.release();
    } catch (error) {
        console.log('DB接続エラー (プール返却失敗):', error);
        throw new dberror.DBConnectError("プールの返却に失敗しました");
    }
};

//audio_file_path取得
export async function audioFilePathExtract(client: PoolClient, questionHash: string): Promise<QueryResult> {
    try {
        const sql = "SELECT audio_file_path FROM listening_questions WHERE question_hash = $1";
        const values = [questionHash];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new dberror.DBQuestionDataError("問題データの検索に失敗しました");
    };
};