import {randomUUID} from "crypto";
import { PoolClient} from "pg";
import { LQuestionDTO, LAnswerResultDTO } from "./lquizdto.js";
import * as lquizmodel from "./lquizmodel.js";
import e from "express";
//import * as userbusinesserrors from "../errors/userbusinesserrors.js";

//DB接続
export async function DBConnect(): Promise<PoolClient> {
    const client = await lquizmodel.DBGetConnect();
    return client
}


//問題IDの生成

//解答データの取得
export async function AnswerDataExtract(client: PoolClient, LQuestionID: string): Promise<LQuestionDTO> {
    try{
        const result = await lquizmodel.AnswerDataExtract(client, LQuestionID);
        return result.rows[0];
    } catch (error) {
        throw new Error("解答データの取得に失敗しました");
    } finally {
        await lquizmodel.DBRelease(client);
    }
}

//回答IDの生成
export function lAnswerIdGenerate(){
    const LAnswerID = randomUUID();
    return LAnswerID
};

//正誤判定（問題テーブル参照も行う）
export async function trueOrFalseJudge(client: PoolClient, LQuestionID: string, UserAnswerOption: string): Promise<boolean> {
    try{
        const result = await lquizmodel.AnswerOptionExtract(client, LQuestionID);
        return result.rows[0].AnswerOption === UserAnswerOption ? true : false;
    } catch (error) {
        throw new Error("正誤判定に失敗しました");
    } finally {
        await lquizmodel.DBRelease(client);
    }
}

//回答結果データの挿入
export async function AnswerResultDataInsert(client: PoolClient, lAnswerResultDTO: LAnswerResultDTO): Promise<boolean> {
    try{
        await lquizmodel.AnswerResultDataInsert(client, lAnswerResultDTO);
        return true
    } catch (error) {
        throw new Error("回答結果データの挿入に失敗しました");
    } finally {
        await lquizmodel.DBRelease(client);
    }
}