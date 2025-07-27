/*********************************************

lquiz.businessmapper.ts : ListeningQuiz用 controllers~models層におけるビジネスロジックのマッパー

*********************************************/
import { UUID } from "crypto";
import * as dto from "../lquiz.dto.ts";
import * as domein from "../lquiz.domeinobject.ts";
import * as entity from "../lquiz.entity.ts";

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
    static toDomainObject(generatedQuestionDataList: dto.GeneratedQuestionDataResDTO[], lQuestionIDList: string[], speakingRate: number): dto.NewAudioReqDTO[] {
        return generatedQuestionDataList.map((generatedQuestionData, index) => new dto.NewAudioReqDTO(
            lQuestionIDList[index],
            generatedQuestionData.audioScript,
            generatedQuestionData.speakerAccent,
            speakingRate
        ));
    }
};

export class NewQuestionResMapper {
    static toEntityList(
            generatedQuestionDataList: dto.GeneratedQuestionDataResDTO[], 
            audioURLList: domein.AudioURL[],
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
   static toDomainObject(reqDTOList: dto.UserAnswerReqDTO[]): domein.IsCorrectData[] {
       return reqDTOList.map(dto => ({
           lQuestionID: dto.lQuestionID,
           userAnswerOption: dto.userAnswerOption
       }));
   }
}

//service 回答データ登録モジュール用 配列対応済
export class LAnswerRecordMapper {
    static toDomainObject(reqDTOList: dto.UserAnswerReqDTO[], isCorrectList: boolean[], lAnswerIDList: UUID[]): domein.NewLAnswerData[] {
        const domObjs: domein.NewLAnswerData[] = [];
        for (let i = 0; i < reqDTOList.length; i++) {
            domObjs.push({
                lAnswerID: lAnswerIDList[i],
                userID: reqDTOList[i].userID, 
                lQuestionID: reqDTOList[i].lQuestionID, 
                userAnswerOption: reqDTOList[i].userAnswerOption, 
                isCorrect: isCorrectList[i],
                reviewTag: reqDTOList[i].reviewTag, 
                answerDate: reqDTOList[i].answerDate
            });
        };
        return domObjs;
    }
};

//service userAnswerResDTOへのマッピング
export class UserAnswerResDTOMapper {
    static toDomainObject(lQuestionIDList: string[], trueOrFalseList: boolean[], domObjList: domein.AnswerScripts[]): dto.UserAnswerResDTO[] {
        const resDTOs: dto.UserAnswerResDTO[] = [];
        for (let i = 0; i < lQuestionIDList.length; i++) {
            resDTOs.push(new dto.UserAnswerResDTO(
                lQuestionIDList[i],
                trueOrFalseList[i],
                domObjList[i].audioScript,
                domObjList[i].jpnAudioScript,
                domObjList[i].explanation));
        };
        return resDTOs;
    }
}