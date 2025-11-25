import express from "express";
import PricingCardValidations from "../validators/pricingCard.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  priceCalculator,
} from "../controllers/pricingCard.controller.mjs";
const PricingCardRouter = express.Router();

PricingCardRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(PricingCardValidations.create()),
  create
);

PricingCardRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(PricingCardValidations.update()),
  update
);

PricingCardRouter.get("/", TokenHandler.authenticateToken, read);
PricingCardRouter.get("/:id", TokenHandler.authenticateToken, read);
PricingCardRouter.delete("/:id", TokenHandler.authenticateToken, remove);

PricingCardRouter.post(
  "/calculate",
  TokenHandler.authenticateToken,
  validate(PricingCardValidations.priceCalculator()),
  priceCalculator
);

export default PricingCardRouter;
