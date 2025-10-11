import { Pool, PoolClient, QueryResult } from "pg";
import {config} from "dotenv";
import { omit } from "zod/v4-mini";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as dberror from "./errors/audio.dberrors.js";

config({path: path.join(__dirname, '../.env')});

//データベース接続用インスタンス
const isProduction = process.env.NODE_ENV === 'production';
let pool: Pool;
if(isProduction){
    pool = new Pool({
        host: process.env.POSTGRES_HOST
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