import express from "express";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  conversation_create,
  conversation_read,
  create,
  read,
} from "../controllers/escalation.controller.mjs";
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
EscalationRouter.post(
  "/conversations",
  upload.any(),
  TokenHandler.authenticateToken,
  conversation_create
);
EscalationRouter.get(
  "/conversations",
  TokenHandler.authenticateToken,
  conversation_read
);
EscalationRouter.get(
  "/conversations/:id",
  TokenHandler.authenticateToken,
  conversation_read
);

EscalationRouter.get("/", TokenHandler.authenticateToken, read);
EscalationRouter.get("/:id", TokenHandler.authenticateToken, read);

export default EscalationRouter;
