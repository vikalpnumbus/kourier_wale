class ValidationClass {
  constructor() {
    this.error = null;
  }
  validate(req, res, next) {
    try {
      if (!req.files || !req.files.length) {
        return next();
      }
      const allowedExtensions = ["text/csv"];
      const allowedSize = 5 * 1024 * 1024; // 5 MB

      if (req.files.some((e) => e.size > allowedSize)) {
        const error = new Error(
          `Maximum size of each file should be ${
            allowedSize / (1024 * 1024)
          } MB. Error on ${req.files
            .map((e) => (e.size > allowedSize ? e.fieldname : null))
            .filter(Boolean)
            .join(", ")}`
        );

        throw error;
      } else if (
        req.files.some((e) => !allowedExtensions.includes(e.mimetype))
      ) {
        const error = new Error(
          `Only ${allowedExtensions.join(
            ", "
          )} should be uploaded. Error on ${req.files
            .map((e) =>
              !allowedExtensions.includes(e.mimetype) ? e.fieldname : null
            )
            .filter(Boolean)
            .join(", ")}`
        );

        throw error;
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
const FileValidator = new ValidationClass();
export default FileValidator;
