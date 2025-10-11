/*********************************************

userservice.tsの機能:
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）

*********************************************/

import crypto, {UUID, hash, randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBRelease, userDBDisconnect } from "./user.models.js";
import { PoolClient } from "pg";
import { UserData } from "./user.domeinobject.js";
import * as userbusinesserrors from "./errors/user.businesserrors.js";

//ユーザーIDの生成
export function userIdGenerate(){
    const userId = randomUUID();
    return userId
};

//パスワードのハッシュ化
export function userPasswordEncrypt(password: string) {
    if(typeof password === 'string') {
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        console.log(hashedPassword)
        return hashedPassword
    } else {
        throw new userbusinesserrors.ValidationError("passwordがstring型ではありません");
    }
};

//データベースへの接続　？
export async function userDBConnect(): Promise<PoolClient> {
    return await userDBGetConnect()
};


//ユーザー新規登録
//管理者承認にしたい
export async function userDataRegister(client: PoolClient, domObj: UserData): Promise<boolean> {
    const userId = domObj.userId;
    const userName = domObj.userName;
    const hashedPassword = domObj.hashedPassword;
    try{
        if(typeof userId === 'string' && typeof userName === 'string' && typeof hashedPassword === 'string'){
            await userDBNewDataRecord(client, domObj);
            return true
        } else {
            throw new userbusinesserrors.ValidationError("userIdかusernameかhashedpasswordがstring型ではありません");
        }
    } catch (error) {
        throw error; //下位のDBエラーをそのまま出力
    } finally {
        await userDBRelease(client);
    }
};

//ログイン処理
export async function userLogin(client: PoolClient, domObj: UserData): Promise<{userId?: UUID, loginResult: boolean}> {
    const userName = domObj.userName;
    const hashedPassword = domObj.hashedPassword;
    try{
        const result = await userDBLoginDataExtract(client, domObj);
        console.log("result: ", result)
        return {
            userId: result.rows.length !== 0 ? result.rows[0].user_id : undefined,
            loginResult: result.rows.length !== 0 ? true : false //trueならログイン成功, falseならログイン失敗
        }; 
    } catch (error) {
        throw error
    } finally {
        await userDBRelease(client);
    }      
};

//セッション初期化・開始
export async function initializeUserSession(userId: UUID, session: Express.Request["session"]): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log("userId: ", userId);
        //セッション再生成（固定ID不可）
            session.regenerate((err) => {
            if (err) {
                console.error(`Session regeneration failed for user ${userId}:`, err);
                reject(new Error('Failed to regenerate session'));
                return;
            }
            
            //userId設定
            session.userId = userId; 
            //questionSetは初期化時点では未設定
            console.log("login時セッションobject: ", session);
            console.log("login時セッションID: ", session.id);
            console.log("login時セッションuserId: ", session.userId);
            
            //ログ出力
            console.info(`User session initialized: userId=${userId}, sessionId=${session.id}`);
            
            //セッション保存
            session.save((err) => {
                if (err) {
                    console.error(`Session save failed for user ${userId}:`, err);
                    reject(new Error('Failed to save session'));
                    return;
                }
                resolve();
            });
        });
    });
};