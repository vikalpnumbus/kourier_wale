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
    console.log('calculatedZone: ', calculatedZone);

    const volumetricWeight = CustomMath.roundOff(
      (CustomMath.roundOff(length) *
        CustomMath.roundOff(breadth) *
        CustomMath.roundOff(height) *
        1000.0) /
        volumetricDivisor
    );

    const finalWeight = Math.max(volumetricWeight, deadWeight);

    const [UserServiceRes, UserCourierServiceRes] = await Promise.all([
      await UserService.read({
        id: userId,
      }),
      await UserCourierService.read({ userId }),
    ]);

    const plan_id = UserServiceRes?.pricingPlanId;
    console.log('plan_id: ', plan_id);

    if (!plan_id) throw new Error("No pricing plan found for userId." + userId);

    let pricingCard = (await this.read({ plan_id }))?.data?.result;
    console.log('pricingCard: ', pricingCard);

    if (!pricingCard || pricingCard.length == 0) {
      const error = new Error(
        "Error fetching Pricing Card details or it is empty.."
      );
      error.status = 400;
      throw error;
    }

    const userCouriers = UserCourierServiceRes?.data?.result?.flatMap((e) =>
      e.assigned_courier_ids.map((curr) => curr.id.trim())
  );
  
    if (!userCouriers || userCouriers.length == 0) {
      const error = new Error(
        "Error fetching user courier details or it is empty."
      );
      error.status = 400;
      throw error;
    }

    console.log("userCouriers: ", userCouriers);

    // filter-in all the couriers which are  available to the user.
    pricingCard = pricingCard?.filter((e) =>
      userCouriers?.includes(e.courier_id + "")
    );

    if (!pricingCard || pricingCard.length == 0) {
      throw new Error("No available plans.");
    }

    console.log(
      "pricingCard: ",
      pricingCard.map((e) => e.dataValues)
    );
    const filteredForwardPlans = pricingCard.filter(
      (e) => e.type === "forward" || e.type === "weight"
    );

    console.log(
      "filteredForwardPlans: ",
      filteredForwardPlans.map((e) => e.dataValues)
    );

    const courierCache = {};

    const forwardPlanResults = (
      await Promise.all(
        filteredForwardPlans.map(async (e) => {
          let courierPromise;

          if (courierCache[e.courier_id]) {
            courierPromise = courierCache[e.courier_id];
          } else {
            // Store the PROMISE immediately → ensures parallel fetching
            courierPromise = CourierService.read({ id: e.courier_id });
            courierCache[e.courier_id] = courierPromise;
          }

          const [courierDetailsRes, pincodeServiceabilityDetailsRes] =
            await Promise.all([
              await CourierService.read({ id: e.courier_id }),
              await ServiceablePincodesService.read({
                courier_id: e.courier_id,
              }),
            ]);
          const courierDetails = courierDetailsRes?.data?.result?.[0];
          console.log('courierDetails: ', courierDetails);
          const { name, weight, additional_weight, show_to_users } =
            courierDetails;

          const pincodeServiceabilityDetails =
            pincodeServiceabilityDetailsRes?.data?.result?.[0];

          console.log("courier_id: ", e.courier_id, name, {
            courier_id: e.courier_id,
            plan: {
              ...e.dataValues,
              name,
              weight,
              additional_weight,
              show_to_users,
            },
          });
          console.log(
            "pincodeServiceabilityDetails: ",
            pincodeServiceabilityDetails
          );
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

    console.log("forwardPlanResults: ", forwardPlanResults);
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
      console.log('currentCourier: ', currentCourier);
      const firstEntry = currentCourier.filter(curr=>curr.type == "forward")?.[0];
      console.log('firstEntry: ', firstEntry);

      data["courier_id"] = firstEntry.courier_id;
      data["courier_name"] = firstEntry.name;
      data["cod_amount"] = CustomMath.roundOff(firstEntry.cod);
      data["cod_percentage"] = CustomMath.roundOff(firstEntry.cod_percentage);

      let baseWeightDetails, additionalWeightDetails;

      for (const row of currentCourier) {
        if (row.type == "forward") baseWeightDetails = row;
        else if (row.type === "weight") additionalWeightDetails = row;
      }

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


      const multiplier = Math.floor(leftWeight / data.additionalWeight);

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
console.log('courierCache', JSON.stringify(courierCache, null, 2))
    return {
      rows,
    };
  }
}

const PricingCardService = new Service();
export default PricingCardService;
