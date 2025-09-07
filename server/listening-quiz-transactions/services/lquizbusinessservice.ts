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

import { parse } from "postgres-array";
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
export function lAnswerIdGenerate(): UUID {
    return randomUUID();
};

//正誤判定（問題テーブル参照も行う） 配列対応済
export async function trueOrFalseJudge(domObj: domein.IsCorrectData): Promise<domein.IsCorrectResult> {
    const client = await model.dbGetConnect();
    try{
        const {questionHash, userAnswerOption} = domObj

        //トランザクション開始
        await client.query('BEGIN');

        console.log("questionHash: ", questionHash);
        //クエリ実行
        const answerOptionQueryResult = await model.answerOptionExtract(client, questionHash);

        //コミット
        await client.query('COMMIT');
        console.log("query result: ", answerOptionQueryResult.rows);

        const lQuestionID = answerOptionQueryResult.rows[0].l_question_id;
        console.log("lQuestionID: ", lQuestionID);
        if (!lQuestionID) {
            throw new Error("正誤判定に失敗しました");
        }

        const answer_option = parse(answerOptionQueryResult.rows[0].answer_option) as ("A"|"B"|"C"|"D")[];
        console.log("parsed answer_option: ", answer_option);
        if (answer_option.length !== userAnswerOption.length) {
            throw new Error("正誤判定に失敗しました");
        }
        //正誤判定
        const isCorrectList: boolean[] = answer_option.map((correct, i) => 
            correct === userAnswerOption[i]
        );
        
        return {lQuestionID, isCorrectList};
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('正誤判定エラー:', error);
        throw new Error("正誤判定に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};

//totalAttempts, correctAttempts計算
export async function attemptsCount(domObj: domein.IsCorrectResult, userID: UUID): Promise<{totalAttempts: number[], correctAttempts: number[]}> {
    const {lQuestionID, isCorrectList} = domObj;
    const client = await model.dbGetConnect();
    try{
        //トランザクション開始
        await client.query('BEGIN');
        const attemptsQueryResult = await model.attemptsExtract(client, lQuestionID, userID);
        //コミット
        await client.query('COMMIT');
        //answer_resultsテーブルに、該当するlQuestionID, userIDの回答データが既に登録されているか
            //されている場合
                //correctAttemptsを取得
                //isCorrectListの各要素がtrueなら、correctAttemptsの同じindexの要素の値に+1、falseなら何もしない
            //されていない場合
                //correctAttempts配列を生成する　isCorrectListの各要素がtrueなら+1、falseならそのまま
        if(attemptsQueryResult.rows.length === 0) {
            return {
                totalAttempts: new Array(domObj.isCorrectList.length).fill(1), 
                correctAttempts: domObj.isCorrectList.map(isCorrect => isCorrect ? 1 : 0)
            }
        } else {
            const existingTotalAttempts = attemptsQueryResult.rows[0].total_attempts as number[];
            const existingCorrectAttempts = attemptsQueryResult.rows[0].correct_attempts as number[];
            const totalAttempts = existingTotalAttempts.map((count) => count+1);
            const correctAttempts = existingCorrectAttempts.map((count, i) => isCorrectList[i]===true ? count+1 : count)
            return {totalAttempts, correctAttempts};
        }
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('SELECTエラー:', error);
        throw new Error("attemptsの取得に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};

//回答結果データの挿入
export async function answerResultDataInsert(
    domObj: domein.NewLAnswerData, 
    attempts: {totalAttempts: number[], correctAttempts: number[]}
): Promise<boolean> {
    const client = await model.dbGetConnect();
    try {
        // トランザクション開始
        await client.query('BEGIN');
        // domObjListの全要素を一括でentityにマッピング
        const insertAnswerData = dbmapper.AnswerDataToEntityMapper.toEntityList(domObj, attempts);
        
        // バッチINSERT実行
        const result = await model.answerResultDataBatchInsert(client, insertAnswerData);
        
        // コミット
        await client.query('COMMIT');
        
        return result.rowCount === 1
        
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('INSERTエラー:', error);
        throw new Error("回答結果データの一括挿入に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
};


//解答データの取得
export async function answerDataExtract(lQuestionID: string): Promise<domein.AnswerScripts> { 
    const client = await model.dbGetConnect();
    try{
        // トランザクション開始
        await client.query('BEGIN');
        const answerDataQueryResult = await model.answerDataExtract(client, lQuestionID);
        // コミット
        await client.query('COMMIT');
        //const results: domein.AnswerScripts[] = [];
        const result = dbmapper.AnswerScriptsListMapper.toDomainObject(answerDataQueryResult);
        return result;
    } catch (error) {
        // エラー時はロールバック
        await client.query('ROLLBACK');
        console.log('SELECTエラー:', error);
        throw new Error("解答データの取得に失敗しました");
    } finally {
        await model.dbRelease(client);
    }
}