import express from "express";
import UserCourierValidation from "../validators/userCourier.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  bulkImport,
} from "../controllers/serviceablePincodes.controller.mjs";
import upload from "../middlewares/multer.mjs";
import FileValidator from "../validators/file.validator.mjs";
const ServiceablePincodesRouter = express.Router();

ServiceablePincodesRouter.post(
  "/",
  TokenHandler.authenticateToken,
  //   validate(UserCourierValidation.create()),
  create
);

ServiceablePincodesRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  //   validate(UserCourierValidation.update()),
  update
);

ServiceablePincodesRouter.get("/", TokenHandler.authenticateToken, read);
ServiceablePincodesRouter.get("/:id", TokenHandler.authenticateToken, read);
ServiceablePincodesRouter.delete(
  "/:id",
  TokenHandler.authenticateToken,
  remove
);
ServiceablePincodesRouter.post(
  "/bulk-import",
  TokenHandler.authenticateToken,
  upload.any(),
  FileValidator.validate,
  bulkImport
);

export default ServiceablePincodesRouter;
