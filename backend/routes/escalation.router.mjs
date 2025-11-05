import express from "express";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import { create, read } from "../controllers/escalation.controller.mjs";
import upload from "../middlewares/multer.mjs";
import ImageValidator from "../validators/image.validator.mjs";
import EscalationValidations from "../validators/escalation.validator.mjs";
const EscalationRouter = express.Router();

EscalationRouter.post(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
    validate(EscalationValidations.create()),
  create
);

EscalationRouter.get("/", TokenHandler.authenticateToken, read);
EscalationRouter.get("/:id", TokenHandler.authenticateToken, read);

export default EscalationRouter;
