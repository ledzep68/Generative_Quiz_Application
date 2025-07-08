/*********************************************

lquizbusinessservice.tsの機能:
    ・内部処理担当
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）
    ・DBトランザクション管理(BEGIN, COMMIT, ROLLBACK)

******************************************/

import {randomUUID, UUID} from "crypto";
import { PoolClient} from "pg";
import * as model from "../lquizmodel.js";
import * as domein from "../lquiz.domeinobject.js";
import * as dbmapper from "../mappers/lquiz.dbmapper.js";
import * as dto from "../lquiz.dto.js";
import * as dberror from "../errors/lquiz.dberrors.js";
import * as businesserror from "../errors/lquiz.businesserrors.js";
import fetch from "node-fetch";
import * as schema from "../schemas/lquizbusinessschema.js";
import { z } from "zod";


//sectionNumberランダム選択関数
export function sectionNumberRandomSelect(requestedNumOfLQuizs: number): number[] {
    const sectionNumber = Math.floor(Math.random() * 4) + 1; 
    const sectionNumberList = Array.from({ length: requestedNumOfLQuizs }, () => sectionNumber);
    return sectionNumberList
};

//問題IDの生成
export function generateLQuestionID(requestedNumOfLQuizs: number): UUID[] {
    const lQuestionIDList: UUID[] = [];
    for (let i = 0; i < requestedNumOfLQuizs; i++) {
        const lQuestionID = randomUUID();
        lQuestionIDList.push(lQuestionID);
    };
    return lQuestionIDList
};

//新規問題の挿入　バッチ処理
export async function newQuestionDataInsert(
    generatedQuestionDataList: dto.GeneratedQuestionDataResDTO[], 
    audioURLList: domein.AudioURL[],
    speakingRate: number
): Promise<void> {
    const client = await model.dbGetConnect();
    try{
        // トランザクション開始
        await client.query('BEGIN');
        // 引数の要素を一括でentityにマッピング
        const insertNewDataList = dbmapper.QuestionDataToEntityMapper.toEntityList(generatedQuestionDataList, audioURLList, speakingRate);
        // 新規問題の挿入
        await model.newQuestionBatchInsert(client, insertNewDataList);
        // コミット
        await client.query('COMMIT');
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('INSERTエラー:', error);
        throw new Error("問題の登録に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};

//既存問題IDを指定して問題データ取得
export async function answeredQuestionDataExtract(domObj: domein.LQuestionInfo[]): Promise<domein.LQuestionData[]> {
    const client = await model.dbGetConnect();
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
export async function answeredQuestionDataRandomExtract(domObj: domein.LQuestionInfo): Promise<domein.LQuestionData[]> {
    const client = await model.dbGetConnect();
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
export async function trueOrFalseJudge(domObjList: domein.TorFData[]): Promise<boolean[]> {
    const client = await model.dbGetConnect();
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
export async function answerResultDataInsert(domObjList: domein.LAnswerData[]): Promise<boolean> {
    const client = await model.dbGetConnect();
    try {
        // トランザクション開始
        await client.query('BEGIN');
        // domObjListの全要素を一括でentityにマッピング
        const insertAnswerDataList = domObjList.map(domObj => 
            dbmapper.AnswerDataToEntityMapper.toDomeinObject(domObj)
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
export async function answerDataExtract(lQuestionIDList: string[]): Promise<domein.AnswerScripts[]> { 
    const client = await model.dbGetConnect();
    try{
        // トランザクション開始
        await client.query('BEGIN');
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