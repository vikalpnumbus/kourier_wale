import CourierService from "../services/courier.service.mjs";
import UserCourierService from "../services/userCourier.service.mjs";

export const create = async (req, res, next) => {
  try {
    if (req?.user?.role != "admin") {
      const error = new Error("You don't have access to perform this action.");
      error.status = 401;
      throw error;
    }

    const { assigned_courier_ids, userId } = req.body;

    const ids = [
      ...new Set(
        assigned_courier_ids
          .split(",")
          .map((id) => id.trim())
          .filter((e) => e != "" && e != "null" && e != "undefined")
      ),
    ];

    const couriers = await Promise.all(ids.map((id) => CourierService.read({ id })));

    const checkCourierNotExists = ids.filter((_, idx) => couriers[idx] === false);

    if (checkCourierNotExists.length != 0) {
      const error = new Error(`Given courier ids do not exist: ${checkCourierNotExists.join(", ")}`);
      error.status = 422;
      throw error;
    }

    const result = await UserCourierService.create({
      data: {
        userId,
        assigned_courier_ids: ids.join(", "),
      },
    });
    if (!result) {
      throw UserCourierService.error;
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
      id: req.params.id,
      userId: req.query.userId,
    };

    const result = await UserCourierService.read(query);
    if (!result) {
      throw UserCourierService.error;
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

    const existingRecord = await UserCourierService.read({
      id: id,
    });

    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const { assigned_courier_ids, userId } = req.body;

    const ids = [
      ...new Set(
        assigned_courier_ids
          .split(",")
          .map((id) => id.trim())
          .filter((e) => e != "" && e != "null" && e != "undefined")
      ),
    ];

    const couriers = await Promise.all(ids.map((id) => CourierService.read({ id })));

    const checkCourierNotExists = ids.filter((_, idx) => couriers[idx] === false);

    if (checkCourierNotExists.length != 0) {
      const error = new Error(`Given courier ids do not exist: ${checkCourierNotExists.join(", ")}`);
      error.status = 422;
      throw error;
    }

    const payload = {
      id: id,
      userId,
      assigned_courier_ids: ids.join(", "),
    };

    const result = await UserCourierService.update({
      data: payload,
    });
    if (!result) {
      throw UserCourierService.error;
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
    const result = await UserCourierService.remove(query);
    if (!result) {
      throw UserCourierService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
