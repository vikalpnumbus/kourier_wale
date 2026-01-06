import DashboardService from "../services/dashboard.service.mjs";

export const dashboardStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { start_date, end_date, userId: req.user.id };
    const result = await DashboardService.dashboardStats(query);

    if (!result) {
      throw DashboardService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const courierWiseStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { start_date, end_date, userId: req.user.id };
    const result = await DashboardService.courierWiseStats(query);

    if (!result) {
      throw DashboardService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const paymentModeWiseStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { start_date, end_date, userId: req.user.id };
    const result = await DashboardService.paymentModeWiseStats(query);

    if (!result) {
      throw DashboardService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const cityWiseStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { start_date, end_date, userId: req.user.id };
    const result = await DashboardService.cityWiseStats(query);

    if (!result) {
      throw DashboardService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const productWiseStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { start_date, end_date, userId: req.user.id };
    const result = await DashboardService.productWiseStats(query);

    if (!result) {
      throw DashboardService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};
