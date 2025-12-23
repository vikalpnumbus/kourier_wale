import RemittanceService from "../../services/admin/admin.remmitance.service.mjs";

export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await RemittanceService.read(query);
    if (!result) {
      throw RemittanceService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
