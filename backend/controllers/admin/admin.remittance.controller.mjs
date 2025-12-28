import RemittanceService from "../../services/admin/admin.remmitance.service.mjs";
import { readCsvAsArray } from "../../utils/basic.utils.mjs";

export const readAdminRemittance = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await RemittanceService.readAdminRemittance(query);
    if (!result) {
      throw RemittanceService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const readSellerRemittance = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
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

export const createRemittance = async (req, res, next) => {
  try {
    const { awb_numbers } = req.body;
    const result = await RemittanceService.createRemittance({ awb_numbers });
    if (!result) {
      throw RemittanceService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
