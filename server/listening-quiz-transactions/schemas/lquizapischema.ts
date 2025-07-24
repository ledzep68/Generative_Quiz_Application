import {z} from "zod";
import * as dto from "../lquiz.dto.ts";

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

//レスポンスの中のクイズデータのバリデーション
export const generatedQuestionDataResDTOSchema: z.ZodSchema<dto.GeneratedQuestionDataResDTO[]> = z.array(z.object({
    audioScript: z.string(),
    jpnAudioScript: z.string(),
    answerOption: z.union([z.literal("A"), z.literal("B"), z.literal("C"), z.literal("D")]),
    sectionNumber: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    explanation: z.string(),
    speakerAccent: z.union([z.literal("American"), z.literal("Canadian"), z.literal("British"), z.literal("Australian")])
    //Duration: z.number(),
    //lQuestionID: z.string().uuid().optional()
})
);

//GoogleTTSのレスポンスのバリデーション
export const GoogleTTSResponseSchema = z.object({
    audioContent: z.string().min(1),
    timepoints: z.array(z.object({
        markName: z.string(),
        timeSeconds: z.number()
    })).optional()
});
