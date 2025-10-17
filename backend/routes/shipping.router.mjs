import express from "express";
import ShippingValidations from "../validators/shipping.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  handleCancelShipment,
  shippingChargesRead,
} from "../controllers/shipping.controller.mjs";
const ShippingRouter = express.Router();

ShippingRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(ShippingValidations.create()),
  create
);

ShippingRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(ShippingValidations.update()),
  update
);

ShippingRouter.get(
  "/shipping-charges",
  TokenHandler.authenticateToken,
  shippingChargesRead
);
ShippingRouter.get("/", TokenHandler.authenticateToken, read);
ShippingRouter.get("/:id", TokenHandler.authenticateToken, read);

ShippingRouter.delete("/:id", TokenHandler.authenticateToken, remove);
ShippingRouter.post(
  "/cancelShipment",
  TokenHandler.authenticateToken,
  validate(ShippingValidations.cancel()),
  handleCancelShipment
);

export default ShippingRouter;
