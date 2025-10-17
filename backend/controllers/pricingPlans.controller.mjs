import PricingPlansService from "../services/pricingPlans.service.mjs";

export const create = async (req, res, next) => {
  try {
    const isExist = await PricingPlansService.read({
      name: req.body.name,
      type: req.body.type,
    });

    if (isExist) {
      const error = new Error("Plan already exists.");
      error.status = 400;
      throw error;
    }

    if (req?.user?.role != "admin") {
      const error = new Error("You don't have access to perform this action.");
      error.status = 401;
      throw error;
    }

    const result = await PricingPlansService.create({
      data: { ...req.body, createdBy: req.user.id },
    });
    if (!result) {
      throw PricingPlansService.error;
    }
    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      id: req.params.id || undefined,
    };

    const result = await PricingPlansService.read(query);
    if (!result) {
      throw PricingPlansService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Record id is required.");
      error.status = 400;
      throw error;
    }

    const existingRecord = await PricingPlansService.read({
      id: id,
    });
    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const payload = {
      id: id,
      ...req.body,
    };

    const result = await PricingPlansService.update({
      data: payload,
    });
    if (!result) {
      throw PricingPlansService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const query = {};
    if (req.params.id) {
      query.id = req.params.id;
    }
    const result = await PricingPlansService.remove(query);
    if (!result) {
      throw PricingPlansService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
