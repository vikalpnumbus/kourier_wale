import express from "express";
import CourierValidations from "../validators/courier.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
} from "../controllers/courier.controller.mjs";
const CourierRouter = express.Router();

CourierRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(CourierValidations.create()),
  create
);

CourierRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(CourierValidations.update()),
  update
);

CourierRouter.get("/", TokenHandler.authenticateToken, read);
CourierRouter.get("/:id", TokenHandler.authenticateToken, read);
CourierRouter.delete("/:id", TokenHandler.authenticateToken, remove);

export default CourierRouter;
