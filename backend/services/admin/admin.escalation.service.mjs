import { Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import EscalationConversationsModel from "../../model/escalationsConversations.sql.mode.mjs";
import EscalationModel from "../../model/escalation.sql.model.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("escalations");
    this.conversation_repository = FactoryRepository.getRepository(
      "escalations_conversations"
    );
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
      const {
        page = 1,
        limit = 50,
        id,
        assigneeId,
        userId,
        start_date,
        end_date,
      } = params;

      const whereClause = { [Op.and]: [] };

      const orGroup = [];

      if (userId) orGroup.push({ userId });
      if (assigneeId) orGroup.push({ assigneeId: assigneeId });

      if (orGroup.length > 0) {
        whereClause[Op.and].push({ [Op.or]: orGroup });
      }

      if (id) whereClause[Op.and].push({ id });
      // Date filters (ignore time)
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

  async update({ data }) {
    try {
      const existingRecordId = data.id;

      delete data.id;

      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        data
      );

      return {
        status: 201,
        data: {
          message: "Escalataion has been updated successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async conversation_create({ data }) {
    try {
      const { escalation_id, from, to, message, attachments } = data;
      const savedRecord = await this.conversation_repository.save({
        escalation_id,
        from,
        to,
        message,
        attachments,
      });
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

  async conversation_read(params) {
    try {
      const {
        page = 1,
        limit = 50,
        id,
        escalation_id,
        start_date,
        end_date,
      } = params;

      const whereClause = { [Op.and]: [] };

      if (escalation_id) whereClause[Op.and].push({ escalation_id });
      if (id) whereClause[Op.and].push({ id });
      // Date filters (ignore time)
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

      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let result;
      let totalCount;

      if (id) {
        result = await this.conversation_repository.findOne(whereClause);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = 1;
        result = [result];
      } else {
        result = await this.conversation_repository.find(whereClause, {
          page,
          limit,
        });
        totalCount = await this.conversation_repository.countDocuments(
          whereClause
        );

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
