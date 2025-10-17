import express from "express";
import CourierAWBListValidations from "../validators/courierAWBList.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
} from "../controllers/courierAWBList.controller.mjs";
const CourierAWBListRouter = express.Router();

CourierAWBListRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(CourierAWBListValidations.create()),
  create
);

CourierAWBListRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(CourierAWBListValidations.update()),
  update
);

CourierAWBListRouter.get("/", TokenHandler.authenticateToken, read);
CourierAWBListRouter.get("/:id", TokenHandler.authenticateToken, read);
CourierAWBListRouter.delete("/:id", TokenHandler.authenticateToken, remove);

export default CourierAWBListRouter;
