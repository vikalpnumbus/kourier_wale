import { check } from "express-validator";

class CourierValidation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new CourierValidation("create").rules();
  }

  update() {
    return new CourierValidation("update").rules();
  }

  rules() {
    return [
      this.stringValidator("name", "Courier Name"),
      this.stringValidator("code", "Courier Code"),
      this.numericStringValidator("status", "Status of Courier")
        .isIn([0, 1])
        .withMessage("Invalid vlaue. Allowed values: 0,1"),
      this.numericStringValidator("show_to_users", "Courier Show to users")
        .isIn([0, 1])
        .withMessage("Invalid vlaue. Allowed values: 0,1"),
      ,
      this.numericStringValidator(
        "volumetric_divisor",
        "Couerier volumetric divisor"
      ),
      this.numericStringValidator("weight", "Weight"),
      this.numericStringValidator("additional_weight", "Additional Weight"),
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

const CourierValidations = new CourierValidation();
export default CourierValidations;
