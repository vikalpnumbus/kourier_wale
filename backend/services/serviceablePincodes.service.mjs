import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";
import pincodeConfig from "../configurations/pincode.config.mjs";
import PincodeService from "./pincode.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("serviceablePincodes");
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
      const { page = 1, limit = 50, id, search, ...filters } = params;

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

  async bulkImport({ files, data }) {
    try {
      const { userId } = data;
      if (!files) {
        const error = new Error("No file found.");
        error.status = 400;
        throw error;
      }

      const fileBuffer = files[0]?.buffer;
      if (!fileBuffer) throw new Error("File buffer missing.");

      let rows = await readCsvAsArray(Buffer.from(fileBuffer));
      rows = await Promise.all(
        rows.map(async (e) => {
          let state = e["State "];
          const pincode = e["Delivery pincode serviceable for SWA"];

          if (!state) {
            const pincodeData = (await PincodeService.view(pincode))?.data;
            state = pincodeData?.state;
            e["State "] = state;
          }
          return {
            pincode,
            courier_id: 2,
            city: e["City"],
            state,
            state_code:
              pincodeConfig.indianStatesAndUTs[e["State "]?.toLowerCase()],
            cod: "Y",
            prepaid: "Y",
            pickup: "Y",
            is_reverse_pickup: "N",
          };
        })
      );

      rows = rows.filter((e) => e.state && e.state_code);

      await this.repository.bulkSave(rows);

      return {
        status: 200,
        data: {
          message: "Saved the records.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const ServiceablePincodesService = new Service();
export default ServiceablePincodesService;
