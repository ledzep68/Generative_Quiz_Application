/*********************************************

userservice.tsの機能:
    ・controllersへのビジネスロジックの提供
    ・データオブジェクトの整合性チェックのためのバリデーション（カスタムバリデーション）

*********************************************/

import crypto, {randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBRelease, userDBDisconnect } from "./usermodels.js";
import { PoolClient } from "pg";
import { UserDTO } from "./userdto.js";
import * as userbusinesserrors from "./errors/userbusinesserrors.js";

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
export async function userDataRegister(client: PoolClient, userDTO: UserDTO): Promise<boolean> {
    const userId = userDTO.userId;
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    try{
        if(typeof userId === 'string' && typeof username === 'string' && typeof hashedpassword === 'string'){
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
export async function userLogin(client: PoolClient, userDTO: UserDTO): Promise<boolean> {
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    try{
        if(typeof username === 'string' && typeof hashedpassword === 'string') {
            const Result = await userDBLoginDataExtract(client, userDTO)
            return Result.rows.length !== 0 ? true : false; //trueならログイン成功, falseならログイン失敗
        } else {
            throw new userbusinesserrors.ValidationError("usernameかhashedpasswordがstring型ではありません");
        }
    } catch (error) {
        throw error
    } finally {
        await userDBRelease(client);
    }      
};