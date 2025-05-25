import Express from "express";
import crypto, {randomUUID} from "crypto";
import { userDBGetConnect, userDBNewDataRecord, userDBLoginDataExtract, userDBDisconnect } from "./usermodels";
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
export function userDBConnect() {
    userDBGetConnect()
    .then((client) => {
        return client
    })
    .catch((err) => {
        userDBDisconnect();
        return err
    });
};


//ユーザー新規登録
export function userDataRegister(userDTO: UserDTO): Promise<void> {
    const userId = userDTO.userId;
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    return userId !== undefined && username !== undefined && hashedpassword !== undefined ?
        userDBNewDataRecord(userId, username, hashedpassword)
        .then(() => {
        })
        :Promise.reject()
};

//ログイン処理
export function userLogin(userDTO: UserDTO): Promise<boolean> {
    const username = userDTO.username;
    const hashedpassword = userDTO.hashedpassword;
    if(username !== undefined && hashedpassword !== undefined) {
        userDBLoginDataExtract(username, hashedpassword)
        .then((result) => {
            return result !== null ? true : false
        }),
        userDBDisconnect();
        return Promise.reject(false);
    };
    return Promise.reject(false);
};