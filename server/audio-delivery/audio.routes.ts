import express from "express";
import audioDeliveryController from "./audio.controllers.ts";

const audioRouter = express.Router();

//audioデータ配信（一個ずつ）
//URL: http://localhost:3000/api/audio/${questionHash}
audioRouter.get('/:questionHash', audioDeliveryController);

export default audioRouter;