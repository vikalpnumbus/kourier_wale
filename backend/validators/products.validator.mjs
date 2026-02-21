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
      this.optionalBasicValidator("sku", "SKU Code"),
      this.categoryValidator("category", "Category"),
      this.priceValidator("price", "Price of the product"),
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

  optionalBasicValidator(field, label) {
  return check(field)
    .optional()
    .isString()
    .withMessage(`${label} must be a string.`)
    .bail()
    .isLength({ max: 30 })
    .withMessage(`${label} can be maximum 30 characters long.`);
}


  categoryValidator(field, label) {
    const allowedCategories = [
        "appliances",
        "mobile",
        "electronics",
        "fashion",
        "home_and_kitchen",
        "grocery",
        "books",
        "beauty",
        "sports",
        "automotive",
        "toys",
        "furniture",
        "baby",
        "computers",
        "other"
      ]
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isIn(allowedCategories)
      .withMessage(
        `Invalid ${label}. Accepted values: ${allowedCategories.join(', ')}.`
      );
  }

  priceValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .matches(/^\d+(\.\d{1,2})?$/)
      .withMessage(
        `${label} must be a number and can have up to 2 decimal places.`
      );
  }
}

const ProductsValidations = new ValidationClass();
export default ProductsValidations;
