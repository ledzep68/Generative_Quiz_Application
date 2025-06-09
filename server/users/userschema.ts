import {z} from "zod";

export const UserRegisterValidationSchema = z.object({
    userId: z
        .string()
        .uuid()
        .optional(), //undefinedも許可
    username: z
        .string()
        .min(5, "5文字以上にしてください")
        .max(20, "20文字以内にしてください")
        .regex(/^[a-zA-Z0-9]+$/, "半角英数字のみ入力してください")
        .trim(),
    password: z
        .string()
        .min(5, "8文字以上にしてください")
        .max(20, "20文字以内にしてください")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/, "半角英数字の中から大文字、小文字、数字を1種類以上含めてください")
        .trim(),
    hashedpassword: z
        .string()
        .optional() //undefinedも許可
});

export const UserLoginValidationSchema = z.object({
    username: z
        .string()
        .min(5, "5文字以上にしてください")
        .max(20, "20文字以内にしてください")
        .regex(/^[a-zA-Z0-9]+$/, "半角英数字のみ入力してください")
        .trim(),
    password: z
        .string()
        .min(5, "8文字以上にしてください")
        .max(20, "20文字以内にしてください")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/, "半角英数字の中から大文字、小文字、数字を1種類以上含めてください")
        .trim()
});