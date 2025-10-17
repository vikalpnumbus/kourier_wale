import { check } from "express-validator";

class UserCourierValidation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new UserCourierValidation("create").rules();
  }

  update() {
    return new UserCourierValidation("update").rules();
  }

  rules() {
    return [
      this.stringValidator("assigned_courier_ids", "Assigned Courier Ids"),
      this.numericStringValidator("userId", "User ID"),
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

const UserCourierValidations = new UserCourierValidation();
export default UserCourierValidations;
