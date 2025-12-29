import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("walletHistory");
  }

  async create(data) {
    try {
      const { userId, event_type, amount, payment_type, logs } = data;

      const payload = {
        userId,
        event_type,
        amount,
        payment_type,
        logs,
      };
      const result = await this.repository.save(payload);

      return {
        status: 201,
        data: {
          message: "Wallet History has been created successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      console.error("error: ", error);
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, start_date, end_date, userId } = params;
      
      const whereClause = { [Op.and]: [{event_type:'payment_done'}] };
      
      // Direct equality filters
      if (userId) whereClause[Op.and].push({ userId });
      if (id) whereClause[Op.and].push({ id });

      if (start_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.gte]: start_date })
        );
      }
      if (end_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.lte]: end_date })
        );
      }

      // If no conditions were added, remove Op.and
      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(whereClause);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = Array.isArray(result) ? result.length : 1;
        result = Array.isArray(result) ? result : [result];
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

const WalletHistoryService = new Service();
export default WalletHistoryService;
