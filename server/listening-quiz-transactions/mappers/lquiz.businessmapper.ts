/*********************************************

lquiz.businessmapper.ts : ListeningQuiz用 controllers~models層におけるビジネスロジックのマッパー

*********************************************/

import * as dto from "../lquiz.dto.js";
import * as domein from "../lquiz.domeinobject.js";
import * as entity from "../lquiz.entity.js";

//service プロンプト生成モジュール用
/*export class LQuizGenerateMapper {
    static toDomainObject(reqDTO: dto.QuestionReqDTO): domein.LQuizGenerateInfo {
        return new domein.LQuizGenerateInfo(reqDTO.requestedNumOfLQuizs, reqDTO.sectionNumber);
    }
}*/

//新規クイズデータ　dto.RandomNewQuestionReqDTO→domein.NewQuestionInfo
export class NewQuestionInfoMapper {
    static toDomainObject(reqDTO: dto.RandomNewQuestionReqDTO): domein.NewQuestionInfo {
        return new domein.NewQuestionInfo(reqDTO.sectionNumber, reqDTO.requestedNumOfLQuizs, reqDTO.speakingRate);
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
                    audioScript: questionData.audioScript,
                    jpnAudioScript: questionData.jpnAudioScript,
                    answerOption: questionData.answerOption,
                    sectionNumber: questionData.sectionNumber,
                    explanation: questionData.explanation,
                    speakerAccent: questionData.speakerAccent,
                    speakingRate: speakingRate,
                    duration: audioData.duration,
                    audioURL: audioData.audioURL
                };
            });
        }
};





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
    static toDomainObject(reqDTO: dto.RandomReviewQuestionReqDTO): domein.LQuestionInfo {
        return new domein.LQuestionInfo( 
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