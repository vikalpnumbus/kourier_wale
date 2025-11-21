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

  cancel() {
    return [
      this.fieldCheck("shipment_ids", "shipment_ids").custom(
        (value, { req }) => {
          if (
            typeof value != "object" ||
            !Array.isArray(value) ||
            value.filter(
              (e) => e != null && e != undefined && e?.toString().trim() != ""
            ).length == 0
          )
            throw new Error(
              "shipment_ids must be an array of valid comma-separated ids"
            );
          req.body.shipment_ids = value.filter(
            (e) => e != null && e != undefined && e?.toString().trim() != ""
          );
          return true;
        }
      ),
    ];
  }

  rules() {
    const allowedShippingStatus = [
      "new",
      "booked",
      "cancelled",
      "damaged",
      "delivered",
      "in-transit",
      "lost",
      "pending-pickup",
      "out-for-delivery",
      "rto",
    ].sort();
    return [
      // ---- Basic Order Info ----
      this.numericStringValidator("order_db_ids", "Order_DB_IDs").custom(
        (value, { req }) => {
          if (
            typeof value != "object" ||
            !Array.isArray(value) ||
            value.filter(
              (e) => e != null && e != undefined && e?.toString().trim() != ""
            ).length == 0
          )
            throw new Error(
              "order_db_ids must be an array of valid comma-separated ids"
            );
          req.body.order_db_ids = value.filter(
            (e) => e != null && e != undefined && e?.toString().trim() != ""
          );
          return true;
        }
      ),

      // ---- Shipping Details ----
      this.numericStringValidator("warehouse_id", "Warehouse ID"),
      this.numericStringValidator("rto_warehouse_id", "RTO Warehouse ID"),

      // ---- Shipping Specific Validations ----
      this.numericStringValidator("courier_id", "Courier ID"),
      // this.numericStringValidator("freight_charge", "Freight charge"),
      // this.numericStringValidator("cod_price", "COD charge"),
      check("freight_charge")
        .if((value, { req }) => req.body.order_db_ids.length == 1)
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage(
          `freight_charge must be a numeric string (e.g. "100" or "99.99").`
        ),
      check("cod_price")
        .if((value, { req }) => req.body.order_db_ids.length == 1)
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage(
          `cod_price must be a numeric string (e.g. "100" or "99.99").`
        ),
      this.stringValidator("zone", "Zone"),
      this.numericStringValidator("plan_id", "Plan ID"),
      check("shipping_status")
        .optional()
        .isIn(allowedShippingStatus)
        .withMessage(
          `Invalid value. Accepted values: ${allowedShippingStatus.join(", ")}.`
        ),
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

const ShippingValidations = new Validations();
export default ShippingValidations;
