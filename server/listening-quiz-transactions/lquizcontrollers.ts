import {Request, Response} from "express";
import {randomUUID, UUID} from "crypto";

import * as dto from "./lquiz.dto.ts"; 

import * as mapper from "./mappers/lquiz.businessmapper.ts";

import * as businessservice from "./services/lquizbusinessservice.ts";
import * as apiservice from "./services/lquizapiservice.ts";

import * as domein from "./lquiz.domeinobject.ts";
import * as errorhandler from "./errors/errorhandlers.ts";

import { z } from "zod";
import * as businessschema from "./schemas/lquizbusinessschema.ts";

//新規クイズ生成・出題
export async function generateQuestionController(req: Request, res: Response): Promise<void>{
    try{
        //バリデーション
        const validatedRandomNewQuestionReqDTO = businessschema.randomNewQuestionReqValidate(req.body.QuestionReqDTO);
        const requestedNumOfLQuizs = validatedRandomNewQuestionReqDTO.requestedNumOfLQuizs;

        //lQuestionID用hash生成　後でDBに登録
        const hashList = businessservice.generateHash(validatedRandomNewQuestionReqDTO);
        //lQuestionID生成
        const lQuestionIDList = await businessservice.generateLQuestionID(validatedRandomNewQuestionReqDTO, hashList);
        
        //プロンプト生成用ドメインオブジェクト作成
        const newLQuestionInfo = mapper.NewLQuestionInfoMapper.toDomainObject(validatedRandomNewQuestionReqDTO);
        const speakingRate = newLQuestionInfo.speakingRate;
        
        //ここから分岐
        //speakerAccent未指定/指定

        //問題生成　newLQuestionInfoで問題生成し、lQuestionIDに紐づける
        const generatedQuestionDataList = await apiservice.generateLQuestionContent(newLQuestionInfo);
        //似たような問題の生成をどうやって防止するか？
        console.log(generatedQuestionDataList);

        
        //SSML生成用ドメインオブジェクト作成
        const newAudioReqDTOList = mapper.generatedQuestionDataToTTSReqMapper.toDomainObject(generatedQuestionDataList, lQuestionIDList, speakingRate as number);
        
        //音声生成　ここでlQuestionIDと紐づけ（適切？）
        //音声データ配信はaudio-deliveryに委任
        const generatedAudioURLList = await apiservice.generateAudioContent(newAudioReqDTOList, lQuestionIDList);
        console.log(generatedAudioURLList);

        //新規クイズデータのDBへの挿入
        await businessservice.newQuestionDataInsert(generatedQuestionDataList, generatedAudioURLList, speakingRate as number); 
        
        //dtoへのマッピング
        const questionResDTOList = mapper.NewQuestionResMapper.toEntityList(generatedQuestionDataList, generatedAudioURLList, speakingRate as number);
        console.log(questionResDTOList);

        //レスポンス送信
        res.status(200).send({
            QuestionResDTO: questionResDTOList
        });
        return;
    } catch (error) {
        console.error('クイズ生成エラー:', error);
        const { response } = errorhandler.generateLQuestionErrorHandler(error as Error);
        res.status(response.status).json(response);
    }
};

/*
//既存問題の出題（ID指定方式）
export async function reviewQuestionController(req: Request, res: Response): Promise<void> {
    
    //・ユーザーリクエスト
    //const validatedQuestionReqDTO = schema.questionReqValidate(req.body.QuestionReqDTO);
    //    questedNumOfLQuizs, sectionNumber, reviewTag <lQuestionID>???
    //ReviewTag trueの場合、既存問題を出題、falseの場合、問題を新規生成、
    
    const validatedQuestionReqDTOList = businessschema.questionReqValidate(req.body.QuestionReqDTO);
    //参照用ドメインオブジェクト作成
    const questionDomObjList = mapper.LQuestionInfoMapper.toDomainObject(validatedQuestionReqDTOList);
    //ListeningAnswerResultsからReviewTagがONになっている問題を取得
    const questionReviewDomObjList = await businessservice.answeredQuestionDataExtract(questionDomObjList);
    //LQuestionIDをもとにLinsteningQuestionsテーブルから問題を参照
    //DTOへのマッピング
    const questionResDTOList = mapper.LQuestionDataDomObjToDTOMapper.toDomainObject(questionReviewDomObjList);
    //JSONをユーザーに配信
    res.status(200).json(questionResDTOList);
    return;
}
*/
/*
//既存問題の出題（ランダム方式）
export async function reviewQuestionByRandomController(req: Request, res: Response): Promise<void> {
    
    //・ユーザーリクエスト
    //const validatedQuestionReqDTO = schema.questionReqValidate(req.body.QuestionReqDTO);
    //    questedNumOfLQuizs, sectionNumber, reviewTag <lQuestionID>???
    //ReviewTag trueの場合、既存問題を出題、falseの場合、問題を新規生成、
    
    const validatedQuestionReqDTO = businessschema.randomQuestionReqValidate(req.body.QuestionReqDTO);
    //参照用ドメインオブジェクト作成
    const questionDomObj = mapper.RandomLQuestionInfoMapper.toDomainObject(validatedQuestionReqDTO);
    //ListeningAnswerResultsからReviewTagがONになっている問題を取得
    const questionReviewDomObjList = await businessservice.answeredQuestionDataRandomExtract(questionDomObj);
    //LQuestionIDをもとにLinsteningQuestionsテーブルから問題を参照
    //DTOへのマッピング
    const questionResDTOList = mapper.LQuestionDataDomObjToDTOMapper.toDomainObject(questionReviewDomObjList);
    //JSONをユーザーに配信
    res.status(200).json(questionResDTOList);
    return;
};
*/

//正誤判定・解答データ送信
export async function answerController(req: Request, res: Response): Promise<void> {
    try{
        //バリデーション　失敗時z.ZodErrorをthrow
        const validatedUserAnswerReqDTO = businessschema.userAnswerReqValidate(req.body);

        //正誤処理用ドメインオブジェクト作成
        const isCorrectDomObjList = mapper.IsCorrectMapper.toDomainObject(validatedUserAnswerReqDTO);

        //正誤判定 LQuestionIDからListeningQuestions参照、UserAnswerOptionとAnswerOptionを比較しTrueOrFalseに正誤を登録
        const isCorrectList = await businessservice.trueOrFalseJudge(isCorrectDomObjList);
        //lAnswerIDを新規生成
        const lAnswerIDList: UUID[] = businessservice.lAnswerIdGenerate(validatedUserAnswerReqDTO.length);
        //回答記録用ドメインオブジェクトlAnswerDataDomObjに結果マッピング
        const lAnswerDataDomObj = mapper.LAnswerRecordMapper.toDomainObject(validatedUserAnswerReqDTO, isCorrectList, lAnswerIDList);
        //ListeningAnswerResultsに登録
        await businessservice.answerResultDataInsert(lAnswerDataDomObj);

        //LQuestionIDからListeningQuestions参照、AudioScript, JPNAudioScript, Explanationを取得
        const lQuestionIDList = validatedUserAnswerReqDTO.map(dto => dto.lQuestionID);

        const answerScriptsDomObjList = await businessservice.answerDataExtract(lQuestionIDList);

        const userAnswerResDTOList = await mapper.UserAnswerResDTOMapper.toDomainObject(lQuestionIDList, isCorrectList, answerScriptsDomObjList);
        //ユーザーに、userAnswerResDTOの形で結果（TrueOrFalse）と解答（lQuestionID, AudioScript, JPNAudioScript, Explanation）を送信
        res.status(200).json(userAnswerResDTOList); //dtoを使用すべき
        return;
    } catch (error) {
        console.error('回答処理エラー', error);
        const { response } = errorhandler.answerControllerErrorHandler(error as Error);
        res.status(response.status).json(response);
    }
};

//ランキング
export async function rankingController(req: Request, res: Response): Promise<void> {

}
