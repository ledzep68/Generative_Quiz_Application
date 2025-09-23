/*********************************************

lquiz.dbmapper.ts : ListeningQuiz用　models層におけるDB操作用のマッパー

*********************************************/

import * as dto from "../lquiz.dto.ts";
import * as entity from "../lquiz.entity.ts";
import * as domein from "../lquiz.domeinobject.ts";
import { QueryResult } from "pg";

import { parse } from "postgres-array";
import {UUID} from "crypto";

//新規クイズデータ記録用　domein.GeneratedLQuestionData→entity.LQuestionEntity
//dto + AudioURL → entity.LQuestionEntity への直接マッピング
export class QuestionDataToEntityMapper {
    static toEntityList(
        generatedQuestionData: dto.GeneratedQuestionDataResDTO, 
        audioFilePath: domein.AudioFilePath,
        questionHash: string,
        speakingRate: number
    ): entity.LQuestionEntity {
            return {
                lQuestionID: audioFilePath.lQuestionID,
                questionHash: questionHash,
                audioScript: generatedQuestionData.audioScript,
                jpnAudioScript: generatedQuestionData.jpnAudioScript || undefined, //null
                answerOption: generatedQuestionData.answerOption as ("A"|"B"|"C"|"D")[],
                sectionNumber: generatedQuestionData.sectionNumber,
                explanation: generatedQuestionData.explanation || undefined, //null
                speakerAccent: generatedQuestionData.speakerAccent,
                speakingRate: speakingRate,
                duration: audioFilePath.duration,
                audioFilePath: audioFilePath.audioFilePath,
                createdAt: undefined, // DB側で自動生成されるためnull
                updatedAt: undefined  // DB側で自動生成されるためnull
            };
    }
}
/*
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
*/

//回答結果データ新規登録用のクラス　entityインターフェース
export class AnswerDataToEntityMapper {
    static toEntityList(domObj: domein.NewLAnswerData, attempts: {totalAttempts: number[], correctAttempts: number[]}): entity.LAnswerResultEntity {
        return {
            lAnswerID: domObj.lAnswerID,
            lQuestionID: domObj.lQuestionID,
            userID: domObj.userID as UUID,
            latestUserAnswerOption: domObj.userAnswerOption,
            latestIsCorrect: domObj.isCorrectList,
            reviewTag: domObj.reviewTag,
            totalAttempts: attempts.totalAttempts,
            correctAttempts: attempts.correctAttempts,
            firstAnsweredAt: domObj.answerDate,
            lastAnsweredAt: domObj.answerDate
        };
    }
};

//得られた解答データQueryResultをドメインオブジェクトにマッピング
export class AnswerScriptsListMapper {
    static toDomainObject(queryResult: QueryResult): domein.AnswerScripts {
        return {
            answerOption: parse(queryResult.rows[0].answer_option) as ("A"|"B"|"C"|"D")[],
            audioScript: queryResult.rows[0].audio_script,
            jpnAudioScript: queryResult.rows[0].jpn_audio_script,
            explanation: queryResult.rows[0].explanation
        }
    }
}

