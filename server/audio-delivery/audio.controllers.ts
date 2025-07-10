import { Request, response, Response } from "express";
import z from "zod";
import fs from 'fs/promises';
import path from 'path';

import * as service from "./audio.services.js";
import * as errors from "./errors/audio.businesserrors.js";
import { audioDeliveryControllerErrorHandler } from "./errors/errorhandlers.js"

/*
ユーザーにaudioURLに対してGETリクエスト⇨audioデータ配信（一個ずつ）
*/

export async function audioDeliveryController(req: Request, res: Response): Promise<void> {
    const { questionId } = req.params;
    
    try {
        // バリデーション
        if (!questionId || questionId.trim() === '') {
            throw new errors.InvalidQuestionIdError("問題IDが指定されていません");
        }
        
        // 1. 問題IDから音声ファイルパスを取得
        const audioFilePath = await service.audioFilePathExtract(questionId);
        
        if (!audioFilePath) {
            throw new errors.QuestionNotFoundError(`問題ID: ${questionId} に対応する音声ファイルが見つかりません`);
        }
        
        // 2. ファイル存在確認
        try {
            await fs.access(audioFilePath);
        } catch (error) {
            throw new errors.AudioNotFoundError(`音声ファイルが存在しません: ${audioFilePath}`);
        }
        
        // 3. ファイル情報取得
        let stats;
        try {
            stats = await fs.stat(audioFilePath);
        } catch (error) {
            throw new errors.AudioFileAccessError(`音声ファイルの情報取得に失敗しました: ${audioFilePath}`);
        }
        
        // 4. HTTPヘッダー設定
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'public, max-age=3600',
            'Accept-Ranges': 'bytes'
        });
        
        // 5. MP3ファイルを配信
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
}