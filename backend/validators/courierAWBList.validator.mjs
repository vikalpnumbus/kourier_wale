import { check } from "express-validator";

class CourierAWBListValidation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new CourierAWBListValidation("create").rules();
  }

  update() {
    return new CourierAWBListValidation("update").rules();
  }

  rules() {
    return [
      this.numericStringValidator("courier_id", "Courier ID"),
      this.fieldCheck("awb_number", "AWB Number")
        .if(()=>this.mode == "create")
        .isArray()
        .withMessage("awb_number should be an array")
        .bail()
        .custom((value, { req }) => {
          const maxAllowedLength = 1000;
          if (value.length > maxAllowedLength)
            throw new Error(
              `Please, do not enter more than ${maxAllowedLength} awb numbers.`
            );
          return true;
        })
        .customSanitizer((value) => [...new Set(value)].filter(Boolean)),
      this.stringValidator("mode", "Mode of Courier")
        .isIn(["forward", "reverse"])
        .withMessage("Invalid vlaue. Allowed values: forward, reverse"),
      this.numericStringValidator(
        "used",
        "Information of whether AWB is used or not"
      )
        .isIn([0, 1])
        .withMessage("Invalid vlaue. Allowed values: 0,1"),
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
      .withMessage(`${label} must be a numeric string (e.g. "0" or "1").`);
  }
}

const CourierAWBListValidations = new CourierAWBListValidation();
export default CourierAWBListValidations;
