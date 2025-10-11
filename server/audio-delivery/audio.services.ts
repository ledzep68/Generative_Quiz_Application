import * as model from './audio.models.js';

import crypto from "crypto";

export async function audioFilePathExtract(questionHash: string): Promise<string> {
    const client = await model.dbGetConnect();
    try{
        const result = await model.audioFilePathExtract(client, questionHash);
        const audioFilePath = result.rows[0].audio_file_path;
        return audioFilePath;
    } catch (error) {
        console.log('DB操作エラー (SELECT):', error);
        throw error;
    } finally {
        await model.dbRelease(client);
    }
};