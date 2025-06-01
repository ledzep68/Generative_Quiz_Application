/*********************************************

usermodels.tsの機能: ビジネス処理におけるDBの操作のみを提供
                    入力バリデーションやビジネスロジックの実行などは一切行わない

*********************************************/

import pg, { Client, Pool, PoolClient, Query, QueryResult } from "pg";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { promiseHooks } from "v8";
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
export function userDBGetConnect(): Promise<PoolClient> {
    return pool.connect();
};

//新規登録
export function userDBNewDataRecord(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> {
    const userId = userDTO.userId;
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    const sql = "INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)";
    const values = [userId, username, hashedpassword];
    return client.query(sql, values);
};

//ログイン用のデータ取得
export function userDBLoginDataExtract(client: PoolClient, userDTO: UserDTO): Promise<QueryResult> { 
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    const sql ="SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2";
    const values = [username, hashedpassword];
    return client.query(sql, values);
};

//コネクション返却
//軽量で時間がかからないので同期処理
export function userDBRelease(client: PoolClient): void {
    client.release();
    return;
};

//DB切断
export function userDBDisconnect(): Promise<void> {
    return pool.end(); //pool.end()はPromise<void>を返す
};

