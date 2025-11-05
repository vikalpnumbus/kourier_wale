import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("escalations");
  }

  async create({ data }) {
    try {
      const savedRecord = await this.repository.save(data);
      return {
        status: 201,
        data: {
          message: "Record has been created successfully.",
          id: savedRecord.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, ...filters } = params;

      let where = { ...filters };

      if (id) {
        where.id = id;
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
}

const EscalationService = new Service();
export default EscalationService;
