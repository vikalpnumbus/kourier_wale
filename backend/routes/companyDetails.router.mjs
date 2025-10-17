import express from "express";
import CompanyDetailsValidations from "../validators/companyDetails.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import { create, view } from "../controllers/companyDetails.controller.mjs";
import upload from "../middlewares/multer.mjs";
import ImageValidator from "../validators/image.validator.mjs";
const CompanyDetailsRouter = express.Router();

CompanyDetailsRouter.post(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(CompanyDetailsValidations.create()),
  create
);

CompanyDetailsRouter.get("/", TokenHandler.authenticateToken, view);

export default CompanyDetailsRouter;
