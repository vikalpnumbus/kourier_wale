import express from "express";
import WarehouseValidations from "../validators/warehouse.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  bulkImport,
} from "../controllers/warehouse.controller.mjs";
import upload from "../middlewares/multer.mjs";
import FileValidator from "../validators/file.validator.mjs";
const WarehouseRouter = express.Router();

WarehouseRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(WarehouseValidations.create()),
  create
);

WarehouseRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(WarehouseValidations.update()),
  update
);

WarehouseRouter.get("/", TokenHandler.authenticateToken, read);
WarehouseRouter.get("/:id", TokenHandler.authenticateToken, read);
WarehouseRouter.delete("/:id", TokenHandler.authenticateToken, remove);

WarehouseRouter.post(
  "/bulk-import",
  TokenHandler.authenticateToken,
  upload.any(),
  FileValidator.validate,
  bulkImport
);

export default WarehouseRouter;
