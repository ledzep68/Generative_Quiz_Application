import express from "express";
import * as controller from "./audio.controllers.js";

const audioRouter = express.Router();

//audioデータ配信（一個ずつ）
audioRouter.get('/question/:questionId', controller.audioDeliveryController);

export default audioRouter;