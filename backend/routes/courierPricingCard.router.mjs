import express from "express";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
} from "../controllers/courierPricingCard.controller.mjs";
import CourierPricingCardValidation from "../validators/courierPricingCard.validator.mjs";
const CourierPricingCardRouter = express.Router();

CourierPricingCardRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(CourierPricingCardValidation.create()),
  create
);

CourierPricingCardRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(CourierPricingCardValidation.update()),
  update
);

CourierPricingCardRouter.get("/", TokenHandler.authenticateToken, read);
CourierPricingCardRouter.get("/:id", TokenHandler.authenticateToken, read);
CourierPricingCardRouter.delete("/:id", TokenHandler.authenticateToken, remove);

export default CourierPricingCardRouter;
