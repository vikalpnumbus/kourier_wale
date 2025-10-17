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

  // This will return all validators for KYC
  rules() {
    return [
      this.kycTypeValidator("kycType", "kycType"),
      this.panCardNumberValidator("panCardNumber", "Pan Card Number"),
      this.nameOnPanCardValidator("nameOnPanCard", "Name on Pan Card"),
      this.documentTypeValidator("documentType", "Document Type"),
      this.documentIdValidator("documentId", "Document ID"),
      this.nameOnPanCardValidator("nameOnDocument", "Name on Document"),
      this.coiNumberValidator("coiNumber", "COI Number"),
      this.gstNumberValidator("gstNumber", "GST Number"),
      this.gstNameValidator("gstName", "Name on GST"),
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

  kycTypeValidator(field, label) {
    const allowedKycTypes = [
      "sole proprietorship",
      "partnership",
      "limited liability partnership",
      "public limited company",
      "private limited company",
    ];

    return check(field)
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`)
      .bail()
      .isIn(allowedKycTypes)
      .withMessage(
        `${label} should only contain ${allowedKycTypes.join(", ")}.`
      );
  }

  panCardNumberValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`)
      .bail()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage("Invalid PAN card number");
  }

  nameOnPanCardValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`);
  }

  documentTypeValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`)
      .bail()
      .custom((value, { req }) => {
        if (value === undefined) return true; // Skip if not provided in update
        const { kycType } = req.body;
        let allowedValues = [];

        if (
          [
            "sole proprietorship",
            "partnership",
            "limited liability partnership",
          ].includes(kycType)
        ) {
          allowedValues = ["Aadhar", "Passport", "Driving License", "Voter ID"];
        } else if (
          ["public limited company", "private limited company"].includes(
            kycType
          )
        ) {
          allowedValues = [
            "Electricity Bill",
            "Lease / Rent Agreement",
            "Telephone or Broadband Bill",
          ];
        } else {
          allowedValues = [
            "Aadhar",
            "Passport",
            "Driving License",
            "Voter ID",
            "Electricity Bill",
            "Lease / Rent Agreement",
            "Telephone or Broadband Bill",
          ];
        }

        if (!allowedValues.includes(value)) {
          throw new Error(
            `${label} must be one of: ${allowedValues.join(", ")}`
          );
        }
        return true;
      });
  }

  documentIdValidator(field, label) {
    return this.fieldCheck(field, label)
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`);
  }

  coiNumberValidator(field, label) {
    return check(field)
      .if((value, { req }) => {
        const { kycType } = req.body;
        return ["public limited company", "private limited company"].includes(
          kycType
        );
      })
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`);
  }

  gstNumberValidator(field, label) {
    return this.fieldCheck(field, label)
      .if((value, { req }) => req.body.kycType !== "sole proprietorship")
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`)
      .bail()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .withMessage("Invalid GST number");
  }

  gstNameValidator(field, label) {
    return this.fieldCheck(field, label)
      .if((value, { req }) => req.body.kycType !== "sole proprietorship")
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isString()
      .withMessage(`${label} must be a string.`)
      .bail()
      .isLength({ max: 150 })
      .withMessage(`${label} can be maximum 150 characters long.`);
  }
}

const KYCValidations = new ValidationClass();
export default KYCValidations;
