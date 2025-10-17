import { check } from "express-validator";

class ValidationClass {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  // Factory methods
  create() {
    return new ValidationClass("create").rules();
  }
  update() {
    return new ValidationClass("update").rules();
  }

  rules() {
    return [
      this.basicValidator("accountHolderName", "Account Holder Name"),
      this.accountNumberValidator("accountNumber", "Account Number"),
      this.basicValidator("bankName", "Bank Name"),
      this.basicValidator("bankBranch", "Bank Branch"),
      this.ifscValidator("ifscCode", "IFSC Code"),
      this.basicValidator("address", "Address"),
      this.basicValidator("state", "State"),
      this.basicValidator("city", "City"),
      this.accountTypeValidator("accountType", "Account Type"),
      this.isPrimaryValidator("isPrimary", "isPrimary"),
    ];
  }

  // Utility: required or optional depending on mode
  fieldCheck(field, label) {
    let validator = check(field);
    if (this.mode === "update") {
      validator = validator.optional();
    } else {
      validator = validator
        .exists({ checkFalsy: true })
        .withMessage(`${label} is required.`)
        .bail();
    }
    return validator;
  }

  basicValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 300 })
      .withMessage(`${label} can be maximum 300 characters long.`);
  }

  accountNumberValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .matches(/^[0-9]{9,18}$/)
      .withMessage(`${label} must be a number between 9 and 18 digits.`);
  }

  ifscValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .withMessage("Invalid IFSC code format.");
  }

  accountTypeValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isIn(["savings", "current"])
      .withMessage(`Invalid ${label}. Accepted values: savings and current.`);
  }
  isPrimaryValidator(field, label) {
    return this.fieldCheck(field, label)
      .exists()
      .withMessage(`${label} is required.`)
      .bail()
      .isBoolean()
      .withMessage(`${label} must be a boolean.`)
      .bail()
      .isIn([true, false])
      .withMessage(`Invalid ${label}. Accepted values: true and false.`);
  }
}

const CompanyDetailsValidations = new ValidationClass();
export default CompanyDetailsValidations;
