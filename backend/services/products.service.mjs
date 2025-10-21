import { Op } from "sequelize";
import ProductsProducer from "../queue/producers/products.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("products");
  }

  async create({ files, data }) {
    try {
      const {
        userId,
        name,
        sku,
        category,
        price,
        channel_name,
        channel_product_id,
      } = data;

      const payload = {
        userId,
        name,
        sku,
        category,
        price,
        channel_name:channel_name||null,
        channel_product_id:channel_product_id||null,
      };
      const result = await this.repository.save(payload);

      if (files) {
        ProductsProducer.publish({
          files: files.map((e) => ({
            imageName: data.userId,
            image: e,
            dir: "products",
          })),
          metadata: {
            id: result.id,
          },
        });
      }
      return {
        status: 201,
        data: {
          message: "Product has been created successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ files, data }) {
    try {
      const { userId, name, sku, category } = data;

      let payload = {
        userId,
        name,
        sku,
        category,
      };

      if (files) {
        ProductsProducer.publish({
          files: files.map((e) => ({
            imageName: data.userId,
            image: e,
            dir: "products",
          })),
          metadata: {
            id: data.id,
          },
        });
      }

      const existingRecordId = data.id;

      delete data.id;

      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        payload
      );

      return {
        status: 201,
        data: {
          message: "Product has been updated successfully.",
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
        name,
        sku,
        category,
        ...filters
      } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }
      let searchQueries = [];

      if (name) {
        searchQueries.push(...[{ name: { [Op.like]: `%${name}%` } }]);
      }
      if (sku) {
        searchQueries.push(...[{ sku: { [Op.like]: `%${sku}%` } }]);
      }
      if (category) {
        searchQueries.push(...[{ category: { [Op.like]: `%${category}%` } }]);
      }

      where[Op.and] = searchQueries;
      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(where);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = Array.isArray(result) ? result.length : 1;
        result = Array.isArray(result) ? result : [result];
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
      if (files) {
        ProductsProducer.publishImportFile({
          files: files.map((e) => ({
            fileName: userId,
            file: e,
            dir: "products",
          })),
          metadata: {
            id: userId,
          },
        });
      }

      return {
        status: 200,
        data: {
          message: "Importing the products.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const ProductsService = new Service();
export default ProductsService;
