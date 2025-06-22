import {z} from "zod";
import * as dto from "./lquiz.dto.js";

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

