//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import express, { Request, Response, Router } from "express";
import Express from "express";
import {userLoginController, userRegisterController} from "./usercontrollers";

const usersRouter = express.Router();

//ユーザー新規登録処理
usersRouter.post("/register", userRegisterController);

//ユーザーログイン処理
usersRouter.post("/login", userLoginController);

export default usersRouter;