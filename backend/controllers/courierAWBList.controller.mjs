import CourierService from "../services/courier.service.mjs";
import CourierAWBListService from "../services/courierAWBList.service.mjs";

export const create = async (req, res, next) => {
  try {
    const { courier_id, awb_number, mode } = req.body;

    const checkAWBExistence = await Promise.all(
      awb_number.map(async (e) => {
        const result = await CourierAWBListService.read({
          courier_id,
          awb_number: e,
          mode,
        });

        if (!result) return false;
        return e;
      })
    );

    const awbExists = checkAWBExistence.filter((e) => e) || [];

    if (awbExists.length > 0) {
      const error = new Error(
        `Record already exists with id ${awbExists.join(", ")}`
      );
      error.status = 422;
      throw error;
    }

    const isCourierExist = await CourierService.read({ id: courier_id });
    if (!isCourierExist) {
      const error = new Error("Courier does not exist.");
      error.status = 400;
      throw error;
    }

    const result = await CourierAWBListService.create({
      data: {
        ...req.body,
      },
    });
    if (!result) {
      throw CourierAWBListService.error;
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
      id: req.params?.id,
      awb_number: req.query?.awb_number,
      mode: req.query?.mode,
      courier_id: req.query?.courier_id,
    };

    const result = await CourierAWBListService.read(query);
    if (!result) {
      throw CourierAWBListService.error;
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

    const existingRecord = await CourierAWBListService.read({
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

    const result = await CourierAWBListService.update({
      data: payload,
    });
    if (!result) {
      throw CourierAWBListService.error;
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
    const result = await CourierAWBListService.remove(query);
    if (!result) {
      throw CourierAWBListService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
