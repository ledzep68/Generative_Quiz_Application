import {z} from "zod";
import * as dto from "../lquiz.dto.js";
//新規クイズリクエスト用データ　バリデーション関数　非配列
export function randomNewQuestionReqValidate(reqDTO: dto.RandomNewQuestionReqDTO){
    const randomNewQuestionReqValidationSchema: z.ZodSchema<dto.RandomNewQuestionReqDTO> = z.object(
            {
            sectionNumber: z
                .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
            requestedNumOfLQuizs: z
                .number(),
            speakingRate: z
                .number()
            }
    );
    return randomNewQuestionReqValidationSchema.parse(reqDTO);
};

//復習クイズデータID指定取得用　ユーザーの入力値　QuestionReqDTO[]のバリデーション関数　配列
export function questionReqValidate(reqDTO: dto.ReviewQuestionReqDTO){
    const questionReqValidationSchema: z.ZodSchema<dto.ReviewQuestionReqDTO[]> = z.array(
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
                .boolean()
            }
        )
    );
    return questionReqValidationSchema.parse(reqDTO);
};
//復習クイズデータランダム取得用　ユーザーの入力値　QuestionReqDTOのバリデーション関数　非配列
export function randomQuestionReqValidate(reqDTO: dto.RandomReviewQuestionReqDTO){
    const questionRandomReqValidationSchema: z.ZodSchema<dto.RandomReviewQuestionReqDTO> = z.object(
        {
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

