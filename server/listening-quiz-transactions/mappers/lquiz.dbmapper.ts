/*********************************************

lquiz.dbmapper.ts : ListeningQuiz用　models層におけるDB操作用のマッパー

*********************************************/

import * as entity from "../lquiz.entity.js";
import * as domein from "../lquiz.domeinobject.js";
import { PoolClient, QueryResult } from "pg";

//既存クイズデータ queryResult→domein objectへのマッピング
export class LQuestionExtractedDataMapper {
    static toDomainObject(queryResult: QueryResult): domein.LQuestionData[] {
        return queryResult.rows.map(row => new domein.LQuestionData(
            row.l_question_id,
            row.audio_script,
            row.jpn_audio_script,
            row.audio_url,
            row.answer_option,
            row.section_number,
            row.explanation,
            row.duration
        ))
    }
}

//回答結果データ登録用のクラス　entityインターフェース
export class InsertAnswerDataMapper {
    static toDomeinObject(domObj: domein.LAnswerData): entity.LAnswerResultEntity {
        return {
            lAnswerID: domObj.lAnswerID,
            lQuestionID: domObj.lQuestionID,
            userID: domObj.userID,
            userAnswerOption: domObj.userAnswerOption,
            trueOrFalse: domObj.trueOrFalse,
            reviewTag: domObj.reviewTag,
            answerDate: domObj.answerDate,
            createdAt: undefined, //DB登録時に自動生成
            updatedAt: undefined //DB登録時に自動生成
        };
    } 
}

//得られた解答データQueryResultをドメインオブジェクトにマッピング
export class AnswerScriptsListMapper {
    static toDomainObject(queryResult: QueryResult): domein.AnswerScripts[] {
        return queryResult.rows.map(row => new domein.AnswerScripts(
                row.l_question_id,
                row.audio_script,
                row.jpn_audio_script,
                row.explanation
            ))
        }
}