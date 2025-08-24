/*********************************************

userservice.tsの機能:
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）

*********************************************/

import crypto, {UUID, randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBRelease, userDBDisconnect } from "./usermodels.ts";
import { PoolClient } from "pg";
import { UserDTO } from "./userdto.ts";
import * as userbusinesserrors from "./errors/userbusinesserrors.ts";

//ユーザーIDの生成
export function userIdGenerate(){
    const userId = randomUUID();
    return userId
};

//パスワードのハッシュ化
export function userPasswordEncrypt(password: string) {
    if(typeof password === 'string') {
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
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
export async function userDataRegister(client: PoolClient, userDTO: UserDTO): Promise<boolean> {
    const userId = userDTO.userId;
    const userName = userDTO.userName;
    const hashedPassword = userDTO.hashedPassword;
    try{
        if(typeof userId === 'string' && typeof userName === 'string' && typeof hashedPassword === 'string'){
            await userDBNewDataRecord(client, userDTO);
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
export async function userLogin(client: PoolClient, userDTO: UserDTO): Promise<{userId: UUID, loginResult: boolean}> {
    const userName = userDTO.userName;
    const hashedPassword = userDTO.hashedPassword;
    try{
        if(typeof userName === 'string' && typeof hashedPassword === 'string') {
            const result = await userDBLoginDataExtract(client, userDTO)
            return {
                userId: result.rows[0].user_id,
                loginResult: result.rows.length !== 0 ? true : false //trueならログイン成功, falseならログイン失敗
            }; 
        } else {
            throw new userbusinesserrors.ValidationError("usernameかhashedpasswordがstring型ではありません");
        }
    } catch (error) {
        throw error
    } finally {
        await userDBRelease(client);
    }      
};

//セッション初期化・開始
export async function initializeUserSession(userId: UUID, session: Express.Request["session"]): Promise<void> {
    return new Promise((resolve, reject) => {
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
}