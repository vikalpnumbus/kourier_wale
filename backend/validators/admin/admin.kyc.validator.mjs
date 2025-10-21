import { check } from "express-validator";

class ValidationClass {
  constructor(mode = "verify") {
    this.mode = mode;
  }

  // Factory methods
  verify() {
    return new ValidationClass("verify").rules();
  }

  // This will return all validators for KYC
  rules() {
    const allowedKYCStatuses = ["pending", "approved", "rejected"];
    return [
      this.numericStringValidator("userId", "User ID"),
      this.stringValidator("status", "Status")
        .isIn(allowedKYCStatuses)
        .withMessage(
          `Invalid value. Allowed values are: ${allowedKYCStatuses.join(", ")}`
        ),
      this.stringValidator("remarks", "Remarks"),
    ];
  }

  // Utility: required or optional depending on mode
  fieldCheck(field, label) {
    let validator = check(field);

    validator = validator
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail();

    return validator;
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

const KYCValidations = new ValidationClass();
export default KYCValidations;
