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
import * as dberror from "./errors/lquiz.dberrors.js";
import * as businesserror from "./errors/lquiz.businesserrors.js";

//DB接続
export async function dbConnect(): Promise<PoolClient> {
    const client = await model.dbGetConnect();
    return client
};


//問題IDの生成

//回答IDの生成　配列対応済
export function lAnswerIdGenerate(length: number /*配列の要素数*/): UUID[] {
    const lAnswerIDs: UUID[] = [];
    for (let i = 0; i < length; i++) {
        const lAnswerID = randomUUID();
        lAnswerIDs.push(lAnswerID);
    };
    return lAnswerIDs
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