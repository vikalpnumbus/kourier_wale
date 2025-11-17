import PricingPlansService from "../services/pricingPlans.service.mjs";
import CourierPricingCardService from "../services/courierPricingCard.service.mjs";
import CourierService from "../services/courier.service.mjs";

export const create = async (req, res, next) => {
  try {
    const { courier_id, type } = req.body;
    const isExist = await CourierPricingCardService.read({
      courier_id,
      type,
    });

    if (isExist) {
      const error = new Error("Courier Plan card already exists.");
      error.status = 400;
      throw error;
    }

    const isCourierExist = await CourierService.read({ id: courier_id });
    if (!isCourierExist) {
      const error = new Error("Courier does not exist.");
      error.status = 400;
      throw error;
    }

    const result = await CourierPricingCardService.create({
      data: req.body,
    });
    if (!result) {
      throw CourierPricingCardService.error;
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
      courier_id:req.params?.courier_id
    };

    const result = await CourierPricingCardService.read(query);

    if (!result) {
      throw CourierPricingCardService.error;
    }
    const courierCache = {};

    let resultData = await Promise.all(
      result.data.result.map(async (e) => {
        const { dataValues, courier_id } = e;

        if (courier_id && !courierCache.courier_id) {
          const courier = (await CourierService.read({ id: courier_id }))?.data
            ?.result?.[0]?.name;
          courierCache.courier_id = courier || null;
        }

        return {
          ...dataValues,
          courier_name: courierCache.courier_id || null,
        };
      })
    );

    res.success({ ...result, data: { ...result.data, result: resultData } });
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

    const existingRecord = await CourierPricingCardService.read({
      id: id,
    });
    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const { zone1, zone2, zone3, zone4, zone5 } = req.body;
    const payload = {
      id: id,
      zone1,
      zone2,
      zone3,
      zone4,
      zone5,
    };

    const result = await CourierPricingCardService.update({
      data: payload,
    });
    if (!result) {
      throw CourierPricingCardService.error;
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
    const result = await CourierPricingCardService.remove(query);
    if (!result) {
      throw CourierPricingCardService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
