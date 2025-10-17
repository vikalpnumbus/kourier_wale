import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import pincodeConfig from "../configurations/pincode.config.mjs";

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
      const { page = 1, limit = 50, id, search, ...filters } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }

      if (search) {
        where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
      }

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.findOne(where);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = 1;
        result = [result];
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
}

const PricingCardService = new Service();
export default PricingCardService;
