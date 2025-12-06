import { Op } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import CourierService from "./courier.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("courierAWBList");
  }

  async create({ data }) {
    try {
      const { awb_number } = data;
      await [...new Set(awb_number)].map(async (e) => {
        return await this.repository.save({ ...data, awb_number: e });
      });

      return {
        status: 201,
        data: {
          message: "Record has been created successfully.",
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
          message: "Record has been updated successfully.",
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
        awb_number,
        mode,
        courier_id,
      } = params;

      // Build where condition
      const whereClause = { [Op.and]: [] };

      if (id) whereClause[Op.and].push({ id });
      if (awb_number) whereClause[Op.and].push({ awb_number });
      if (mode) whereClause[Op.and].push({ mode });
      if (courier_id) whereClause[Op.and].push({ courier_id });
      if(!id)whereClause[Op.and].push({used:false})

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
        totalCount = result.length;
      } else {
        result = await this.repository.find(whereClause, { page, limit });
        totalCount = await this.repository.countDocuments(whereClause);

        if (!result || result.length === 0) {
          const error = new Error("No records found.");
          error.status = 404;
          throw error;
        }
      }

      const courierCache = {};

      let resultData = await Promise.all(
        result?.map(async (e) => {
          const { courier_id } = e;

          if (courier_id && !courierCache.courier_id) {
            const courier = (await CourierService.read({ id: courier_id }))
              ?.data?.result?.[0]?.name;
            courierCache.courier_id = courier || null;
          }

          return {
            ...e.dataValues,
            courier_name: courierCache.courier_id || null,
          };
        })
      );
      return { data: { total: totalCount, result: resultData } };
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

  async readAndUpdateNextAvailable(params) {
    console.log('params: ', params);
    try {
      return await sqlDB.sequelize.transaction(async (t) => {
        // Step 1: Lock one available AWB row
        const awb = await this.repository.findOne({
          where: params,
          order: [["id", "DESC"]],
          lock: t.LOCK.UPDATE, // Prevent others from reading this row concurrently
          transaction: t,
        });
        
        console.log('awb: ', awb);
        if (!awb) {
          throw new Error("No available AWB numbers.");
        }
        
        // Step 2: Mark it as used
        awb.used = true;
        await awb.save({ transaction: t });
        return awb;
      });
    } catch (error) {
      console.log('error: ', error);
      this.error = error;
      console.error(error);
      return false;
    }
  }
}

const CourierAWBListService = new Service();
export default CourierAWBListService;
