import Razorpay from "razorpay";
import crypto from "crypto";
import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from "../../../configurations/base.config.mjs";

class Provider {
  constructor() {
    this.error = null;
    this.razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  async order(amount) {
    try {
      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await this.razorpayInstance.orders.create(options);
      return { status: 200, data: order };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }

  async verify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    try {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        throw new Error("Error occured in capturing the payment.");
      }
      const payment = await this.razorpayInstance.payments.fetch(
        razorpay_payment_id
      );

      return {
        status: 200,
        data: {
          message: "Payment done successfully.",
          amount: payment.amount / 100,
          currency: payment.currency,
        },
      };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }
}

const RazorPayProvider = new Provider();
export default RazorPayProvider;
