/*********************************************

lquiz.businessmapper.ts : ListeningQuiz用 controllers~models層におけるビジネスロジックのマッパー

*********************************************/

import * as dto from "../lquiz.dto.js";
import * as domein from "../lquiz.domeinobject.js";

//service プロンプト生成モジュール用
/*export class LQuizGenerateMapper {
    static toDomainObject(reqDTO: dto.QuestionReqDTO): domein.LQuizGenerateInfo {
        return new domein.LQuizGenerateInfo(reqDTO.requestedNumOfLQuizs, reqDTO.sectionNumber);
    }
}*/
//service 復習クイズデータID指定取得用
export class LQuestionInfoMapper {
    static toDomainObject(reqDTOList: dto.QuestionReqDTO[]): domein.LQuestionInfo[] {
        return reqDTOList.map(reqDTO => new domein.LQuestionInfo(
            reqDTO.lQuestionID, 
            reqDTO.userID, 
            reqDTO.sectionNumber, 
            reqDTO.reviewTag, 
            reqDTO.requestedNumOfLQuizs
        ));
    }
};
//service 復習クイズデータランダム取得用
export class LQuestionRandomInfoMapper {
    static toDomainObject(reqDTO: dto.QuestionReqDTO): domein.LQuestionInfo {
        return new domein.LQuestionInfo(
            reqDTO.lQuestionID, 
            reqDTO.userID, 
            reqDTO.sectionNumber, 
            reqDTO.reviewTag, 
            reqDTO.requestedNumOfLQuizs
        );
    }
};

//service クイズ出題用　ドメインオブジェクト→DTOへのマッピング
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
};


//service 正誤判定モジュール用　配列対応済
export class TorFMapper {
    static toDomainObject(reqDTOList: dto.UserAnswerReqDTO[]): domein.TorFData[] {
        return reqDTOList.map(dto => new domein.TorFData(
            dto.lQuestionID,
            dto.userAnswerOption
        ));
    }
};

//service 回答データ登録モジュール用 配列対応済
export class LAnswerRecordMapper {
    static toDomainObject(reqDTOList: dto.UserAnswerReqDTO[], TorFList: boolean[], lAnswerIDList: string[]): domein.LAnswerData[] {
        const domObjs: domein.LAnswerData[] = [];
        for (let i = 0; i < reqDTOList.length; i++) {
            domObjs.push(new domein.LAnswerData(
                lAnswerIDList[i],
                reqDTOList[i].lQuestionID, 
                reqDTOList[i].userID, 
                reqDTOList[i].userAnswerOption, 
                reqDTOList[i].reviewTag, 
                TorFList[i],
                reqDTOList[i].answerDate));
        }
        return domObjs;
    }
}

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