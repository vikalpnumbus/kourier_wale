import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import pincodeConfig from "../configurations/pincode.config.mjs";
import CustomMath from "../utils/basic.utils.mjs";
import UserService from "./user.service.mjs";
import UserCourierService from "./userCourier.service.mjs";
import CourierService from "./courier.service.mjs";
import ServiceablePincodesService from "./serviceablePincodes.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("pricingCard");
  }

  async create({ data }) {
    try {
      await this.repository.save(data);
      return {
        status: 201,
        data: {
          message: "Pricing card has been created successfully.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ data }) {
    try {
      const existingRecordId = data.id;

      delete data.id;

      let payload = { ...data };

      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        payload
      );

      return {
        status: 201,
        data: {
          message: "Plan card has been updated successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const {
        page = 1,
        limit = 50,
        id,
        search,
        courier_id,
        plan_id,
        ...filters
      } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }

      if (search) {
        where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
      }
      if (courier_id) where.courier_id = courier_id;
      if (plan_id) where.plan_id = plan_id;

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(where);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = 1;
      } else {
        result = await this.repository.find(where, { page, limit });
        totalCount = await this.repository.countDocuments(where);

        if (!result || result.length === 0) {
          const error = new Error("No records found.");
          error.status = 404;
          throw error;
        }
      }

      return { data: { total: totalCount, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async remove(params) {
    try {
      const result = await this.repository.findOneAndDelete(params);

      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      return { data: { message: "Deleted successfully." } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  /**
   * @param {string} origin
   * @param {string} destination
   */

  calculateZone(origin, destination) {
    try {
      if (!origin || !destination)
        throw new Error("Origin and Destination pincodes are required.");

      const origin_two_digit = origin.toString().substring(0, 2);
      const destination_two_digit = destination.toString().substring(0, 2);

      const origin_three_digit = origin.toString().substring(0, 3);
      const destination_three_digit = destination.toString().substring(0, 3);

      const states = pincodeConfig.pincode_states;
      const zone_5_pincodes = pincodeConfig.zone_5_pincodes;
      const delhi_ncr_pincodes = pincodeConfig.delhi_ncr_pincodes;
      const metro_cities_pincodes = pincodeConfig.metro_cities_pincodes;

      if (!states[origin_two_digit] || !states[destination_two_digit])
        throw new Error("Cannot find state with this pincode.");

      //check if any pin code is zone 5. Origin or Desitnation is in zone 5
      if (
        zone_5_pincodes.includes(origin_two_digit) ||
        zone_5_pincodes.includes(destination_two_digit)
      ) {
        return "zone5";
      }

      //check if both codes are in delhi ncr
      if (
        delhi_ncr_pincodes.includes(origin_three_digit) &&
        delhi_ncr_pincodes.includes(destination_three_digit)
      ) {
        return "zone1";
      }

      // check if courier is within city
      if (origin_three_digit == destination_three_digit) {
        return "zone1";
      }

      // check if courier is within state
      if (origin_two_digit == destination_two_digit) {
        return "zone2";
      }

      //check if both pincodes are metro to metro
      if (
        metro_cities_pincodes.includes(origin.toString()) &&
        metro_cities_pincodes.includes(destination.toString())
      ) {
        return "zone3";
      }

      return "zone4";
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async priceCalculator(data) {
    let {
      origin,
      destination,
      weight,
      length,
      breadth,
      height,
      paymentType,
      userId,
    } = data;
    const volumetricDivisor = 5000;
    const deadWeight = CustomMath.roundOff(weight);

    const calculatedZone = this.calculateZone(origin, destination);

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
        id: userId,
      })
    )?.pricingPlanId;

    let pricingCard = (await this.read({ plan_id }))?.data?.result;

    if (!pricingCard || pricingCard.length == 0) {
      const error = new Error(
        "Error fetching Pricing Card details or it is empty.."
      );
      error.status = 400;
      throw error;
    }

    const userCouriers = (
      await UserCourierService.read({ id: userId })
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
          const courierDetails = (
            await CourierService.read({ id: e.courier_id })
          )?.data?.result?.[0];

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

      data["courier_id"] = currentCourier[0].id;
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
        data["additionalWeight"] =
          additionalWeightDetails.additional_weight || 0;
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
        courier_id: data.courier_id,
        courier_name: data.courier_name,
        cod_charge: Math.max(data.codPercentagePrice, data.cod_amount),
        freight_charge: data.zoneBasePrice,
        total: data.totalPrice,
        zone: data.calculatedZone,
      };
    });

    return {
      rows,
    };
  }
}

const PricingCardService = new Service();
export default PricingCardService;
