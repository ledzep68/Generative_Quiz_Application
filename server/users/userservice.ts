import crypto, {randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBRelease, userDBDisconnect } from "./usermodels";
import { PoolClient } from "pg";
import { UserDTO } from "./userdto";
import { error } from "console";

//ユーザーIDの生成
export function userIdGenerate(){
    const userId = randomUUID();
    return userId
};

//パスワードのハッシュ化
export function userPasswordEncrypt(password: string) {
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    return hashedPassword
};

//データベースへの接続　？
export async function userDBConnect(): Promise<PoolClient> {
    try{
        return await userDBGetConnect()
    } catch (error) {
        console.log("DB接続エラー", error);
        throw new Error(`DB接続に失敗しました`);
    };
};


//ユーザー新規登録
export async function userDataRegister(client: PoolClient, userDTO: UserDTO): Promise<void> {
    const userId = userDTO.userId;
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    if(userId !== undefined && username !== undefined && hashedpassword !== undefined){
        try{
            await userDBNewDataRecord(client, userDTO);
        } catch (error) {
            console.log("DB登録エラー", error);
            throw new Error(`DB登録に失敗しました`);
        } finally {
            await userDBRelease(client);
        }
    } else {
        await userDBRelease(client);
        throw new Error(`不明なエラー`);
    }
};

//ログイン処理
export async function userLogin(client: PoolClient, userDTO: UserDTO): Promise<boolean> {
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    if(username !== undefined && hashedpassword !== undefined) {
        try{
            const Result = await userDBLoginDataExtract(client, userDTO)
            return Result.rows.length !== 0 ? true : false; //trueならログイン成功, falseならログイン失敗
        } catch (error) {
            console.log("DB接続エラー", error);
            await userDBRelease(client);
            throw new Error(`DB接続に失敗しました`);
        }
    } else {
        await userDBRelease(client);
        throw new Error(`不明なエラー`); //ユーザデータがundifinedの場合
    }
            
};