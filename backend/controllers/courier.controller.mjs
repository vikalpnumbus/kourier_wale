import CourierService from "../services/courier.service.mjs";

export const create = async (req, res, next) => {
  try {
    const result = await CourierService.create({
      data: {
        ...req.body,
      },
    });
    if (!result) {
      throw CourierService.error;
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

    const result = await CourierService.read(query);
    if (!result) {
      throw CourierService.error;
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

    const existingRecord = await CourierService.read({
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

    const result = await CourierService.update({
      data: payload,
    });
    if (!result) {
      throw CourierService.error;
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
    const result = await CourierService.remove(query);
    if (!result) {
      throw CourierService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
