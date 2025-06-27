import {Request, Response} from "express";
import * as dto from "./lquiz.dto.js"; //API通信用のデータ構造定義
import * as mapper from "./mappers/lquiz.businessmapper.js";
import * as service from "./lquizservice.js";
import * as domein from "./lquiz.domeinobject.js";
import * as schema from "./lquizschema.js";
import * as errorhandler from "./errors/errorhandlers.js";
import * as dberror from "./errors/lquiz.dberrors.js";
import * as businesserror from "./errors/lquiz.businesserrors.js";
import { z } from "zod";

//新規クイズ生成・出題
export async function lquizGenerateController(req: Request, res: Response): Promise<void>{
    
    try{
        //reviewTag falseの場合
        //・(ChatGPT-4o API)クイズ生成プロンプト生成、送信
            //<プロンプト生成モジュール（引数: LQuizGenerateInfo, 戻り値: Prompt）>
        const validatedQuestionReqDTO = schema.questionRandomReqValidate(req.body.QuestionReqDTO);
        const requestedNumOfLQuizs = validatedQuestionReqDTO.requestedNumOfLQuizs

        const prompt = await service.generatePrompt(validatedQuestionReqDTO);
        const generatedQuizData = await service.callChatGPT(prompt);
            // NewQuizGenerateReqDTO（Prompt）をOpenAI APIを使ってpostし、要求されたSectionNumかつ要求されたクイズ数の分だけリスニングクイズを生成
                //似たような問題の生成をどうやって防止するか？
            //データ型はLQuizdtoのJSON型の配列の形でreq
        
        //・(ChatGPT-4o API)クイズ文生成
        //  受取 res = {LQuizGenerateResDTO}
        //  resからAudioScriptを取得、
        //  NewQuizAudioReqDTO(AudioScript)をTTS APIへ送る
        //・(Google Cloud TTS)音声合成
        //  NewQuizAudioResDTO(Audio, durationなど)を受け取る
        //・音声保存場所のURLを自動生成
            //<自動生成モジュール>
        //・音声をサーバーの特定箇所にDL
            //ダウンロード用モジュール？
        //・クイズのID、選択肢、解答番号、クイズ音声URLをDBに記録
            //<DB登録モジュール（引数: lQuizData, 戻り値:boolean）>
        //・ユーザーに配信（クイズ音声URLのAPIエンドポイントはどこで定義するか？）
    return;
    }catch(error){
        //errorhandler.errorHandler(error, res);
    }
};

//既存問題の出題（ID指定方式）
export async function lquizReviewController(req: Request, res: Response): Promise<void> {
    /*
    ・ユーザーリクエスト
    const validatedQuestionReqDTO = schema.questionReqValidate(req.body.QuestionReqDTO);
        questedNumOfLQuizs, sectionNumber, reviewTag <lQuestionID>???
    ReviewTag trueの場合、既存問題を出題、falseの場合、問題を新規生成、
    */
    const validatedQuestionReqDTOList = schema.questionReqValidate(req.body.QuestionReqDTO);
    //参照用ドメインオブジェクト作成
    const questionDomObjList = mapper.LQuestionInfoMapper.toDomainObject(validatedQuestionReqDTOList);
    //DB接続　poolからコネクションを払い出す
    const client = await service.dbConnect(); //失敗時DBCOnnectErrorをthrow
    //ListeningAnswerResultsからReviewTagがONになっている問題を取得
    const questionReviewDomObjList = await service.answeredQuestionDataExtract(client, questionDomObjList);
    //LQuestionIDをもとにLinsteningQuestionsテーブルから問題を参照
    //DTOへのマッピング
    const questionResDTOList = mapper.LQuestionDataDomObjToDTOMapper.toDomainObject(questionReviewDomObjList);
    //JSONをユーザーに配信
    res.status(200).json(questionResDTOList);
    return;
}

//既存問題の出題（ランダム方式）
export async function lquizReviewByRandomController(req: Request, res: Response): Promise<void> {
    /*
    ・ユーザーリクエスト
    const validatedQuestionReqDTO = schema.questionReqValidate(req.body.QuestionReqDTO);
        questedNumOfLQuizs, sectionNumber, reviewTag <lQuestionID>???
    ReviewTag trueの場合、既存問題を出題、falseの場合、問題を新規生成、
    */
    const validatedQuestionReqDTO = schema.questionRandomReqValidate(req.body.QuestionReqDTO);
    //参照用ドメインオブジェクト作成
    const questionDomObj = mapper.LQuestionRandomInfoMapper.toDomainObject(validatedQuestionReqDTO);
    //DB接続　poolからコネクションを払い出す
    const client = await service.dbConnect(); //失敗時DBCOnnectErrorをthrow
    //ListeningAnswerResultsからReviewTagがONになっている問題を取得
    const questionReviewDomObjList = await service.answeredQuestionDataRandomExtract(client, questionDomObj);
    //LQuestionIDをもとにLinsteningQuestionsテーブルから問題を参照
    //DTOへのマッピング
    const questionResDTOList = mapper.LQuestionDataDomObjToDTOMapper.toDomainObject(questionReviewDomObjList);
    //JSONをユーザーに配信
    res.status(200).json(questionResDTOList);
    return;
}

//正誤判定・解答データ送信
export async function lquizAnswerController(req: Request, res: Response): Promise<void> {
    try{
        //バリデーション　失敗時z.ZodErrorをthrow
        const validatedUserAnswerReqDTO = schema.userAnswerReqValidate(req.body.UserAnswerReqDTO);

        //正誤処理用ドメインオブジェクト作成
        const trueOrFalseDomObjList = mapper.TorFMapper.toDomainObject(validatedUserAnswerReqDTO);

        //DB接続　poolからコネクションを払い出す
        const client = await service.dbConnect(); //失敗時DBCOnnectErrorをthrow
        //正誤判定 LQuestionIDからListeningQuestions参照、UserAnswerOptionとAnswerOptionを比較しTrueOrFalseに正誤を登録
        const trueOrFalseList = await service.trueOrFalseJudge(client, trueOrFalseDomObjList);
        //lAnswerIDを新規生成
        const lAnswerIDList = service.lAnswerIdGenerate(validatedUserAnswerReqDTO.length);
        //回答記録用ドメインオブジェクトlAnswerDataDomObjに結果マッピング
        const lAnswerDataDomObj = mapper.LAnswerRecordMapper.toDomainObject(validatedUserAnswerReqDTO, trueOrFalseList, lAnswerIDList);
        //ListeningAnswerResultsに登録
        await service.answerResultDataInsert(client, lAnswerDataDomObj);
        //LQuestionIDからListeningQuestions参照、AudioScript, JPNAudioScript, Explanationを取得
        const lQuestionIDList = validatedUserAnswerReqDTO.map(dto => dto.lQuestionID);

        const answerScriptsDomObjList = await service.answerDataExtract(client, lQuestionIDList);

        const userAnswerResDTOList = await mapper.UserAnswerResDTOMapper.toDomainObject(lQuestionIDList, trueOrFalseList, answerScriptsDomObjList);
        //ユーザーに、userAnswerResDTOの形で結果（TrueOrFalse）と解答（lQuestionID, AudioScript, JPNAudioScript, Explanation）を送信
        res.status(200).json(userAnswerResDTOList); //dtoを使用すべき
        return;
    } catch (error) {
        if(error instanceof z.ZodError){
            const { response } = errorhandler.lQuizAnswerErrorHandler(error);
            console.log("バリデーションエラー", response);
            res.status(response.status).json(response);
            return;
        } else {const { response } = errorhandler.lQuizAnswerErrorHandler(error as Error);
            console.log("ビジネスロジックエラー", response);
            res.status(response.status).json(response);
        }
    }
}

//ランキング
export async function lquizRankingController(req: Request, res: Response): Promise<void> {
    return;
}