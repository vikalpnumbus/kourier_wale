import { check } from "express-validator";

class PricingPlansValidation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new PricingPlansValidation("create").rules();
  }

  update() {
    return new PricingPlansValidation("update").rules();
  }

  rules() {
    return [
      this.numericStringValidator("plan_id", "Plan ID"),
      this.numericStringValidator("courier_id", "Courier ID"),
      this.stringValidator("type", "Type")
        .isIn(["forward", "rto", "weight"])
        .withMessage("Type must be forward, rto or weight only.")
        .bail(),
      this.stringValidator("zone1", "Zone 1"),
      this.stringValidator("zone2", "Zone 2"),
      this.stringValidator("zone3", "Zone 3"),
      this.stringValidator("zone4", "Zone 4"),
      this.stringValidator("zone5", "Zone 5"),
      this.stringValidator("cod_percentage", "Cod Percentage"),
      this.stringValidator("cod", "Cod Charge"),
    ];
  }

  priceCalculator() {
    const allowedPaymentMethods = ["cod", "prepaid"];

    return [
      this.stringValidator("origin", "Origin Pincode"),
      this.stringValidator("destination", "Destination Pincode"),
      this.numericStringValidator("weight", "Weight"),
      this.numericStringValidator("length", "Length"),
      this.numericStringValidator("breadth", "Breadth"),
      this.numericStringValidator("height", "Height"),
      this.stringValidator("paymentType", "Payment Type")
        .isIn(allowedPaymentMethods)
        .withMessage(
          `Allowed Payment Methods are ${allowedPaymentMethods.join(", ")}.`
        ),
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

  stringValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 300 })
      .withMessage(`${label} can be maximum 300 characters long.`);
  }

  numericStringValidator(field, label) {
    return this.fieldCheck(field, label)
      .matches(/^\d+(\.\d{1,2})?$/)
      .withMessage(
        `${label} must be a numeric string (e.g. "100" or "99.99").`
      );
  }
}

const PricingPlansValidations = new PricingPlansValidation();
export default PricingPlansValidations;
