import {Request, Response} from "express";
import * as lquizDTO from "./lquizdto.js";
import * as lquizService from "./lquizservice.js";

//新規クイズ生成・出題
export async function lquizQuestionGenerateController(req: Request, res: Response): Promise<void>{
    
    //・ユーザーリクエスト
    const {RequestedNumOfLQuizs, SectionNumber} = req.body
    //・(ChatGPT-4o API)クイズ生成プロンプト送信
        //要求されたSectionNumかつ要求されたクイズ数の分だけリスニングクイズを生成
        //データ型はLQuestionDTOのJSON型の配列の形で要求
    
    //・(ChatGPT-4o API)クイズ文生成
    //・(Google Cloud TTS)音声合成
    //・音声保存場所のURLを自動生成
    //・音声をサーバーの特定箇所にDL
    //・クイズのID、選択肢、解答番号、クイズ音声URLをDBに記録
    //・ユーザーに配信（クイズ音声URLのAPIエンドポイントはどこで定義するか？）
    return;
};

//既存問題の出題
export async function lquizQuestionReviewController(req: Request, res: Response): Promise<void> {
    /*
    ・ユーザーリクエスト
    ・ListeningAnswerResultsからReviewTagがONになっている問題を取得
    ・LQuestionIDをもとにLinsteningQuestionsテーブルから問題を参照
    ・JSONをユーザーに配信
    */
    return;
}

//正誤判定・解答データ送信
export async function lquizAnswerController(req: Request, res: Response): Promise<void> {
    //ユーザーリクエスト
    const {lQuestionID, userID, userAnswerOption, reviewTag, answerDate} = req.body

    //バリデーション

    //DB接続　poolからコネクションを払い出す
    const client = await lquizService.DBConnect(); //失敗時DBCOnnectErrorをthrow
    //正誤判定 LQuestionIDからListeningQuestions参照、UserAnswerOptionとAnswerOptionを比較しTrueOrFalseに正誤を登録
    const trueOrFalse = await lquizService.trueOrFalseJudge(client, lQuestionID, userAnswerOption);
    //LAnswerIDを新規生成
    const lAnswerID = lquizService.lAnswerIdGenerate();
    //LAnswerResultDTOに結果マッピング
    const lAnswerResultDTO = new lquizDTO.LAnswerResultDTO(lAnswerID, lQuestionID, userID, userAnswerOption, trueOrFalse, reviewTag, answerDate);
    //ListeningAnswerResultsに登録
    await lquizService.AnswerResultDataInsert(client, lAnswerResultDTO);
    //LQuestionIDからListeningQuestions参照、AudioScript, JPNAudioScript, Explanationを取得
    const {AudioScript, JPNAudioScript, Explanation} = await lquizService.AnswerDataExtract(client, lQuestionID);
    //ユーザーに結果（TrueOrFalse）と解答（AudioScript, JPNAudioScript, Explanation）を送信
    res.status(200).json({trueOrFalse, AudioScript, JPNAudioScript, Explanation}); //dtoを使用すべき
    return;
}

//ランキング
export async function lquizRankingController(req: Request, res: Response): Promise<void> {
    return;
}