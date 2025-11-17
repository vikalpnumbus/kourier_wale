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
    };

    const userId = req.user.id;
    const userPricingPlanId = (await UserService.read({ id: userId }))
      ?.pricingPlanId;
    query.plan_id = userPricingPlanId;
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
  let { origin, destination, weight, length, breadth, height, paymentType } =
    req.body;
  const volumetricDivisor = 5000;
  const deadWeight = CustomMath.roundOff(weight);

  const calculatedZone = PricingCardService.calculateZone(origin, destination);

  const volumetricWeight = CustomMath.roundOff(
    (CustomMath.roundOff(length) *
      CustomMath.roundOff(breadth) *
      CustomMath.roundOff(height) *
      1000.0) /
      volumetricDivisor
  );

  const finalWeight = Math.max(volumetricWeight, deadWeight);

  const plan_id = (
    await UserService.read({
      id: req.user.id,
    })
  )?.pricingPlanId;

  let pricingCard = (await PricingCardService.read({ plan_id }))?.data?.result;

  if (!pricingCard || pricingCard.length == 0) {
    const error = new Error(
      "Error fetching Pricing Card details or it is empty.."
    );
    error.status = 400;
    throw error;
  }

  const userCouriers = (
    await UserCourierService.read({ id: req.user.id })
  )?.data?.result?.flatMap((e) =>
    e.assigned_courier_ids.split(",").map((curr) => curr.trim())
  );

  if (!userCouriers || userCouriers.length == 0) {
    const error = new Error(
      "Error fetching user courier details or it is empty."
    );
    error.status = 400;
    throw error;
  }

  // filter-in all the couriers which are  available to the user.
  pricingCard =
    pricingCard?.filter((e) => userCouriers?.includes(e.courier_id + "")) ||
    pricingCard;

  if (!pricingCard || pricingCard.length == 0) {
    throw new Error("No available plans.");
  }

  const filteredForwardPlans = pricingCard.filter(
    (e) => e.type === "forward" || e.type === "weight"
  );

  const forwardPlanResults = (
    await Promise.all(
      filteredForwardPlans.map(async (e) => {
        const courierDetails = (await CourierService.read({ id: e.courier_id }))
          ?.data?.result?.[0];

        const { name, weight, additional_weight, show_to_users } =
          courierDetails;

        const pincodeServiceabilityDetails = (
          await ServiceablePincodesService.read({ courier_id: e.courier_id })
        )?.data?.result?.[0];

        if (!pincodeServiceabilityDetails) return null;

        if (
          paymentType?.toLowerCase() == "cod" &&
          pincodeServiceabilityDetails.cod?.toLowerCase() != "y"
        )
          return null;

        return {
          courier_id: e.courier_id,
          plan: {
            ...e.dataValues,
            name,
            weight,
            additional_weight,
            show_to_users,
          },
        };
      })
    )
  )?.filter((e) => e != null);

  // Group by courier_id
  const forwardPlans = forwardPlanResults.reduce(
    (acc, { courier_id, plan }) => {
      if (!acc[courier_id]) acc[courier_id] = [];
      acc[courier_id].push(plan);
      return acc;
    },
    {}
  );

  const rows = Object.keys(forwardPlans).map((courierId) => {
    const data = { courierId, finalWeight };

    const currentCourier = forwardPlans[courierId];

    data["courier_name"] = currentCourier[0].name;
    data["cod_amount"] = CustomMath.roundOff(currentCourier[0].cod);
    data["cod_percentage"] = CustomMath.roundOff(
      currentCourier[0].cod_percentage
    );

    const baseWeightDetails = currentCourier.filter(
      (e) => e.type == "forward"
    )?.[0];
    const additionalWeightDetails = currentCourier.filter(
      (e) => e.type == "weight"
    )?.[0];

    data["calculatedZone"] = calculatedZone;
    if (baseWeightDetails) {
      const zoneBasePrice = baseWeightDetails[calculatedZone];

      data["zoneBasePrice"] = zoneBasePrice;
      data["baseWeight"] = baseWeightDetails.weight;
    }

    if (additionalWeightDetails) {
      const zoneAdditionalPrice = additionalWeightDetails[calculatedZone];

      data["zoneAdditionalPrice"] = CustomMath.roundOff(zoneAdditionalPrice);
      data["additionalWeight"] = additionalWeightDetails.additional_weight || 0;
    }

    const calculatedBasePrice = CustomMath.roundOff(data.zoneBasePrice);
    const leftWeight = data.finalWeight - data.baseWeight;
    data["calculatedBasePrice"] = calculatedBasePrice;
    data["leftWeight"] = leftWeight;

    const multiplier = Math.floor(leftWeight / data.additionalWeight);
    data["tempWeight1"] = data.additionalWeight * multiplier;
    data["calc1"] = multiplier * data.zoneAdditionalPrice;
    data["tempWeight2"] = leftWeight - data.additionalWeight * multiplier;
    data["calc2"] = data.zoneAdditionalPrice;
    const calculatedAdditionalPrice =
      multiplier * data.zoneAdditionalPrice +
      (leftWeight - data.additionalWeight * multiplier > 0
        ? data.zoneAdditionalPrice
        : 0);
    data["calculatedAdditionalPrice"] = calculatedAdditionalPrice;

    let totalPrice = calculatedBasePrice + calculatedAdditionalPrice;
    if (paymentType == "cod") {
      const codPercentage = CustomMath.roundOff(
        (totalPrice * data.cod_percentage) / 100
      );
      data["codPercentagePrice"] = codPercentage;
      totalPrice += Math.max(codPercentage, data.cod_amount);
    }
    data["totalPrice"] = totalPrice;

    return {
      courier_name: data.courier_name,
      cod_charge: Math.max(data.codPercentagePrice, data.cod_amount),
      freight_charge: data.zoneBasePrice,
      total: data.totalPrice,
      zone: data.calculatedZone,
    };
  });

  res.success({
    data: {
      rows,
    },
  });
};
