import {z} from "zod";

export const UserRegisterValidationSchema = z.object({
    userName: z
        .string()
        .min(5, "ユーザー名は5文字以上にしてください")
        .max(20, "ユーザー名は20文字以内にしてください")
        .regex(/^[a-zA-Z0-9]+$/, "ユーザー名は半角英数字のみ入力してください")
        .trim(),
    password: z
        .string()
        .min(5, "パスワードは8文字以上にしてください")
        .max(20, "パスワードは20文字以内にしてください")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/, "パスワードは半角英数字の中から大文字、小文字、数字を1種類以上含めてください")
        .trim(),
    invitaionCode: z
        .string()
        .trim()
});

export const UserLoginValidationSchema = z.object({
    userName: z
        .string()
        .min(5, "ユーザー名は5文字以上にしてください")
        .max(20, "ユーザー名は20文字以内にしてください")
        .regex(/^[a-zA-Z0-9]+$/, "ユーザー名は半角英数字のみ入力してください")
        .trim(),
    password: z
        .string()
        .min(5, "パスワードは8文字以上にしてください")
        .max(20, "パスワードは20文字以内にしてください")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/, "パスワードは半角英数字の中から大文字、小文字、数字を1種類以上含めてください")
        .trim()
});