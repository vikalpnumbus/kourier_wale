import CompanyDetailsService from "../services/companyDetails.service.mjs";

export const create = async (req, res, next) => {
  try {
    const files = req.files;

    let requiredFiles = ["companyLogo"];

    const uploadedFileNames = files.map((f) => f.fieldname);

    const missingFiles = requiredFiles.filter(
      (required) => !uploadedFileNames.includes(required)
    );

    if (missingFiles.length > 0) {
      const error = new Error(`Missing required files: ${missingFiles}`);
      error.status = 400;
      error.details = missingFiles.map((e) => ({
        field: e,
        message: e + " is required.",
      }));
      throw error;
    }

    const userId = req.user.id;

    const result = await CompanyDetailsService.save({
      id: userId,
      ...req.body,
      files,
    });

    if (!result) {
      throw CompanyDetailsService.error;
    }

    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};

export const view = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await CompanyDetailsService.view({
      id: userId,
    });

    if (!result) {
      throw CompanyDetailsService.error;
    }

    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};
