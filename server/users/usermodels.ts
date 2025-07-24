/*********************************************

usermodels.tsの機能: ビジネス処理におけるDBの操作のみを提供
                    入力バリデーションやビジネスロジックの実行などは一切行わない

*********************************************/

import { Pool, PoolClient, QueryResult } from "pg";
import { UserDTO } from "./userdto.js";
import * as userdberrors from "./errors/userdberrors.ts";
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
export async function userDBGetConnect(): Promise<PoolClient> {
    try {
        return await pool.connect();
    } catch (error) {
        console.log('DB接続エラー (プール取得失敗):', error);
        throw new userdberrors.DBConnectError("プールの取得に失敗しました");
    }
};

//新規登録
export async function userDBNewDataRecord(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> {
    try{
        const userId = userDTO.userId;
        const username = userDTO.username;
        const hashedpassword = userDTO.hashedpassword;
        const sql = "INSERT INTO users (user_id, user_name, hashed_password) VALUES ($1, $2, $3)";
        const values = [userId, username, hashedpassword];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (INSERT):', error);
        throw new userdberrors.DBOperationError("ユーザーデータの挿入に失敗しました");
    }
};

//ログイン用のデータ取得
export async function userDBLoginDataExtract(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> { 
    try{
        const username = userDTO.username;
        const hashedpassword = userDTO.hashedpassword;
        const sql ="SELECT user_id FROM users WHERE user_name = $1 AND hashed_password = $2";
        const values = [username, hashedpassword];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw new userdberrors.DBOperationError("ユーザーデータの検索に失敗しました");
    }
};

//コネクション返却
export async function userDBRelease(client: PoolClient): Promise<void> {
    try{
        client.release();
    } catch (error) {
        console.log('DB接続エラー (プール返却失敗):', error);
        throw new userdberrors.DBConnectError("プールの返却に失敗しました");
    }
};

//DB切断
export async function userDBDisconnect(): Promise<void> {
    try{
        return await pool.end(); //pool.end()はPromise<void>を返す
    } catch (error) {
        console.log('DB接続エラー (プール終了失敗):', error);
        throw new userdberrors.DBConnectError("DBプールの終了に失敗しました");
    }
};

