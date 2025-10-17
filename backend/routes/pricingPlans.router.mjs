import express from "express";
import PricingPlansValidations from "../validators/pricingPlans.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
} from "../controllers/pricingPlans.controller.mjs";
const PricingPlansRouter = express.Router();

PricingPlansRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(PricingPlansValidations.create()),
  create
);

PricingPlansRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(PricingPlansValidations.update()),
  update
);

PricingPlansRouter.get("/", TokenHandler.authenticateToken, read);
PricingPlansRouter.get("/:id", TokenHandler.authenticateToken, read);
PricingPlansRouter.delete("/:id", TokenHandler.authenticateToken, remove);

export default PricingPlansRouter;
