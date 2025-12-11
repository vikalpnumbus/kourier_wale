import express from "express";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  read,
} from "../controllers/weightReco.controller.mjs";
const WeightRecoRouter = express.Router();


// WeightRecoRouter.patch("/accept", TokenHandler.authenticateToken, accept);
WeightRecoRouter.get("/", TokenHandler.authenticateToken, read);
WeightRecoRouter.get("/:id", TokenHandler.authenticateToken, read);

export default WeightRecoRouter;
