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
    return [
      // ---- Basic Order Info ----
      this.stringValidator("orderId", "Order ID"),
      this.numericStringValidator("orderAmount", "Order Amount"),
      this.numericStringValidator("collectableAmount", "Collectable Amount"),
      this.stringValidator("order_source", "Order Source"),
      this.productsArrayValidator("products", "Products Array"),

      // ---- Payment Type ----
      this.fieldCheck("paymentType", "Payment Type")
        .isIn(["cod", "prepaid", "reverse"])
        .withMessage("Payment Type must be one of: cod, prepaid, reverse."),

      // ---- Shipping Details ----
      this.stringValidator("shippingDetails.fname", "First Name"),
      this.stringValidator("shippingDetails.lname", "Last Name"),
      this.stringValidator("shippingDetails.address", "Address"),
      this.stringValidator("shippingDetails.city", "City"),
      this.stringValidator("shippingDetails.state", "State"),
      this.phoneValidator("shippingDetails.phone", "Phone"),
      this.optionalPhoneValidator(
        "shippingDetails.alternatePhone",
        "Alternate Phone"
      ),
      this.pincodeValidator("shippingDetails.pincode", "Pincode"),
      this.numericStringValidator("warehouse_id", "Warehouse ID"),
      this.numericStringValidator("rto_warehouse_id", "RTO Warehouse ID"),

      // ---- Package Details ----
      this.numericStringValidator("packageDetails.weight", "Weight"),
      this.numericStringValidator("packageDetails.length", "Length"),
      this.numericStringValidator("packageDetails.height", "Height"),
      this.numericStringValidator("packageDetails.breadth", "Breadth"),
      this.numericStringValidator(
        "packageDetails.volumetricWeight",
        "Volumetric Weight"
      ),

      // ---- Charges ----
      this.optionalNumericStringValidator("charges.shipping", "Shipping Charge"),
      this.optionalNumericStringValidator("charges.cod", "COD Charge"),
      this.optionalNumericStringValidator("charges.tax_amount", "Tax Amount"),
      this.optionalNumericStringValidator("charges.discount", "Discount"),
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
      .withMessage(
        `${label} must be a numeric string (e.g. "100" or "99.99").`
      );
  }

  optionalNumericStringValidator(field, label) {
  return this.fieldCheck(field, label)
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage(
      `${label} must be a numeric string (e.g. "100" or "99.99").`
    );
}

  phoneValidator(field, label) {
    return this.fieldCheck(field, label)
      .matches(/^[6-9]\d{9}$/)
      .withMessage(`${label} must be a valid 10-digit Indian phone number.`);
  }

  optionalPhoneValidator(field, label) {
    return check(field)
      .optional({ checkFalsy: true })
      .matches(/^[6-9]\d{9}$/)
      .withMessage(`${label} must be a valid 10-digit Indian phone number.`);
  }

  optionalPincodeValidator(field, label) {
    return check(field)
      .optional({ checkFalsy: true })
      .isLength({ min: 6, max: 6 })
      .withMessage(`${label} must be exactly 6 digits.`)
      .isInt()
      .withMessage(`${label} must be numeric.`);
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

  productsArrayValidator(field, label) {
    return this.fieldCheck(field, label).custom((value) => {
      value.forEach((e) => {
        if (!(e.hasOwnProperty("id") && e.hasOwnProperty("qty"))) {
          throw new Error("Each Product must have id and qty.");
        }
      });
      return true;
    });
  }
}

const OrdersValidations = new Validations();
export default OrdersValidations;
