import express from "express";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import { create, read } from "../controllers/weightReco.controller.mjs";
import upload from "../middlewares/multer.mjs";
import FileValidator from "../validators/file.validator.mjs";
const WeightRecoRouter = express.Router();

WeightRecoRouter.post("/", TokenHandler.authenticateToken, upload.any(), FileValidator.validate, create);
WeightRecoRouter.get("/", TokenHandler.authenticateToken, read);
WeightRecoRouter.get("/:id", TokenHandler.authenticateToken, read);

export default WeightRecoRouter;
