import { check } from "express-validator";

class Validations {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new Validations("create").rules();
  }

  update() {
    return new Validations("update").rules();
  }

  rules() {
    const allowedPaperSizes = ["standard", "thermal"];
    return [
      this.stringValidator("paper_size", "Paper Size")
        .isIn(allowedPaperSizes)
        .withMessage(
          `Invalid value. Allowed values: ${allowedPaperSizes.join(", ")}`
        )
        .bail(),
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
}

const LabelSettingsValidations = new Validations();
export default LabelSettingsValidations;
