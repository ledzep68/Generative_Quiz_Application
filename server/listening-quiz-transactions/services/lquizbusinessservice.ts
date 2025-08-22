/*********************************************

lquizbusinessservice.tsの機能:
    ・内部処理担当
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）
    ・DBトランザクション管理(BEGIN, COMMIT, ROLLBACK)

******************************************/

import {randomUUID, UUID} from "crypto";
import * as model from "../lquizmodel.ts";
import * as domein from "../lquiz.domeinobject.ts";
import * as dbmapper from "../mappers/lquiz.dbmapper.ts";
import * as dto from "../lquiz.dto.ts";

import crypto from 'crypto';

//問題ID用の12桁hashの生成
export function generateHash(sessionId: string): string {
    const timestamp = Date.now();
    const source = `${JSON.stringify(sessionId)}_${timestamp}`;
    const hash = crypto.createHash('sha256').update(source).digest('hex').substring(0, 12);
    return hash
};

//問題ID生成
export function generateLQuestionID(sectionNumber: 1|2|3|4, hash: string): string {
    const lQuestionID = `listening-part${sectionNumber}-${hash}`;
    return lQuestionID
};


//新規問題の挿入
export async function newQuestionDataInsert(
    generatedQuestionData: dto.GeneratedQuestionDataResDTO, 
    audioFilePath: domein.AudioFilePath,
    questionHash: string,
    speakingRate: number
): Promise<void> {
    const client = await model.dbGetConnect();
    try{
        //トランザクション開始
        await client.query('BEGIN');
        //引数の要素を一括でentityにマッピング
        const questionDataForInsert = dbmapper.QuestionDataToEntityMapper.toEntityList(generatedQuestionData, audioFilePath, questionHash, speakingRate);
        console.log(questionDataForInsert);
        //新規問題の挿入
        await model.newQuestionInsert(client, questionDataForInsert);
        //コミット
        await client.query('COMMIT');
    } catch (error) {
        //エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('INSERTエラー:', error);
        throw new Error("問題の登録に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};

/*
//既存問題IDを指定して問題データ取得
export async function answeredQuestionDataExtract(domObj: domein.ReviewQuestionInfo[]): Promise<domein.LQuestionData[]> {
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
export async function answeredQuestionDataRandomExtract(domObj: domein.ReviewQuestionInfo): Promise<domein.LQuestionData[]> {
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

*/

/* answerController */

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
export async function trueOrFalseJudge(domObjList: domein.IsCorrectData[]): Promise<boolean[]> {
    //domObjList = [ { lQuestionID: 'test-question-001', userAnswerOption: 'A' } ]
    const client = await model.dbGetConnect();
    try{
        // トランザクション開始
        await client.query('BEGIN');

        const results: boolean[] = [];
        const lQuestionIDList = domObjList.map(domObj => domObj.lQuestionID); //['test-question-001']
        console.log("lQuestionIDList: ",lQuestionIDList);
        // クエリ実行
        const answerOptionQueryResult = await model.answerOptionExtract(client, lQuestionIDList);

        // コミット
        await client.query('COMMIT');
        console.log("query result: ", answerOptionQueryResult.rows);

        for (let i = 0; i < domObjList.length; i++) {
            const { userAnswerOption } = domObjList[i];
            const { answer_option } = answerOptionQueryResult.rows[i];
            results.push(userAnswerOption === answer_option ? true : false);
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
};

//回答結果データの挿入　バッチ処理
export async function answerResultDataInsert(domObjList: domein.NewLAnswerData[]): Promise<boolean> {
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