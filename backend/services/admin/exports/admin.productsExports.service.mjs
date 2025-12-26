import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../../repositories/factory.repository.mjs";
import ProductsService from "../../products.service.mjs";
import ChannelService from "../../channel.service.mjs";
import sqlDB, { mysqlConnection } from "../../../configurations/sql.config.mjs";
import { stringify } from "csv-stringify";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { Transform } from "stream";

const queryGenerator = sqlDB.sequelize.getQueryInterface().queryGenerator;

class Service {
  constructor() {
    this.MAX_PRODUCTS = 5;
    this.BATCH_SIZE = 50;
    this.exportJobRepository = FactoryRepository.getRepository("exportJobs");
    this.error = null;
  }

  buildWhereClause(params) {
    const { id, name, sku, category, start_date, end_date } = params;

    let whereClause = { [Op.and]: [] };

    if (id) whereClause[Op.and].push({ id });

    if (name) whereClause[Op.and].push({ name: { [Op.like]: `%${name}%` } });
    if (sku) whereClause[Op.and].push({ sku: { [Op.like]: `%${sku}%` } });
    if (category) whereClause[Op.and].push({ category: { [Op.like]: `%${category}%` } });

    if (start_date) {
      whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.gte]: start_date }));
    }
    if (end_date) {
      whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.lte]: end_date }));
    }

    // If no conditions were added, remove Op.and
    if (!whereClause[Op.and].length) delete whereClause[Op.and];
    return whereClause;
  }
  async getData({ filters, exportJobId }) {
    try {
      let whereClause = this.buildWhereClause(filters);
      const whereSQL = queryGenerator.getWhereConditions(whereClause, "products");
      const sql = `SELECT * FROM products ${whereSQL ? `WHERE ${whereSQL}` : ""} ORDER BY id DESC`;
      console.log("sql: ", sql);
      const countQuery = `SELECT count(*) FROM products ${whereSQL ? `WHERE ${whereSQL}` : ""}`;
      const [rows] = await mysqlConnection.promise().query(countQuery);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "processing", total_count: rows?.[0]?.["count(*)"] });

      let columns = ["User ID", "Product ID", "Name", "SKU", "Price", "Category"];

      for (let i = 1; i <= AdminProductsExportsHandler.MAX_PRODUCTS; i++) {
        columns.push(`Product Image ${i}`);
      }

      const csvStream = stringify({
        header: true,
        columns,
      });

      const dbStream = mysqlConnection.query(sql).stream({ highWaterMark: 1000 });
      let processed_count = 0;
      const transformStream = new Transform({
        objectMode: true,
        async transform(e, _, callback) {
          ++processed_count;
          if (processed_count % AdminProductsExportsHandler.BATCH_SIZE === 0) {
            await AdminProductsExportsHandler.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count });
          }

          let row = {
            "User ID": e.userId,
            "Product ID": e.id,
            Category: e.category,
            Name: e.name,
            SKU: e.sku,
            Price: e.price,
          };

          for (let i = 0; i < AdminProductsExportsHandler.MAX_PRODUCTS; i++) {
            const p = e?.productImage?.[i];

            row[`Product Image ${i + 1}`] = p ?? "";
          }

          callback(null, row);
        },
      });

      const dir = path.join("uploads", "exports", "products");
      fs.mkdirSync(dir, { recursive: true });

      const uploadPath = path.join(dir, `${Date.now()}.products.csv`);

      const fileStream = fs.createWriteStream(uploadPath);

      await pipeline(dbStream, transformStream, csvStream, fileStream);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count, status: "completed", file_url: uploadPath });

      return dbStream;
    } catch (error) {
      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "failed", error: error?.message || "Some error occured" });
      throw error;
    }
  }
}

const AdminProductsExportsHandler = new Service();
export default AdminProductsExportsHandler;
