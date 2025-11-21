import express from "express";
// import ChannelValidations from "../validators/channel.validator.mjs";
// import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  razorPayOrder,
  razorPayVerify,
} from "../controllers/payment.controller.mjs";
const WebhookRouter = express.Router();

WebhookRouter.post(
  "/payments/razorpay",
  express.raw({ type: "application/json" }),
  TokenHandler.authenticateToken,
  //   validate(ChannelValidations.create()),
  (req, res, next) => {
    const secret = "my_webhook_secret";

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body.toString())
      .digest("hex");

    if (signature === expectedSignature) {
      console.info("Webhook verified ✅");
      const event = JSON.parse(req.body);
      if (event.event === "payment.captured") {
        console.info("Payment captured:", event.payload.payment.entity.id);
        // Update DB: mark order as paid
      }
      res.status(200).send("OK");
    } else {
      res.status(400).send("Invalid signature");
    }
  }
);

WebhookRouter.post(
  "/razorpay/verify",
  TokenHandler.authenticateToken,
  //   validate(ChannelValidations.create()),
  razorPayVerify
);

export default WebhookRouter;
