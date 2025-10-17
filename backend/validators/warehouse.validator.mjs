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
      this.basicValidator("name", "Product Name"),
      this.basicValidator("contactName", "Contact Name"),
      this.phoneValidator("contactPhone", "Contact Phone"),
      this.basicValidator("address", "Address"),
      this.basicValidator("city", "City"),
      this.basicValidator("state", "State"),
      this.pincodeValidator("pincode", "Pincode"),
      this.emailValidator("support_email", "Support Email"),
      this.phoneValidator("support_phone", "Support Phone"),
      this.booleanValidator(
        "hide_end_customer_contact_number",
        "Support Phone Option"
      ),
      this.booleanValidator(
        "hide_warehouse_mobile_number",
        "Warehouse mobile number Option"
      ),
      this.booleanValidator(
        "hide_warehouse_address",
        "Warehouse Address Option"
      ),
      this.booleanValidator("hide_product_details", "Product Details Option"),
      this.isPrimaryValidator("isPrimary", "isPrimary"),
      this.isActiveValidator("isActive", "isActive"),
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

  phoneValidator(field, label) {
    return this.fieldCheck(field, label)
      .matches(/^\+91[6-9]\d{9}$/)
      .withMessage(
        `${label} must be in the format +91XXXXXXXXXX (Indian number).`
      )
      .bail();
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

  emailValidator(field, label) {
    return check(field)
      .if((value, { req }) => {
        if (this.mode == "update") return false;
      })
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`)
      .bail()
      .isEmail()
      .withMessage(`Enter a valid ${label.toLowerCase()} address.`)
      .bail()
      .normalizeEmail();
  }

  booleanValidator(field, label) {
    return check(field)
      .if((value, { req }) => {
        if (this.mode == "update") return false;
      })
      .exists()
      .withMessage(`${label} is required.`)
      .bail()
      .isBoolean()
      .withMessage(`${label} must be a boolean.`)
      .bail()
      .isIn([true, false])
      .withMessage(`Invalid ${label}. Accepted values: true and false.`);
  }

  isPrimaryValidator(field, label) {
    return check(field)
      .optional()
      .isBoolean()
      .withMessage(`${label} must be a boolean.`)
      .bail()
      .isIn([true, false])
      .withMessage(`Invalid ${label}. Accepted values: true and false.`);
  }

  isActiveValidator(field, label) {
    return check(field)
      .optional()
      .isBoolean()
      .withMessage(`${label} must be a boolean.`)
      .bail()
      .isIn([true, false])
      .withMessage(`Invalid ${label}. Accepted values: true and false.`);
  }
}

const WarehouseValidations = new ValidationClass();
export default WarehouseValidations;
