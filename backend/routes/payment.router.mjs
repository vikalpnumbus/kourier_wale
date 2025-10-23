import express from "express";
// import ChannelValidations from "../validators/channel.validator.mjs";
// import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  razorPayOrder,
  razorPayVerify,
} from "../controllers/payment.controller.mjs";
const PaymentRouter = express.Router();

PaymentRouter.post(
  "/razorpay/order",
  TokenHandler.authenticateToken,
  //   validate(ChannelValidations.create()),
  razorPayOrder
);

PaymentRouter.post(
  "/razorpay/verify",
  TokenHandler.authenticateToken,
  //   validate(ChannelValidations.create()),
  razorPayVerify
);

export default PaymentRouter;
