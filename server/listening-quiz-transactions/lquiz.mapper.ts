/*********************************************

lquiz.mapper.ts : ListeningQuiz用のマッパー

*********************************************/

import * as lquizdto from "./lquiz.dto.js";
import * as lquizentity from "./lquiz.entity.js";
import * as lquizdomein from "./lquiz.domeinobject.js";

//service プロンプト生成モジュール用
export class LQuizGenerateMapper {
    static toDomainObject(reqDTO: lquizdto.NewQuizReqDTOFromUser): lquizdomein.LQuizGenerateInfo {
        return new lquizdomein.LQuizGenerateInfo(reqDTO.requestedNumOfLQuizs, reqDTO.sectionNumber);
    }
}