//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import Express from "express";
import * as controller from "./lquizcontrollers.js";

const lQuizRouter = Express.Router();

//問題生成処理
lQuizRouter.post("/generate", controller.generateQuestionController);

//回答処理
lQuizRouter.post("/answer", controller.answerController);

export default lQuizRouter;