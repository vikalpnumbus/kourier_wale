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

  // This will return all validators for Company Deatils
  rules() {
    return [
      this.basicValidator("companyAddress", "Address"),
      this.basicValidator("companyCity", "City"),
      this.basicValidator("companyState", "State"),
      this.pincodeValidator("companyPincode", "Pincode"),
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

  pincodeValidator(field, label) {
    return this.fieldCheck(field, label)
      .isInt()
      .withMessage(`${label} must be an integer.`)
      .bail()
      .isLength({ max: 6, min: 6 })
      .withMessage(`${label} should be of only 6 characters.`)
      .bail();
  }
}

const CompanyDetailsValidations = new ValidationClass();
export default CompanyDetailsValidations;
