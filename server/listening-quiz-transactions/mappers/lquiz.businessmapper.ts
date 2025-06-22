/*********************************************

lquiz.businessmapper.ts : ListeningQuiz用 controllers~models層におけるビジネスロジックのマッパー

*********************************************/

import * as dto from "../lquiz.dto.js";
import * as domein from "../lquiz.domeinobject.js";

//service プロンプト生成モジュール用
export class LQuizGenerateMapper {
    static toDomainObject(reqDTO: dto.NewQuizReqDTOFromUser): domein.LQuizGenerateInfo {
        return new domein.LQuizGenerateInfo(reqDTO.requestedNumOfLQuizs, reqDTO.sectionNumber);
    }
}


//service 正誤判定モジュール用　配列対応済
export class TorFMapper {
    static toDomainObject(reqDTOs: dto.UserAnswerReqDTO[]): domein.TorFData[] {
        return reqDTOs.map(dto => new domein.TorFData(
            dto.lQuestionID,
        dto.userAnswerOption
        ));
    }
}

//service 回答データ登録モジュール用 配列対応済
export class LAnswerRecordMapper {
    static toDomainObject(reqDTOs: dto.UserAnswerReqDTO[], TorFs: boolean[], lAnswerIDs: string[]): domein.LAnswerData[] {
        const domObjs: domein.LAnswerData[] = [];
        for (let i = 0; i < reqDTOs.length; i++) {
            domObjs.push(new domein.LAnswerData(
                lAnswerIDs[i],
                reqDTOs[i].lQuestionID, 
                reqDTOs[i].userID, 
                reqDTOs[i].userAnswerOption, 
                reqDTOs[i].reviewTag, 
                TorFs[i],
                reqDTOs[i].answerDate));
        }
        return domObjs;
    }
}

//service userAnswerResDTOへのマッピング
export class UserAnswerResDTOMapper {
    static toDomainObject(lQuestionID: string[], trueOrFalse: boolean[], domObj: domein.AnswerScripts[]): dto.UserAnswerResDTO[] {
        const resDTOs: dto.UserAnswerResDTO[] = [];
        for (let i = 0; i < lQuestionID.length; i++) {
            resDTOs.push(new dto.UserAnswerResDTO(
                lQuestionID[i],
                trueOrFalse[i],
                domObj[i].audioScript,
                domObj[i].jpnAudioScript,
                domObj[i].explanation));
        };
        return resDTOs;
    }
}