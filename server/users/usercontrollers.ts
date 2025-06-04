import { Request, Response } from "express";
import { userPasswordEncrypt, userIdGenerate, userDataRegister, userDBConnect, userLogin } from "./userservice";
import { UserDTO } from "./userdto";

//ユーザー新規登録処理
export async function userRegisterController(req: Request, res: Response): Promise<void> {
    //引数：reqのbody中とユーザー名とパスワード 
    //戻り値：無し
    //子モジュール：userdataregister userdataencrypt userIdgenerate
    //ユーザー名とパスワードをPOSTrequestのメッセージヘッダのボディから取得
    //ユーザーIDをuserIdgenerateモジュールで自動生成
    //パスワードはuserdataencryptモジュールでハッシュ化しDBに登録
        //ハッシュアルゴリズム cryptoモジュールを使用し、SHA-256アルゴリズムを使用してハッシュ化
    //userdatarecordにユーザーIDとハッシュ化パスワードを渡してDB登録
    //userIdduplicatedetection モジュールを使用し、ユーザーIDの重複を検出

    try{
        const { username, password } = req.body;

        //バリデーション
        if(typeof username!=='string' && password!=='string') {
            res.status(400).send('無効な入力形式です');
            return;
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

        //DB接続　poolからコネクションを払い出してデータ登録
        const client = await userDBConnect();
        const result = await userDataRegister(client, userDTO)
        result === void 0 ?
            res.status(200).send('登録完了') 
            : res.status(400).send('登録失敗');
        return;
    } catch(error) {
        console.log(error);
        res.status(500).send('登録失敗 サーバーエラー');
        return;
    }
        
};

//ログイン処理
export async function userLoginController(req: Request, res: Response): Promise<void> {
    try{
        const { username, password } = req.body;

        //バリデーション
        if(typeof username!=='string' && password!=='string') {
            res.status(400).send('無効な入力形式です');
            return;
        };

        //UserDTOにマッピング
        const userDTO = new UserDTO(username, password);

        //passwordをハッシュ化
        if(userDTO.password !== undefined){
            const hashedpassword = userPasswordEncrypt(userDTO.password);
            userDTO.hashedpassword = hashedpassword;
        };

        //db接続　poolからコネクションを払い出す
        const client = await userDBConnect();

        /*ログイン処理 true or falseを返す
        loginresultがtrueならログイン成功 falseならログイン失敗*/
        const loginresult = await userLogin(client, userDTO);
        loginresult === true ? 
            res.status(200).json({message:'ログイン成功'}) 
            : res.status(400).json({message:'ログイン失敗 ユーザー名またはパスワードが正しくありません'});
            console.log(loginresult);
        return;
    } catch (error) {
            console.log(error);
            res.status(500).json({error:'ログイン失敗', message: 'ログイン失敗 サーバーエラー'});
        return;
    };
}
