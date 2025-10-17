import PincodeService from "../services/pincode.service.mjs";

export const read = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!pincode) {
      const error = new Error("Pincode is required.");
      error.status = 422;
      throw error;
    }
    if (pincode.length != 6) {
      const error = new Error("Enter a valid pincode.");
      error.status = 422;
      throw error;
    }
    const result = await PincodeService.view(pincode);
    if (!result) {
      throw PincodeService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
