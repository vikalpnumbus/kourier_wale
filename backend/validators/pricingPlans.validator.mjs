import { check } from "express-validator";

class PricingPlansValidation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new PricingPlansValidation("create").rules();
  }

  update() {
    return new PricingPlansValidation("update").rules();
  }

  rules() {
    const allowedPlanNames = ["bronze", "silver", "gold", "platinum"];
    const allowedPlanTypes = ["standard", "custom"];
    return [
      this.stringValidator("type", "Pricing type")
        .isIn(allowedPlanTypes)
        .withMessage(
          `Invalid Value. Allowed plan types: ${allowedPlanTypes.join(", ")}`
        ),

      this.stringValidator("name", "Pricing name").custom((value, { req }) => {
        const { type, name } = req.body;
        if (type == "standard") {
          if (!allowedPlanNames.includes(name)) {
            throw new Error(
              `Invalid Value. Allowed plan names for ${type} plan type: ${allowedPlanNames.join(
                ", "
              )}`
            );
          }
        }
        return true;
      }),
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

const PricingPlansValidations = new PricingPlansValidation();
export default PricingPlansValidations;
