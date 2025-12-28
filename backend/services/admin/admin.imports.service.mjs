import { Op } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import AdminImportsProducer from "../../queue/producers/admin/admin.imports.producer.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("exportJobs");
  }

  async create({ userId, type, file }) {
    try {
      const importJob = await this.repository.save({ userId, type: `import_${type}` });
      await AdminImportsProducer.publishData({ type, file, importJobId: importJob?.id });
      return {
        data: `Your import request is being processed with id ${importJob?.id}`,
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

const ImportsService = new Service();
export default ImportsService;
