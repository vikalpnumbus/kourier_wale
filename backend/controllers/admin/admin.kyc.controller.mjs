import KYCService from "../../services/kyc.service.mjs";

export const verify = async (req, res, next) => {
  try {
    const { userId, status, remarks } = req.body;
    const existingKYC = await KYCService.repository.findOne({
      userId: req.body.userId,
    });

    if (!existingKYC) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    if (existingKYC.status == "approved") {
      const error = new Error("KYC is already verified.");
      error.status = 400;
      throw error;
    }

    const result = await KYCService.update({
      data: {
        userId,
        status,
        remarks,
        id: existingKYC.id,
        approvedBy: req.user.id,
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

export const read = async (req, res, next) => {
  try {
    const result = await KYCService.read({ userId: req.params.userId });
    if (!result) {
      throw KYCService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
