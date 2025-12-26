import { Op } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import AdminExportsProducer from "../../queue/producers/admin/admin.exports.producer.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("exportJobs");
  }

  async create({ userId, type, format, filters }) {
    try {
      const exportJob = await this.repository.save({ userId, type, filters });
      await AdminExportsProducer.publishData({ type, filters, exportJobId: exportJob?.id });
      return {
        data: `Your export request is being processed with id ${exportJob?.id}`,
      };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }

  async read(params) {
    const { id, page, limit, userId } = params;

    try {
      const whereClause = { [Op.and]: [] };
      if (id) whereClause[Op.and].push({ id });
      if (userId) whereClause[Op.and].push({ userId });

      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let result = await this.repository.find(whereClause, { page, limit });
      let totalCount = await this.repository.countDocuments(whereClause);

      if (!result || result?.length == 0) {
        result = [];
        totalCount = 0;
      }

      return {
        data: { total: totalCount, result },
      };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }
}

const ExportsService = new Service();
export default ExportsService;
