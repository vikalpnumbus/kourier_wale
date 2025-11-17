import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("courierPricingCard");
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
          message: "Pricing card has been updated successfully.",
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
      const { page = 1, limit = 50, id, search, courier_id, ...filters } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }

      if (search) {
        where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
      }
      if (courier_id) {
        where.courier_id = courier_id;
      }

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
}

const CourierPricingCardService = new Service();
export default CourierPricingCardService;
