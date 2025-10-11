/*********************************************

lquiz.businessmapper.ts : ListeningQuiz用 controllers~models層におけるビジネスロジックのマッパー

*********************************************/
import { UUID } from "crypto";
import * as dto from "../lquiz.dto.js";
import * as domein from "../lquiz.domeinobject.js";
import * as entity from "../lquiz.entity.js";

//新規クイズデータ　dto.RandomNewQuestionReqDTO→domein.NewQuestionInfo
export class NewLQuestionInfoMapper {
    static toDomainObject(reqDTO: dto.RandomNewQuestionReqDTO): domein.NewLQuestionInfo {
        return {
            sectionNumber: reqDTO.sectionNumber,
            requestedNumOfLQuizs: reqDTO.requestedNumOfLQuizs,
            speakerAccent: reqDTO.speakerAccent,
            speakingRate: reqDTO.speakingRate
        };
    }
};

//ChatGPT生成クイズデータ&lQuestionIDList→TTSリクエストへのマッパー
export class generatedQuestionDataToTTSReqMapper {
    static toDomainObject(sectionNumber: 1|2|3|4, audioScript: string, speakerAccent: 'American' | 'British' | 'Canadian' | 'Australian', speakingRate: number): dto.NewAudioReqDTO {
        return {
            sectionNumber: sectionNumber,
            audioScript: audioScript,
            speakerAccent: speakerAccent,
            speakingRate: speakingRate
        };
    }
};

/*
//不要
export class NewQuestionResMapper {
    static toEntityList(
            generatedQuestionData: dto.GeneratedQuestionDataResDTO, 
            audioFilePath: domein.AudioFilePath,
            speakingRate: number
        ): dto.QuestionResDTO[] {
            return generatedQuestionDataList.map((questionData, index) => {
                const audioData = audioURLList[index];
                
                return {
                    lQuestionID: audioData.lQuestionID,
                    sectionNumber: questionData.sectionNumber,
                    speakerAccent: questionData.speakerAccent,
                    speakingRate: speakingRate,
                    duration: audioData.duration
                };
            });
        }
};
*/

/*
//service 復習クイズデータID指定取得用
export class LQuestionInfoMapper {
    static toDomainObject(reqDTOList: dto.ReviewQuestionReqDTO[]): domein.ReviewQuestionInfo[] {
        return reqDTOList.map(reqDTO => new domein.LQuestionInfo(
            reqDTO.lQuestionID, 
            reqDTO.userID, 
            reqDTO.sectionNumber, 
            reqDTO.reviewTag
        ));
    }
};
//service 復習クイズデータランダム取得用
export class RandomLQuestionInfoMapper {
    static toDomainObject(reqDTO: dto.RandomReviewQuestionReqDTO): domein.ReviewQuestionInfo {
        return new domein.ReviewQuestionInfo( 
            reqDTO.sectionNumber, 
            reqDTO.lQuestionID,
            reqDTO.userID,
            reqDTO.speakingRate,
            reqDTO.reviewTag, 
            reqDTO.requestedNumOfLQuizs
        );
    }
};*/

/*//service クイズ出題用　ドメインオブジェクト→DTOへのマッピング
export class LQuestionDataDomObjToDTOMapper {
    static toDomainObject(domObjList: domein.LQuestionData[]): dto.QuestionResDTO[] {
        return domObjList.map(domObj => new dto.QuestionResDTO(
            domObj.lQuestionId,
            domObj.audioScript,
            domObj.jpnAudioScript,
            domObj.audioURL,
            domObj.answerOption,
            domObj.sectionNumber,
            domObj.explanation,
            domObj.duration
        ));
    }
};*/


//service 正誤判定モジュール用　配列対応済
export class IsCorrectMapper {
   static toDomainObject(reqDTO: dto.UserAnswerReqDTO): domein.IsCorrectData {
       return {
           questionHash: reqDTO.questionHash,
           userAnswerOption: reqDTO.userAnswerOption
       }
    };
}

//service 回答データ登録モジュール用 配列対応済
export class LAnswerRecordMapper {
    static toDomainObject(reqDTO: dto.UserAnswerReqDTO, isCorrectResult: domein.IsCorrectResult, lAnswerID: UUID, userID: UUID): domein.NewLAnswerData {
        return {
            lAnswerID: lAnswerID,
            userID: userID,
            lQuestionID: isCorrectResult.lQuestionID,
            questionHash: reqDTO.questionHash, 
            userAnswerOption: reqDTO.userAnswerOption, 
            isCorrectList: isCorrectResult.isCorrectList,
            reviewTag: reqDTO.reviewTag, 
            answerDate: reqDTO.answerDate as Date
        };
    }
};

//service userAnswerResDTOへのマッピング
export class UserAnswerResDTOMapper {
    static toDataTransferObject(isCorrectResult: domein.IsCorrectResult, domObj: domein.AnswerScripts): dto.UserAnswerResDTO {
        return {
            answerOption: domObj.answerOption,
            isCorrectList: isCorrectResult.isCorrectList,
            audioScript: domObj.audioScript,
            jpnAudioScript: domObj.jpnAudioScript,
            explanation: domObj.explanation
        };
    }
}