import { Request, response, Response } from "express";
import z from "zod";
import fs from 'fs/promises';
import path from 'path';

import * as service from "./audio.services.ts";
import * as errors from "./errors/audio.businesserrors.ts";
import { audioDeliveryControllerErrorHandler } from "./errors/errorhandlers.ts"
import { error } from "console";

/*
GETリクエスト⇨audioデータ配信（一個ずつ）
*/

async function audioDeliveryController(req: Request, res: Response): Promise<void> {
    console.log('=== Audio API Hit ==='); // ★ 最初に追加
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('params:', req.params);
    const {lQuestionId} = req.params;
    
    try {
        //バリデーション
        if (!lQuestionId || lQuestionId.trim() === '') {
            //console.log(errors.InvalidQuestionIdError, "問題IDが指定されていません");
            throw new errors.InvalidQuestionIdError("問題IDが指定されていません");
        };
        
        //問題IDから音声ファイルパスを取得
        const audioFilePath = await service.audioFilePathExtract(lQuestionId);
        console.log('audioFilePath: ', audioFilePath);
        
        if (!audioFilePath) {
            throw new errors.QuestionNotFoundError(`問題ID: ${lQuestionId} に対応する音声ファイルが見つかりません`);
        };
        
        //ファイル存在確認
        try {
            await fs.access(audioFilePath);
            console.log('audio file exists');
        } catch (error) {
            throw new errors.AudioNotFoundError(`音声ファイルが存在しません: ${audioFilePath}`);
        };
        
        //ファイル情報取得
        let stats;
        try {
            stats = await fs.stat(audioFilePath);
            console.log('stats: ', stats);
        } catch (error) {
            throw new errors.AudioFileAccessError(`音声ファイルの情報取得に失敗しました: ${audioFilePath}`);
        };
        
        //HTTPヘッダー設定
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'public, max-age=3600',
            'Accept-Ranges': 'bytes'
        });
        
        //MP3ファイルを配信
        res.sendFile(path.resolve(audioFilePath), (error) => {
            if (error) {
                throw new errors.AudioDeliveryError(`音声ファイルの送信に失敗しました: ${error.message}`);
            }
        });
        
    } catch (error) {
        console.error('Audio delivery error:', error);
        
        // 拡張エラーオブジェクトの場合
        if (error instanceof Error && 'status' in error) {
            const audioError = error as errors.AudioDeliveryError;
            res.status(audioError.status).json({
                error: {
                    type: audioError.name,
                    title: audioError.message,
                    status: audioError.status
                }
            });
        } else {
            // その他のエラー
            const errorResponse = audioDeliveryControllerErrorHandler(error as Error);
            res.status(errorResponse.response.status).json({
                error: {
                    type: errorResponse.response.type,
                    title: errorResponse.response.title,
                    status: errorResponse.response.status
                }
            });
        }
    }
};

export default audioDeliveryController;