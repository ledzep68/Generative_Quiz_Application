import {z} from "zod";
import * as dto from "../lquiz.dto.ts";
import * as domein from "../lquiz.domeinobject.ts";
import * as apierror from "../errors/lquiz.apierrors.ts";
import { ZodError } from "zod/v4";

//OpenAI APIからのレスポンスが期待される形式か検証するバリデーション
export const openAIResponseSchema = z.object({
    id: z.string().optional(), // OpenAI APIは通常idを含む
    object: z.string().optional(), // "chat.completion"など
    created: z.number().optional(), // タイムスタンプ
    model: z.string().optional(), // 使用されたモデル
    choices: z.array(z.object({
        index: z.number().optional(),
        message: z.object({
            role: z.string(),
            content: z.string()
        }),
        finish_reason: z.string().optional() // "stop", "length"など
    })).min(1),
    usage: z.object({ // トークン使用量
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number()
    }).optional()
});

//音声データのバリデーション

//GoogleTTSのレスポンスのバリデーション
export const GoogleTTSResponseSchema = z.object({
    audioContent: z.string().min(1),
    timepoints: z.array(z.object({
        markName: z.string(),
        timeSeconds: z.number()
    })).optional()
});

export function validateAudioFilePath(audioFilePath: unknown): domein.AudioFilePath {
    return z.object({
        lQuestionID: z
            .string()
            .min(1, "lQuestionIDは必須です"),
        audioFilePath: z
            .string()
            .min(1, "audioFilePathは必須です")
            .regex(/\.mp3$/i, "audioFilePathはmp3ファイルである必要があります"),
        duration: z.number()
            .min(0.5, "durationは0.5秒以上である必要があります")
            .max(100.0, "durationは100.0秒以下である必要があります")
            .optional()
    }).parse(audioFilePath);
};