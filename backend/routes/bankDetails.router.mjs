import express from "express";
import BankDetailsValidations from "../validators/bankDetails.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  getBankDetails,
} from "../controllers/bankDetails.controller.mjs";
import upload from "../middlewares/multer.mjs";
import ImageValidator from "../validators/image.validator.mjs";
const BankDetailsRouter = express.Router();

BankDetailsRouter.post(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(BankDetailsValidations.create()),
  create
);

BankDetailsRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(BankDetailsValidations.update()),
  update
);

BankDetailsRouter.get("/", TokenHandler.authenticateToken, read);
BankDetailsRouter.get("/:id", TokenHandler.authenticateToken, read);

BankDetailsRouter.get(
  "/get-ifsc-details/:ifscCode",
  TokenHandler.authenticateToken,
  getBankDetails
);

export default BankDetailsRouter;
