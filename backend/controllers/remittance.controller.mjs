import RemittanceService from "../services/remmitance.service.mjs";

export const readSellerRemittance = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      userId: req.user.id,
    };
    const result = await RemittanceService.readSellerRemittance(query);
    if (!result) {
      throw RemittanceService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
