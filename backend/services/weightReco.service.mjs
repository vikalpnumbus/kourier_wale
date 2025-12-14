import { Op, where } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import WeightRecoProducer from "../queue/producers/weightReco.producer.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("weightReco");
  }


   async create({ files, data }) {
      try {
        const { userId } = data;
        if (!files) {
          const error = new Error("No file found.");
          error.status = 400;
          throw error;
        }
  
        WeightRecoProducer.publishImportFile({
          files: files.map((e) => ({
            fileName: userId,
            file: e,
            dir: "weight",
          })),
          metadata: {
            id: userId,
          },
        });
  
        return {
          status: 200,
          data: {
            message: "Processing the weight file.",
          },
        };
      } catch (error) {
        this.error = error;
        return false;
      }
    }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, userId, start_date, end_date } = params;

      const whereClause = { [Op.and]: [] };

      if (userId) whereClause[Op.and].push({ userId });
      if (id) whereClause[Op.and].push({ id });
      // Date filters (ignore time)
      if (start_date) {
        whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.gte]: start_date }));
      }
      if (end_date) {
        whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.lte]: end_date }));
      }

      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.findOne(whereClause);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = 1;
        result = [result];
      } else {
        result = await this.repository.find(whereClause, { page, limit });
        totalCount = await this.repository.countDocuments(whereClause);

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

const WeightRecoService = new Service();
export default WeightRecoService;
