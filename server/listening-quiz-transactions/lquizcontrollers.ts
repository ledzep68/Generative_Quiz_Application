import {Request, Response} from "express";
import {randomUUID, UUID} from "crypto";
import session from "express-session";

import * as dto from "./lquiz.dto.ts"; 

import * as mapper from "./mappers/lquiz.businessmapper.ts";

import * as businessservice from "./services/lquizbusinessservice.ts";
import * as apiservice from "./services/lquizapiservice.ts";

import * as domein from "./lquiz.domeinobject.ts";
import * as errorhandler from "./errors/errorhandlers.ts";

import { z } from "zod";
import * as businessschema from "./schemas/lquizbusinessschema.ts";

//セッションのうちクイズ関連データの初期化
export async function initializeQuizSessionController(req: Request, res: Response): Promise<void> {
    try {
        const newLQuestionInfo = mapper.NewLQuestionInfoMapper.toDomainObject(req.body);
        
        //セッション特定処理の実装は不要（express-sessionが自動処理）
        //req.session は既に現在のユーザーのセッションを指している
        
        //questionSetを作成しセッションに格納
        await apiservice.initializeNewQuestionSet(req.session, newLQuestionInfo);
        
        res.status(200).json({
            success: true,
            sessionId: req.session.id,  //デバッグ用
            message: 'Quiz session initialized'
        });
        
    } catch (error) {
        console.error('Session initialization error:', error as Error);
        res.status(500).json({ error: 'Failed to initialize quiz session' });
    }
};

export async function resetQuizSessionController(req: Request, res: Response): Promise<void> {
    try {
        //完了ログの記録
        console.info(`Quiz session completed successfully: userID=${req.session.userId}`);
        //クイズセッション情報を空にする（questionSetだけ削除）
        await apiservice.resetQuestionSet(req.session);
        
        res.status(200).json({ 
            success: true, 
            message: 'Quiz Session reset successfully'
        });
        
    } catch (error) {
        console.error('Session reset error:', error as Error);
        res.status(500).json({ error: 'Failed to reset session' });
    }
}

//Part2問題&音声データ生成
export async function generatePart2LQuizController(req: Request, res: Response): Promise<void> {
    const sessionData = req.session;
    //sessionData自体のチェック
    if (!sessionData) {
        throw new Error("Session not found");
    }
    //questionSetのチェック
    if (!sessionData.questionSet) {
        throw new Error("Question set not initialized. Please start a new quiz session.");
    }
    const questionSet = sessionData.questionSet;
    console.log("questionSet: ", questionSet);
    //問題番号更新
    const requestedIndex = req.body.currentIndex; //フロントエンドから送信
    questionSet.currentIndex = requestedIndex;
    console.log("currentIndex: ", questionSet.currentIndex);

    const {sectionNumber, currentIndex, totalQuestionNum, speakerAccentList, settingList, speakingRate} = questionSet;
    
    //currentIndexをtotalQuestionNumと比較
    if(currentIndex >= totalQuestionNum){
        throw new Error("Index out of range");
    };
    try{
        //currentIndex<totalQuestionNumの場合
        //問題ID生成
        const questionHash = businessservice.generateHash(req.session.id);
        console.log("questionHash: ", questionHash);
        const lQuestionID = await businessservice.generateLQuestionID(sectionNumber, questionHash);
        console.log("lQuestionID: ", lQuestionID);
        //問題生成
        const questionData = await apiservice.generatePart2Question(req.session); 
        console.log("questionData: ", questionData);
        const audioScriptWithPauses = await apiservice.addPausesToPart2AudioScript(questionData.audioScript);
        console.log("audioScriptWithPauses: ", audioScriptWithPauses);
        const newAudioReqDTO = mapper.generatedQuestionDataToTTSReqMapper.toDomainObject(
            sectionNumber, 
            audioScriptWithPauses, 
            questionData.speakerAccent,
            speakingRate as number
        );
        console.log("newAudioReqDTO: ", newAudioReqDTO);
        const audioFilePath = await apiservice.generateAudioContent(newAudioReqDTO, lQuestionID);
        console.log("audioFilePath: ", audioFilePath);

        //問題データ登録
        await businessservice.newQuestionDataInsert(questionData, audioFilePath, questionHash, speakingRate as number);

        //レスポンス　question_hash配信
        res.status(200).json({
            questionHash: questionHash,
            currentIndex: currentIndex,
            message: 'Question generated and saved successfully'
        });

    } catch (error) {
        console.error('Part2 クイズ生成エラー:', error);
        const { response } = errorhandler.generateLQuestionErrorHandler(error as Error);
        res.status(response.status).json(response);
    }
};

//Part3,4問題&音声データ生成　part2と生成フローが異なるのでエンドポイントを分割した
export async function generatePart34LQuizController(req: Request, res: Response): Promise<void> {
    //currentIndexをtotalQuestionNumと比較
    //currentIndex<totalQuestionNum
        //問題生成
            //sectionNumberで条件分岐
                //Part3,4
                    //問題・音声生成
                    //question_hash配信
                    //日本語訳生成
                    //解説生成
    //currentIndex>=totalQuestionNum
        //インデックス不正エラー
};

/*
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
*/
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
        console.log("validation success: ", validatedUserAnswerReqDTO);

        //正誤処理用ドメインオブジェクト作成
        const isCorrectDomObj = mapper.IsCorrectMapper.toDomainObject(validatedUserAnswerReqDTO);
        console.log("mapping success: ", isCorrectDomObj);

        //正誤判定 questionHashからListeningQuestions参照、UserAnswerOption配列とAnswerOption配列の各要素を比較しisCollectList配列に正誤を登録
        const isCorrectResult = await businessservice.trueOrFalseJudge(isCorrectDomObj);
        console.log("true or false judge success: ", isCorrectResult);
        //lAnswerIDを新規生成
        const lAnswerID = businessservice.lAnswerIdGenerate();

        //セッション情報からuserIDを取得
        const userID = req.session.userId as UUID;
        //回答記録用ドメインオブジェクトlAnswerDataDomObjに結果マッピング
        const lAnswerDataDomObj = mapper.LAnswerRecordMapper.toDomainObject(validatedUserAnswerReqDTO, isCorrectResult, lAnswerID, userID);

        //attemptsを計算
        const attempts = await businessservice.attemptsCount(isCorrectResult, userID);

        //ListeningAnswerResultsに登録
        await businessservice.answerResultDataInsert(lAnswerDataDomObj, attempts);

        const answerScriptsDomObj = await businessservice.answerDataExtract(isCorrectResult.lQuestionID);

        const userAnswerResDTO = await mapper.UserAnswerResDTOMapper.toDataTransferObject(isCorrectResult, answerScriptsDomObj);
        //ユーザーに、userAnswerResDTOの形で結果（TrueOrFalse）と解答（lQuestionID, AudioScript, JPNAudioScript, Explanation）を送信
        res.status(200).json(userAnswerResDTO);
        return;
    } catch (error) {
        console.error('回答処理エラー', error);
        const { response } = errorhandler.answerControllerErrorHandler(error as Error);
        res.status(response.status).json(response);
    }
};

/*
//ランキング
export async function rankingController(req: Request, res: Response): Promise<void> {

}
*/