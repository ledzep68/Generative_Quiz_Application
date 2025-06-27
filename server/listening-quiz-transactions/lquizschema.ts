import {z} from "zod";
import * as dto from "./lquiz.dto.js";

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
    //Duration: z.number(),
    lQuestionID: z.string().uuid().optional()
})
);

/*export class GeneratedQuestionDataResDTO {
    constructor(
        public audioScript: string,
        public jpnAudioScript: string,
        public answerOption: "A"|"B"|"C"|"D",
        public sectionNumber: 1|2|3|4,
        public explanation: string,
        //public Duration: number,
        public lQuestionID?: string
    ){}
}*/

//復習クイズデータID指定取得用　ユーザーの入力値　QuestionReqDTO[]のバリデーション関数
export function questionReqValidate(reqDTO: dto.QuestionReqDTO){
    const questionReqValidationSchema: z.ZodSchema<dto.QuestionReqDTO[]> = z.array(
        z.object(
            {
            lQuestionID: z
                .string()
                .uuid(),
            userID: z
                .string()
                .uuid(),
            sectionNumber: z
                .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
            reviewTag: z
                .boolean(),
            requestedNumOfLQuizs: z
                .number()
                .min(1)
                .optional(),
            }
        )
    );
    return questionReqValidationSchema.parse(reqDTO);
};
//復習クイズデータランダム取得用　ユーザーの入力値　QuestionReqDTOのバリデーション関数
export function questionRandomReqValidate(reqDTO: dto.QuestionReqDTO){
    const questionRandomReqValidationSchema: z.ZodSchema<dto.QuestionReqDTO> = z.object(
        {
        lQuestionID: z
            .string()
            .uuid(),
        userID: z
            .string()
            .uuid(),
        sectionNumber: z
            .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
        reviewTag: z
            .boolean(),
        requestedNumOfLQuizs: z
            .number()
            .min(1)
            .optional(),
        }
    );
    return questionRandomReqValidationSchema.parse(reqDTO);
};

//ユーザーの入力値　UserAnswerReqDTOのバリデーション関数
export function userAnswerReqValidate(reqDTO: dto.UserAnswerReqDTO[]){
    const userAnswerReqValidationSchema: z.ZodSchema<dto.UserAnswerReqDTO[]> = z.array(
        z.object(
            {
            lQuestionID: z
                .string()
                .uuid(),
            userID: z
                .string()
                .uuid(),
            userAnswerOption: z
                .enum(["A", "B", "C", "D"]),
            answerDate: z
                .date(),
            reviewTag: z
                .boolean()
                .optional() //空も許可
            }
        )
    );
    return userAnswerReqValidationSchema.parse(reqDTO);
}

