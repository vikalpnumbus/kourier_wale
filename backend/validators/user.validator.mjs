import { check } from "express-validator";

class UserValidationsClass {
  save1() {
    return [
      this.nameValidator("fname", "fname"),
      this.nameValidator("lname", "lname"),
      this.emailValidator("email", "email"),
      this.passwordValidator("password", "password"),
      this.confirmPasswordValidator("confirmPassword", "confirmPassword"),
      this.phoneValidator("phone", "phone"),
      this.nameValidator("companyName", "companyName"),
      this.websiteValidator("website", "website"),
      this.shippingVolumeValidator("shippingVolume", "shippingVolume"),
    ];
  }

  save2() {
    return [
      check("type")
        .exists({ checkFalsy: true })
        .withMessage(`type is required.`)
        .bail()
        .isString()
        .withMessage(`type must be a string.`)
        .bail()
        .trim()
        .isIn(["email", "phone"])
        .withMessage(`type must be either "email" or "phone".`)
        .bail(),

      check("to")
        .exists({ checkFalsy: true })
        .withMessage("to is required.")
        .bail()
        .custom((value, { req }) => {
          if (req.body.type === "email") {
            return this.emailValidator("to", "Recipient email").run(req);
          } else if (req.body.type === "phone") {
            return this.phoneValidator("to", "Recipient phone").run(req);
          }
          return true;
        }),

      check("otp")
        .exists({ checkFalsy: true })
        .withMessage(`otp is required.`)
        .bail()
        .isLength({ min: 6, max: 6 })
        .withMessage(`otp must be exactly 6 digits.`)
        .bail()
        .trim()
        .isNumeric()
        .withMessage(`otp must contain only numbers.`),
    ];
  }

  login() {
    return [
      this.passwordValidator("password", "password"),
      this.emailValidator("email", "email"),
    ];
  }

  forgotPassword() {
    return [this.emailValidator("email", "email")];
  }

  resetPassword() {
    return [this.passwordValidator("password", "password")];
  }

  nameValidator(field, label) {
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
      .matches(/^[A-Za-z\s'-]+$/)
      .withMessage(
        `${label} should only contain alphabets, spaces, apostrophes, or hyphens.`
      )
      .bail();
  }

  emailValidator(field, label) {
    return check(field)
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

  passwordValidator(field, label) {
    return check(field)
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isLength({ min: 8, max: 64 })
      .withMessage(`${label} must be between 8 and 64 characters.`)
      .bail()
      .matches(/[A-Z]/)
      .withMessage(`${label} must contain at least one uppercase letter.`)
      .bail()
      .matches(/[a-z]/)
      .withMessage(`${label} must contain at least one lowercase letter.`)
      .bail()
      .matches(/\d/)
      .withMessage(`${label} must contain at least one number.`)
      .bail()
      .matches(/[@$!%*?&]/)
      .withMessage(`${label} must contain at least one special character.`)
      .bail();
  }

  confirmPasswordValidator(field, label) {
    return check(field)
      .if((value, { req }) => {
        if (req.body.password) return true;
        return false;
      })
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(`${label} does not match password.`);
        }
        return true;
      });
  }

  phoneValidator(field, label) {
    return check(field)
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .matches(/^\+91[6-9]\d{9}$/)
      .withMessage(
        `${label} must be in the format +91XXXXXXXXXX (Indian number).`
      )
      .bail();
  }

  websiteValidator(field, label) {
    return check(field)
      .optional()
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .custom((value) => {
        const regex = /^(https?:\/\/www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/;
        if (!regex.test(value)) {
          throw new Error(
            `Enter a valid ${label.toLowerCase()} starting with http://www. or https://www.`
          );
        }
        return true;
      });
  }

  shippingVolumeValidator(field, label) {
    const allowedValues = ["0-100", "100-1000", "1000 or above"];
    return check(field)
      .exists({ checkFalsy: true })
      .withMessage(`${label} is required.`)
      .bail()
      .isIn(allowedValues)
      .withMessage(`${label} must be one of: ${allowedValues.join(", ")}.`)
      .bail();
  }
}

const UserValidations = new UserValidationsClass();
export default UserValidations;
