import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import CourierService from "./courier.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("userCourier");
  }

  async create({ data }) {
    try {
      const savedRecord = await this.repository.save(data);
      return {
        status: 201,
        data: {
          message: "User Courier has been created successfully.",
          id: savedRecord.id,
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

      const result = await this.repository.findOneAndUpdate({ id: existingRecordId }, payload);

      return {
        status: 201,
        data: {
          message: "User Courier has been updated successfully.",
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
        result = [result]; // wrap in array for consistency
      } else {
        result = await this.repository.find(where, { page, limit });
        totalCount = await this.repository.countDocuments(where);

        if (!result || result.length === 0) {
          const error = new Error("No records found.");
          error.status = 404;
          throw error;
        }
      }
      const courierCache = {};
      const getCourier = async (id) => {
        if (courierCache[id]) return courierCache[id];
        return await CourierService.read({ id });
      };

      console.log('result: ', result);
      result = await Promise.all(
        result.map(async (curr) => {
          const { assigned_courier_ids } = curr;
          let transformedAssignedCouriers = await Promise.all(
            assigned_courier_ids?.split(",")?.map(async (courierID) => {
              const courierRes = await getCourier(courierID);
              if (!courierCache[courierID]) courierCache[courierID] = courierRes;
              if (!courierRes?.data?.result?.[0]?.name)
                return {
                  id: courierID,
                  error: "This courier does not exist in our system.",
                };
              return {
                id: courierID,
                courier_name: courierRes?.data?.result?.[0]?.name,
              };
            })
          );
          return { ...curr?.dataValues, assigned_courier_ids: transformedAssignedCouriers };
        })
      );
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

const UserCourierService = new Service();
export default UserCourierService;
