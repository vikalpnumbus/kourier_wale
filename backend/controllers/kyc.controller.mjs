import KYCService from "../services/kyc.service.mjs";

export const create = async (req, res, next) => {
  try {
    const files = req.files;

    let requiredFiles = [
      "panCardImage",
      "documentFrontImage",
      "documentBackImage",
    ];

    if (
      ["partnership", "limited liability partnership"].includes(
        req.body.kycType
      )
    ) {
      requiredFiles.push("partnershipDeedImage");
    }

    if (!["sole proprietorship"].includes(req.body.kycType)) {
      requiredFiles.push("gstImage");
    }

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

    const existingKYC = await KYCService.repository.findOne({
      userId: req.user.id,
    });

    if (existingKYC) {
      const error = new Error("KYC already exists.");
      error.status = 409;
      throw error;
    } else {
      const result = await KYCService.create({
        files: files
          .map((f) => (requiredFiles.includes(f.fieldname) ? f : null))
          .filter(Boolean),
        data: {
          userId: req.user.id,
          ...req.body,
          status: undefined,
        },
      });
      if (!result) {
        throw KYCService.error;
      }
      res.success(result);
    }
  } catch (error) {
    console.error(error);
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const result = await KYCService.read({ userId: req.user.id });
    if (!result) {
      throw KYCService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const files = req.files || [];

    const existingKYC = await KYCService.repository.findOne({
      userId: req.user.id,
    });

    if (!existingKYC) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    if (existingKYC.status == "approved") {
      const error = new Error(
        "KYC is verified. To update it, contact our support team."
      );
      error.status = 403;
      throw error;
    }

    const result = await KYCService.update({
      files: files.filter(Boolean),
      data: {
        userId: req.user.id,
        id: existingKYC.id,
        ...req.body,
      },
    });
    if (!result) {
      throw KYCService.error;
    }
    res.success({
      status: result.status,
      data: "Record Updated Successfully",
    });
  } catch (error) {
    next(error);
  }
};
