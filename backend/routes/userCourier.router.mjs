import express from "express";
import UserCourierValidation from "../validators/userCourier.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
} from "../controllers/userCourier.controller.mjs";
const UserCourierRouter = express.Router();

UserCourierRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(UserCourierValidation.create()),
  create
);

UserCourierRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(UserCourierValidation.update()),
  update
);

UserCourierRouter.get("/", TokenHandler.authenticateToken, read);
UserCourierRouter.get("/:id", TokenHandler.authenticateToken, read);
UserCourierRouter.delete("/:id", TokenHandler.authenticateToken, remove);

export default UserCourierRouter;
