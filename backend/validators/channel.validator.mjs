import { check } from "express-validator";

class Validation {
  constructor(mode = "create") {
    this.mode = mode; // "create" or "update"
  }

  create() {
    return new Validation("create").rules();
  }

  update() {
    return new Validation("update").rules();
  }

  fetch() {
    const allowedChannels = ["shopify"];
    return [
      this.stringValidator("channel", "Channel")
        .isIn(allowedChannels)
        .withMessage(
          `Invalid value. Allowed values are: ${allowedChannels.join(", ")}`
        )
        .bail(),
    ];
  }
  rules() {
    const allowedChannels = ["shopify"];
    return [
      this.stringValidator("channel", "Channel")
        .isIn(allowedChannels)
        .withMessage(
          `Invalid value. Allowed values are: ${allowedChannels.join(", ")}`
        )
        .bail(),
      this.stringValidator("channel_name", "Channel Name"),
      this.stringValidator("channel_host", "Host"),
      this.stringValidator("api_key", "API key"),
      this.stringValidator("api_secret", "API Secret"),
      this.stringValidator("access_token", "Access Token"),
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

const ChannelValidations = new Validation();
export default ChannelValidations;
