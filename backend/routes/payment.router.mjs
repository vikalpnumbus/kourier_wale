import express from "express";
import RazorPayPaymentValidations from "../validators/razorpay.payment.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  razorPayOrder,
  razorPayVerify,
} from "../controllers/payment.controller.mjs";
const PaymentRouter = express.Router();

PaymentRouter.post(
  "/razorpay/order",
  TokenHandler.authenticateToken,
    validate(RazorPayPaymentValidations.create()),
  razorPayOrder
);

PaymentRouter.post(
  "/razorpay/verify",
  TokenHandler.authenticateToken,
    validate(RazorPayPaymentValidations.verify()),
  razorPayVerify
);

export default PaymentRouter;
