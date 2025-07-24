//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import express from "express";
import {userLoginController, userRegisterController} from "./usercontrollers.ts";

const UsersRouter = express.Router();

//ユーザー新規登録処理
UsersRouter.post("/register", userRegisterController);

//ユーザーログイン処理
UsersRouter.post("/login", userLoginController);

export default UsersRouter;