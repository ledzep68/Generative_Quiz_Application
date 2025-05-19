import Express from "express";
//impoet {} from './usermodels'

//ユーザー新規登録処理
export function userregister() {
    //引数：reqのbody中のIDとパスワード 
    //戻り値：無し
    //子モジュール：usernewdatarecord userdataencrypt
    //ユーザーIDとパスワードをPOSTrequestのメッセージヘッダのボディから取得
    //パスワードはuserdataencryptモジュールでハッシュ化しDBに登録
        //ハッシュアルゴリズム cryptoモジュールを使用し、SHA-256アルゴリズムを使用してハッシュ化
    //usernewdatarecordにユーザーIDとハッシュ化パスワードを渡してDB登録
    return null
}

//ログイン処理
export function userlogin() {
    //ユーザーIDを取得
    return null
}

export function usersController() {
    return null
}