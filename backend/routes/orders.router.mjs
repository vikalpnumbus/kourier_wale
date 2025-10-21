import express from "express";
import OrdersValidations from "../validators/orders.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  bulkImport,
  bulkExport,
  cancelOrder,
} from "../controllers/orders.controller.mjs";
import upload from "../middlewares/multer.mjs";
import FileValidator from "../validators/file.validator.mjs";
const OrdersRouter = express.Router();

OrdersRouter.post("/bulk-export", TokenHandler.authenticateToken, bulkExport);
OrdersRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(OrdersValidations.create()),
  create
);

OrdersRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(OrdersValidations.update()),
  update
);

OrdersRouter.get("/", TokenHandler.authenticateToken, read);
OrdersRouter.get("/:id", TokenHandler.authenticateToken, read);
OrdersRouter.delete("/:id", TokenHandler.authenticateToken, remove);

OrdersRouter.post(
  "/bulk-import",
  TokenHandler.authenticateToken,
  upload.any(),
  FileValidator.validate,
  bulkImport
);

OrdersRouter.post("/cancel/:id", TokenHandler.authenticateToken, cancelOrder);

export default OrdersRouter;
