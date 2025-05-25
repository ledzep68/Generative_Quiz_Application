import Express,  { Request, Response } from "express";
import { userPasswordEncrypt, userIdGenerate, userDataRegister, userDBConnect, userLogin } from "./userservice";
import { UserDTO } from "./userdto";

//ユーザー新規登録処理
export function userregistercontroller(req: Request, res: Response) {
    //引数：reqのbody中とユーザー名とパスワード 
    //戻り値：無し
    //子モジュール：userdataregister userdataencrypt userIdgenerate
    //ユーザー名とパスワードをPOSTrequestのメッセージヘッダのボディから取得
    //ユーザーIDをuserIdgenerateモジュールで自動生成
    //パスワードはuserdataencryptモジュールでハッシュ化しDBに登録
        //ハッシュアルゴリズム cryptoモジュールを使用し、SHA-256アルゴリズムを使用してハッシュ化
    //userdatarecordにユーザーIDとハッシュ化パスワードを渡してDB登録
    //userIdduplicatedetection モジュールを使用し、ユーザーIDの重複を検出

    const { username, password } = req.body;

    //未入力エラー処理
    if(!username || !password) {
        return res.status(400).send('IDまたはパスワードを入力してください')
    };

    //ユーザーID生成
    const userId = userIdGenerate();

    //UserDTOにマッピング
    const userDTO = new UserDTO(userId, username, password);

    //passwordをハッシュ化
    if(userDTO.password !== undefined){
        const hashedpassword = userPasswordEncrypt(userDTO.password);
        userDTO.hashedpassword = hashedpassword;
    };

    //DB接続　poolからコネクションを払い出す
    userDBConnect();

    //ユーザー新規登録処理
    userDataRegister(userDTO)
    .then(() => {
        return res.status(200).send('登録完了')
    })
    .catch(() => {
        return res.status(400).send('登録失敗')
    })
}

//ログイン処理
export function userLoginController(req: Request, res: Response) {

    const { username, password } = req.body;

    //未入力エラー処理
    if(!username || !password) {
        return res.status(400).send('IDまたはパスワードを入力してください')
    };

    //UserDTOにマッピング
    const userDTO = new UserDTO(username, password);

    //passwordをハッシュ化
    if(userDTO.password !== undefined){
        const hashedpassword = userPasswordEncrypt(userDTO.password);
        userDTO.hashedpassword = hashedpassword;
    };

    //db接続　poolからコネクションを払い出す
    userDBConnect();

    /*ログイン処理 true or falseを返す
    loginresultがtrueならログイン成功 falseならログイン失敗*/
    const loginresult = userLogin(userDTO);
    loginresult
    .then((loginresult) => { 
        return loginresult === true ? 
        res.status(200).send('ログイン成功') 
        : res.status(400).send('ログイン失敗 ユーザー名またはパスワードが正しくありません')})
    .catch((loginresult) => {
        return loginresult === false ? 
        res.status(400).send('ログイン失敗 ユーザー名またはパスワードが正しくありません')
        : res.status(400).send('ログイン失敗')})
}
