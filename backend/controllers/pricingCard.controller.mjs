import PricingPlansService from "../services/pricingPlans.service.mjs";
import PricingCardService from "../services/pricingCard.service.mjs";
import CourierService from "../services/courier.service.mjs";
import CustomMath from "../utils/basic.utils.mjs";
import UserService from "../services/user.service.mjs";
import UserCourierService from "../services/userCourier.service.mjs";
import CourierPricingCardService from "../services/courierPricingCard.service.mjs";
import ServiceablePincodesService from "../services/serviceablePincodes.service.mjs";

export const create = async (req, res, next) => {
  try {
    const { plan_id, courier_id, type } = req.body;
    const isExist = await PricingCardService.read({
      plan_id,
      courier_id,
      type,
    });

    if (isExist) {
      const error = new Error("Plan card already exists.");
      error.status = 400;
      throw error;
    }

    const isCourierPricingExist = await CourierPricingCardService.read({
      courier_id,
      type,
    });

    if (!isCourierPricingExist) {
      const error = new Error("Courier Plan card does not exist.");
      error.status = 400;
      throw error;
    }

    const isPlanExist = await PricingPlansService.read({ id: plan_id });

    if (!isPlanExist) {
      const error = new Error("Pricing plan does not exist.");
      error.status = 400;
      throw error;
    }

    const isCourierExist = await CourierService.read({ id: courier_id });
    if (!isCourierExist) {
      const error = new Error("Courier does not exist.");
      error.status = 400;
      throw error;
    }

    const result = await PricingCardService.create({
      data: req.body,
    });
    if (!result) {
      throw PricingCardService.error;
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
      courier_id: req.query.courier_id,
      id: req.params.id || undefined,
      plan_id: req.query?.plan_id,
    };

    const userId = req.user.id;
    const userData = await UserService.read({ id: userId });
    const userPricingPlanId = userData?.pricing_plan_id;
    if (userData.role == "user") {
      query.plan_id = userPricingPlanId;
    }
    const result = await PricingCardService.read(query);

    if (!result) {
      throw PricingCardService.error;
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

    const existingRecord = await PricingCardService.read({
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

    const result = await PricingCardService.update({
      data: payload,
    });
    if (!result) {
      throw PricingCardService.error;
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
    const result = await PricingCardService.remove(query);
    if (!result) {
      throw PricingCardService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const priceCalculator = async (req, res, next) => {
  const start = process.hrtime.bigint();

  let { origin, destination, weight, length, breadth, height, paymentType } =
    req.body;

  let { id: userId } = req.user;
  const result = await PricingCardService.priceCalculator({
    origin,
    destination,
    weight,
    length,
    breadth,
    height,
    paymentType,
    userId,
  });
  const end = process.hrtime.bigint();
  console.log(
    `API Execution Time: ${(Number(end - start) / 1e6).toFixed(2)} ms`
  );

  return res.success({ data: result });
};
