import { check } from "express-validator";

class Validation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new Validation("create").rules();
  }

  update() {
    return new Validation("update").rules();
  }

  rules() {
    const allowedTypes = ["Tech Query", "Billing Query"];
    return [
      this.stringValidator("type", "Escalation Type")
        .isIn(allowedTypes)
        .withMessage(
          `Invalid value. Allowed values are: ${allowedTypes.sort().join(", ")}`
        )
        .bail(),
      this.stringValidator("subject", "Escalation Subject"),
      this.stringValidator("query", "Escalation query"),
      this.stringValidator("query", "Escalation query"),
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

const EscalationValidations = new Validation();
export default EscalationValidations;
