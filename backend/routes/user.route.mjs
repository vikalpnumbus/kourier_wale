import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  save1,
  save2,
  handleTokenCallback,
  resendOTP,
} from "../controllers/user.controller.mjs";
import UserValidations from "../validators/user.validator.mjs";
import validate from "../middlewares/validator.mjs";
const UserRouter = express.Router();

UserRouter.post("/register/step1", validate(UserValidations.save1()), save1);
UserRouter.post("/register/step2", validate(UserValidations.save2()), save2);
UserRouter.post("/login", validate(UserValidations.login()), login);
UserRouter.get("/get-token", handleTokenCallback);
UserRouter.post("/resend-otp", resendOTP);

UserRouter.post(
  "/forgot-password",
  validate(UserValidations.forgotPassword()),
  forgotPassword
);
UserRouter.post(
  "/reset-password/:token",
  validate(UserValidations.resetPassword()),
  resetPassword
);

export default UserRouter;
