import express from "express";
import validate from "../middlewares/validator.mjs";
import { create, read, update } from "../controllers/kyc.controller.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import KYCValidations from "../validators/kyc.validator.mjs";
import upload from "../middlewares/multer.mjs";
import ImageValidator from "../validators/image.validator.mjs";
const KYCRouter = express.Router();

KYCRouter.post(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(KYCValidations.create()),
  create
);

KYCRouter.patch(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(KYCValidations.update()),
  update
);

KYCRouter.get("/", TokenHandler.authenticateToken, read);

export default KYCRouter;
