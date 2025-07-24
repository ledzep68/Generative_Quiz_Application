/*********************************************

lquiz.dbmapper.ts : ListeningQuiz用　models層におけるDB操作用のマッパー

*********************************************/

import * as dto from "../lquiz.dto.ts";
import * as entity from "../lquiz.entity.ts";
import * as domein from "../lquiz.domeinobject.ts";
import { QueryResult } from "pg";

//新規クイズデータ記録用　domein.GeneratedLQuestionData→entity.LQuestionEntity
//dto + AudioURL → entity.LQuestionEntity への直接マッピング
export class QuestionDataToEntityMapper {
    static toEntityList(
        generatedQuestionDataList: dto.GeneratedQuestionDataResDTO[], 
        audioURLList: domein.AudioURL[],
        speakingRate: number
    ): entity.LQuestionEntity[] {
        return generatedQuestionDataList.map((questionData, index) => {
            // 対応するaudioURLを取得
            const audioData = audioURLList[index];
            return {
                lQuestionID: audioData.lQuestionID,
                audioScript: questionData.audioScript,
                jpnAudioScript: questionData.jpnAudioScript,
                answerOption: questionData.answerOption,
                sectionNumber: questionData.sectionNumber,
                explanation: questionData.explanation,
                speakerAccent: questionData.speakerAccent,
                speakingRate: speakingRate,
                duration: audioData.duration,
                audioFilePath: audioData.audioFilePath,
                createdAt: undefined, // DB側で自動生成されるためnull
                updatedAt: undefined  // DB側で自動生成されるためnull
            };
        });
    }
}

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
export class AnswerDataToEntityMapper {
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