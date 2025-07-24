import express from "express";
import * as controller from "./audio.controllers.ts";

const audioRouter = express.Router();

//audioデータ配信（一個ずつ）
//URL: http://localhost:3000/audio/question/${lQuestionId}
audioRouter.get('/question/:lQuestionId', controller.audioDeliveryController);

export default audioRouter;