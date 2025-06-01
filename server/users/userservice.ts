import Express from "express";
import crypto, {randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBRelease, userDBDisconnect } from "./usermodels";
import { PoolClient, QueryResult } from "pg";
import { UserDTO } from "./userdto";

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
export function userDBConnect(): Promise<PoolClient> {
    return userDBGetConnect()
    .then((client) => {
        return client
    })
    .catch((error) => {
        console.log(error);
        return Promise.reject(new Error("DB接続に失敗しました"));
    });
};


//ユーザー新規登録
export function userDataRegister(client: PoolClient, userDTO: UserDTO): Promise<void> {
    const userId = userDTO.userId;
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    if(userId !== undefined && username !== undefined && hashedpassword !== undefined){
        return userDBNewDataRecord(client, userDTO)
            .then(() => {
                userDBRelease(client);
                //.then()の戻り値はPromise<void>
            })
            .catch(() =>{
                userDBRelease(client);
                throw new Error("DB登録に失敗しました");
            })
        } else {
        return Promise.reject(new Error("不明なエラー"));
        }
};

//ログイン処理
export function userLogin(client: PoolClient, userDTO: UserDTO): Promise<boolean> {
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    if(username !== undefined && hashedpassword !== undefined) {
        return userDBLoginDataExtract(client, userDTO)
            .then((result) => { //正しくDBからデータ取得が行われた場合の処理
                return result.rows.length !== 0 ? true : false; //trueならログイン成功, falseならログイン失敗
            })
            .catch(() => {
                throw new Error("DB接続に失敗しました");
            });
    } else {
        return Promise.reject(new Error("不明なエラー")); //ユーザデータがundifinedの場合
    }
            
};