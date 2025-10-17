import { validationResult } from "express-validator";

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: errors.array().map((err) => {
          return {
            field: err.path,
            message: err.msg,
          };
        }),
      });
    }

    next();
  };
};

export default validate;
