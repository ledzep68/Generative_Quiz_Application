//APIのエンドポイントのみ定義。ロジックはcontrollersに委任
import Express from "express";
import * as controller from "./lquizcontrollers.js";

const lQuizRouter = Express.Router();

//セッション初期化処理
//URL: http://localhost:3000/api/lquiz/initialize-session
lQuizRouter.post("/initialize-quiz-session", controller.initializeQuizSessionController);

//セッション終了処理
//URL: http://localhost:3000/api/lquiz/reset-session
lQuizRouter.post("/reset-quiz-session", controller.resetQuizSessionController);

//問題生成処理
//Part1 URL: http://localhost:3000/api/lquiz/new-quiz-generate-1
//未実装
//Part2 URL: http://localhost:3000/api/lquiz/new-quiz-generate-2
lQuizRouter.post("/new-quiz-generate-2", controller.generatePart2LQuizController);
//Part3,4 URL: http://localhost:3000/api/lquiz/new-quiz-generate-2
lQuizRouter.post("/new-quiz-generate-3or4", controller.generatePart34LQuizController);

//回答処理
//URL: http://localhost:3000/api/lquiz/answer
lQuizRouter.post("/answer", controller.answerController);

export default lQuizRouter;