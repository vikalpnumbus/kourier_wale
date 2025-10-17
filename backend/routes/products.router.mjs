import express from "express";
import ProductsValidations from "../validators/products.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  bulkImport,
} from "../controllers/products.controller.mjs";
import upload from "../middlewares/multer.mjs";
import ImageValidator from "../validators/image.validator.mjs";
import FileValidator from "../validators/file.validator.mjs";
const ProductsRouter = express.Router();

ProductsRouter.post(
  "/",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(ProductsValidations.create()),
  create
);

ProductsRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  upload.any(),
  ImageValidator.validate,
  validate(ProductsValidations.update()),
  update
);

ProductsRouter.get("/", TokenHandler.authenticateToken, read);
ProductsRouter.get("/:id", TokenHandler.authenticateToken, read);
ProductsRouter.delete("/:id", TokenHandler.authenticateToken, remove);

ProductsRouter.post(
  "/bulk-import",
  TokenHandler.authenticateToken,
  upload.any(),
  FileValidator.validate,
  bulkImport
);

export default ProductsRouter;
