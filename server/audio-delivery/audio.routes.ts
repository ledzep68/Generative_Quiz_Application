import express from "express";
import audioDeliveryController from "./audio.controllers.ts";

const audioRouter = express.Router();

//audioデータ配信（一個ずつ）
//URL: http://localhost:3000/audio/question/${lQuestionId}
audioRouter.get('/question/:lQuestionId', audioDeliveryController);

export default audioRouter;