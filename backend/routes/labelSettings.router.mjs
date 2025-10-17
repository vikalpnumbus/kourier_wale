import express from "express";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import LabelSettingsValidations from "../validators/labelSettings.validator.mjs";
import validate from "../middlewares/validator.mjs";
import { create, generate } from "../controllers/labelSettings.controller.mjs";
const LabelSettingsRouter = express.Router();

LabelSettingsRouter.post(
  "/create",
  TokenHandler.authenticateToken,
  validate(LabelSettingsValidations.create()),
  create
);
LabelSettingsRouter.post("/generate", TokenHandler.authenticateToken, generate);

export default LabelSettingsRouter;
