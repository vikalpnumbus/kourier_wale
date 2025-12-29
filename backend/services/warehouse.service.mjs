import { Op } from "sequelize";
import WarehouseProducer from "../queue/producers/warehouse.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("warehouse");
  }

  async create({ data }) {
    try {
      const result = await this.repository.save(data);

      return {
        status: 201,
        data: {
          message: "Warehouse has been created successfully.",
          id: result.id,
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

      if (data.isPrimary) {
        await this.repository.updateMany(
          { userId: data.userId },
          { isPrimary: false }
        );
      }

      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        data
      );

      return {
        status: 201,
        data: {
          message: "Warehouse has been updated successfully.",
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
        where[Op.or] = search
          .split(",")
          .map((e) => ({ name: { [Op.like]: `%${e.trim()}%` } }));
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
        totalCount = result.length;
        result = result; // wrap in array for consistency
      } else {
        result = await this.repository.find(where, { page, limit });
        totalCount = await this.repository.countDocuments(where);
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

      WarehouseProducer.publishImportFile({
        files: files.map((e) => ({
          fileName: userId,
          file: e,
          dir: "warehouse",
        })),
        metadata: {
          id: userId,
        },
      });

      return {
        status: 200,
        data: {
          message: "Importing the warehouse.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const WarehouseService = new Service();
export default WarehouseService;
