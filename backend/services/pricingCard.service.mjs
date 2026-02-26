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
    const {
      origin,
      destination,
      weight,
      length,
      breadth,
      height,
      paymentType,
      userId,
    } = data;

    /* -------------------- WEIGHT CALCULATION -------------------- */
    const volumetricDivisor = 5000;

    const deadWeight = CustomMath.roundOff(Number(weight) || 0);

    const volumetricWeight = CustomMath.roundOff(
      ((Number(length) || 0) *
        (Number(breadth) || 0) *
        (Number(height) || 0) *
        1000) /
        volumetricDivisor
    );

    const finalWeight = Math.max(deadWeight, volumetricWeight);

    const calculatedZone = this.calculateZone(origin, destination);

    /* -------------------- USER & COURIER MAPPING -------------------- */
    const [userRes, userCourierRes] = await Promise.all([
      UserService.read({ id: userId }),
      UserCourierService.read({ userId }),
    ]);

    const plan_id = userRes?.pricingPlanId;
    if (!plan_id) {
      throw new Error(`No pricing plan found for userId ${userId}`);
    }

    /* -------------------- PRICING CARD -------------------- */
    let pricingCard = (await this.read({ plan_id }))?.data?.result || [];
    if (!pricingCard.length) {
      throw new Error("Pricing card empty or not found");
    }

    /* -------------------- USER COURIERS -------------------- */
    const userCourierRows = userCourierRes?.data?.result || [];

    const userCouriers = userCourierRows.flatMap((row) => {
      if (!row?.assigned_courier_ids) return [];
      return String(row.assigned_courier_ids)
        .split(",")
        .map((x) => x.trim());
    });

    if (!userCouriers.length) {
      throw new Error("No couriers assigned to user");
    }

    /* -------------------- FILTER PRICING CARD BY USER COURIERS -------------------- */
    pricingCard = pricingCard.filter((row) =>
      userCouriers.includes(String(row.courier_id))
    );

    if (!pricingCard.length) {
      throw new Error("No available pricing plans for assigned couriers");
    }

    /* -------------------- FORWARD + WEIGHT PLANS -------------------- */
    const filteredPlans = pricingCard.filter(
      (row) => row.type === "forward" || row.type === "weight"
    );

    const courierCache = {};

    const validPlans = (
      await Promise.all(
        filteredPlans.map(async (row) => {
          if (!courierCache[row.courier_id]) {
            courierCache[row.courier_id] = Promise.all([
              CourierService.read({ id: row.courier_id }),
              ServiceablePincodesService.read({
                courier_id: row.courier_id,
                pincode: origin,
              }),
              ServiceablePincodesService.read({
                courier_id: row.courier_id,
                pincode: destination,
              }),
            ]);
          }

          const [
            courierRes,
            pickupRes,
            deliveryRes,
          ] = await courierCache[row.courier_id];

          const courier = courierRes?.data?.result?.[0];
          const pickupPincode = pickupRes?.data?.result?.[0];
          const deliveryPincode = deliveryRes?.data?.result?.[0];

          // pincode / courier validation
          if (!courier || !pickupPincode || !deliveryPincode) return null;

          // COD validation
          if (
            paymentType?.toLowerCase() === "cod" &&
            deliveryPincode.cod?.toLowerCase() !== "y"
          ) {
            return null;
          }

          return {
            courier_id: row.courier_id,
            plan: {
              ...row.dataValues,
              name: courier.name,
              weight: courier.weight,
              additional_weight: courier.additional_weight,
              show_to_users: courier.show_to_users,
            },
          };
        })
      )
    ).filter(Boolean);

    if (!validPlans.length) {
      return {
        rows: [],
        message:
          paymentType === "cod"
            ? "COD not serviceable for this pincode"
            : "No courier available for this pincode",
      };
    }

    /* -------------------- GROUP BY COURIER -------------------- */
    const groupedPlans = validPlans.reduce((acc, { courier_id, plan }) => {
      if (!acc[courier_id]) acc[courier_id] = [];
      acc[courier_id].push(plan);
      return acc;
    }, {});

    /* -------------------- PRICE CALCULATION -------------------- */
    const rows = Object.keys(groupedPlans)
      .map((courierId) => {
        const plans = groupedPlans[courierId];

        const basePlan = plans.find((p) => p.type === "forward");
        const weightPlan = plans.find((p) => p.type === "weight");

        if (!basePlan) return null;

        const basePrice = Number(basePlan[calculatedZone] || 0);
        const additionalWeight = weightPlan?.additional_weight || 0;
        const additionalPrice = Number(weightPlan?.[calculatedZone] || 0);

        const extraWeight = Math.max(finalWeight - basePlan.weight, 0);
        const multiplier =
          additionalWeight > 0
            ? Math.ceil(extraWeight / additionalWeight)
            : 0;

        let totalPrice = basePrice + multiplier * additionalPrice;

        let codCharge = 0;
        if (paymentType === "cod") {
          const percentCharge = (totalPrice * basePlan.cod_percentage) / 100;
          codCharge = Math.max(percentCharge, basePlan.cod || 0);
          totalPrice += codCharge;
        }

        return {
          courier_id: basePlan.courier_id,
          courier_name: basePlan.name,
          freight_charge: basePrice,
          cod_charge: codCharge,
          total: CustomMath.roundOff(totalPrice),
          zone: calculatedZone,
          chargeable_weight: finalWeight,
        };
      })
      .filter(Boolean);

    return { rows };
  }
}

const PricingCardService = new Service();
export default PricingCardService;
