import { check } from "express-validator";

class CourierPricingCardValidationClass {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new CourierPricingCardValidationClass("create").rules();
  }

  update() {
    return new CourierPricingCardValidationClass("update").rules();
  }

  rules() {
    return [
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

const CourierPricingCardValidation = new CourierPricingCardValidationClass();
export default CourierPricingCardValidation;
