//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import express from "express";
import {userLoginController, userRegisterController, resetUserAndQuizSessionController} from "./user.controllers.ts";

const UsersRouter = express.Router();

//ユーザー新規登録処理
//URL: http://localhost:3000/api/auth/register
UsersRouter.post("/register", userRegisterController);

//ユーザーログイン処理
//URL: http://localhost:3000/api/auth/login
UsersRouter.post("/login", userLoginController);

//セッション終了処理
//URL: http://localhost:3000/api/auth/reset-user-and-quiz-session
UsersRouter.post("/reset-user-and-quiz-session", resetUserAndQuizSessionController);

export default UsersRouter;