import { check } from "express-validator";

class Validation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new Validation("create").rules();
  }

  verify() {
    return new Validation("create").verifyRules();
  }

  rules() {
    return [this.numericStringValidator("amount", "Amount")];
  }

  verifyRules() {
    return [
      this.stringValidator("razorpay_order_id", "razorpay_order_id"),
      this.stringValidator("razorpay_payment_id", "razorpay_payment_id"),
      this.stringValidator("razorpay_signature", "razorpay_signature"),
    ];
  }

  // ----- Utility Validators -----

  fieldCheck(field, label) {
    let validator = check(field);
    if (this.mode === "update") {
      return validator
        .optional()
        .bail()
        .exists({ checkFalsy: true })
        .withMessage(`${label} is required.`)
        .bail();
    } else {
      return validator
        .exists({ checkFalsy: true })
        .withMessage(`${label} is required.`)
        .bail();
    }
  }

  numericStringValidator(field, label) {
    return this.fieldCheck(field, label)
      .matches(/^\d+(\.\d{1,2})?$/)
      .withMessage(
        `${label} must be a numeric string (e.g. "100" or "99.99").`
      );
  }

  stringValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 300 })
      .withMessage(`${label} can be maximum 300 characters long.`);
  }
}

const RazorPayPaymentValidations = new Validation();
export default RazorPayPaymentValidations;
