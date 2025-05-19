//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import Express from "express";
import * as usercontrollers from "./controllers";

const usersrouter = Express.Router();

//ユーザー新規登録処理
//usersrouter.post("/register", usercontrollers.userregister);

//ユーザーログイン処理
//usersrouter.post("/login", usercontrollers.userlogin);



export default usersrouter;