/*********************************************

usercontrollers.tsの機能:
    ・ユーザーの新規登録とログイン処理の実行（ビジネスロジックのオーケストレーション）
    ・入力されたHTTPリクエストのバリデーション（zod）

*********************************************/

import { Request, Response } from "express";
import { userPasswordEncrypt, userIdGenerate, userDataRegister, userDBConnect, userLogin, initializeUserSession } from "./user.service.ts";
import * as dto from "./user.dto.ts";
import { UserData } from "./user.domeinobject.ts";
import { UserResponses } from "./user.response.ts";
import { userRegisterBusinessErrorHandler, userLoginBusinessErrorHandler } from "./errors/errorhandlers.ts";
import * as userschema from "./user.schema.ts";
import { z } from "zod";

//ユーザー新規登録処理
export async function userRegisterController(req: Request, res: Response): Promise<void> {
    try{
        const registerReqDTO = req.body;

        //バリデーション 失敗時z.ZodErrorをthrow
        const validatedData = userschema.UserRegisterValidationSchema.parse(registerReqDTO);

        //invitaionCodeを確認（管理者）
        const invitationCode = validatedData.invitaionCode

        //passwordをハッシュ化　失敗時ValidationErrorをthrow
        const hashedPassword = userPasswordEncrypt(validatedData.password);

        //ユーザーID生成
        const userId = userIdGenerate();

        //ドメインオブジェクトにマッピング
        const userData = {userName: validatedData.userName, hashedPassword: hashedPassword} as UserData;
    
        //DB接続　poolからコネクションを払い出す
        const client = await userDBConnect(); //失敗時DBCOnnectErrorをthrow
        //ユーザー新規登録
        const result = await userDataRegister(client, userData) //失敗時DBOperationError OR ValidationErrorをthrow
        res.status(200).json(UserResponses.USER_REGISTER_SUCCESS);
        console.log("ユーザー新規登録成功");

        //セッション開始・初期化
        await initializeUserSession(userId, req.session);

        return;
    } catch (error) {
        if(error instanceof z.ZodError){ //入力値のバリデーション
            console.log("入力値のバリデーションエラー:", error.issues)
            res.status(UserResponses.VALIDATION_FAILED.status).json({
                ...UserResponses.VALIDATION_FAILED,
                details: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
            return;
        } else { //ビジネスロジックのエラー
            const { response } = userRegisterBusinessErrorHandler(error as Error);
            console.log("ビジネスロジックエラー:", response);
            res.status(response.status).json(response);
            return;
        }
    }    
};

//ログイン処理
export async function userLoginController(req: Request, res: Response): Promise<void> {
    try{
        const loginReqDTO = req.body;
        console.log('loginReqDTO: ', loginReqDTO);

        //バリデーション
        const validatedData = userschema.UserLoginValidationSchema.parse(loginReqDTO); //失敗時z.ZodErrorをthrow

        //passwordをハッシュ化
        const hashedPassword = userPasswordEncrypt(validatedData.password); //失敗時ValidationErrorをthrow

        //ドメインオブジェクトにマッピング
        const userData = {userName: validatedData.userName, hashedPassword: hashedPassword} as UserData;

        //db接続　poolからコネクションを払い出す
        const client = await userDBConnect(); //失敗時DBCOnnectErrorをthrow
        console.log("client: ", client);

        //ログイン処理
        const loginResult = await userLogin(client, userData); //DB操作失敗時DBOperationError OR ValidationErrorをthrow
        loginResult.loginResult === true ? 
            res.status(UserResponses.LOGIN_SUCCESS.status /*200*/).json(UserResponses.LOGIN_SUCCESS)
            : res.status(UserResponses.LOGIN_FAILED.status /*401*/).json(UserResponses.LOGIN_FAILED);
        console.log("ログイン判定処理が適切に完了");

        //セッション開始・初期化
        await initializeUserSession(loginResult.userId, req.session);

        return;
    } catch (error) {
        if(error instanceof z.ZodError){ //入力値のバリデーション
            console.log("入力値のバリデーションエラー:", error.issues)
            res.status(UserResponses.VALIDATION_FAILED.status/*400*/).json({
                ...UserResponses.VALIDATION_FAILED,
                details: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        } else { //ビジネスロジックのエラー
            const { response } = userLoginBusinessErrorHandler(error as Error);
            console.log("ビジネスロジックエラー:", response);
            res.status(response.status).json(response);
        }
    };
}

//ユーザー情報消去処理