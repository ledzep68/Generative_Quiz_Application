/*********************************************

usermodels.tsの機能: ビジネス処理におけるDBの操作のみを提供
                    入力バリデーションやビジネスロジックの実行などは一切行わない

*********************************************/

import { Pool, PoolClient, QueryResult } from "pg";
import { UserDTO } from "./userdto";

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
        console.log('DB接続エラー:', error);
        throw new Error("DB接続に失敗しました: ${error.message}");
    }
};

//新規登録
export async function userDBNewDataRecord(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> {
    try{
        const userId = userDTO.userId;
        const username = userDTO.username;
        const hashedpassword = userDTO.hashedpassword;
        const sql = "INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)";
        const values = [userId, username, hashedpassword];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB接続エラー:', error);
        throw new Error("DB登録に失敗しました: ${error.message}");
    }
};

//ログイン用のデータ取得
export async function userDBLoginDataExtract(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> { 
    try{
        const username = userDTO.username;
        const hashedpassword = userDTO.hashedpassword;
        const sql ="SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2";
        const values = [username, hashedpassword];
        return await client.query(sql, values);
    } catch (error) {
        console.log('DB接続エラー:', error);
        throw new Error("DB接続に失敗しました: ${error.message}");
    }
};

//コネクション返却
export async function userDBRelease(client: PoolClient): Promise<void> {
    try{
        client.release();
    } catch (error) {
        console.log('DB接続エラー:', error);
        throw new Error("DBコネクション返却に失敗しました: ${error.message}");
    }
};

//DB切断
export async function userDBDisconnect(): Promise<void> {
    try{
        return await pool.end(); //pool.end()はPromise<void>を返す
    } catch (error) {
        console.log('DB接続エラー:', error);
        throw new Error("DB切断に失敗しました: ${error.message}");
    }
};

