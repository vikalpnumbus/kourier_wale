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
import CourierService from "../../courier.service.mjs";
import { formatDate_DD_MM_YYYY_HH_MM } from "../../../utils/basic.utils.mjs";

const queryGenerator = sqlDB.sequelize.getQueryInterface().queryGenerator;

class Service {
  constructor() {
    this.MAX_PRODUCTS = 5;
    this.BATCH_SIZE = 50;
    this.exportJobRepository = FactoryRepository.getRepository("exportJobs");
    this.error = null;
  }

  buildWhereClause(params) {
    const {
      userId,
      page = 1,
      limit = 50,
      id,
      orderId,
      shipping_name,
      shipping_phone,
      shipping_status,
      warehouse_id,
      courier_id,
      paymentType,
      start_date,
      end_date,
      awb_number,
      exclude_shipping_status,
    } = params || {};

    const whereClause = { [Op.and]: [] };

    // Direct equality filters
    if (userId) whereClause[Op.and].push({ userId });
    if (id) whereClause[Op.and].push({ id });
    if (shipping_status) whereClause[Op.and].push({ shipping_status });
    if (warehouse_id) whereClause[Op.and].push({ warehouse_id });
    if (courier_id) whereClause[Op.and].push({ courier_id });
    if (paymentType) whereClause[Op.and].push({ paymentType });

    if (orderId) {
      const orderIdsArray = Array.isArray(orderId) ? orderId : orderId?.split(",").map((e) => e.trim());
      whereClause[Op.and].push({
        orderId: { [Op.in]: orderIdsArray },
      });
    }

    if (exclude_shipping_status) {
      whereClause[Op.and].push({
        shipping_status: { [Op.ne]: exclude_shipping_status },
      });
    }

    if (awb_number) {
      const idsArray = Array.isArray(awb_number) ? awb_number : awb_number?.split(",").map((e) => e.trim());
      whereClause[Op.and].push({
        awb_number: { [Op.in]: idsArray },
      });
    }

    // Shipping name (JSON concat)
    if (shipping_name) {
      whereClause[Op.and].push(
        where(
          fn(
            "CONCAT",
            fn("COALESCE", fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.fname'"))), ""),
            " ",
            fn("COALESCE", fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.lname'"))), "")
          ),
          { [Op.like]: `%${shipping_name}%` }
        )
      );
    }

    // Shipping phone (JSON phone / alternate_phone)
    if (shipping_phone) {
      whereClause[Op.and].push({
        [Op.or]: [
          where(fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.phone'"))), { [Op.like]: `%${shipping_phone}%` }),
          where(fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.alternate_phone'"))), {
            [Op.like]: `%${shipping_phone}%`,
          }),
        ],
      });
    }

    // Date filters (ignore time)
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
    console.log("filters: ", filters);
    try {
      let whereClause = this.buildWhereClause(filters);
      const whereSQL = queryGenerator.getWhereConditions(whereClause, "shipping");
      const sql = `SELECT * FROM shipping ${whereSQL ? `WHERE ${whereSQL}` : ""} ORDER BY id DESC`;
      const countQuery = `SELECT count(*) FROM shipping ${whereSQL ? `WHERE ${whereSQL}` : ""}`;
      const [rows] = await mysqlConnection.promise().query(countQuery);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "processing", total_count: rows?.[0]?.["count(*)"] });

      let columns = ["User ID", "Transaction ID", "AWB Number", "Created Date", "Weight (gm)", "Zone", "Courier Name", "Status", "Debit"];

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
          if (processed_count % AdminShippingExportsHandler.BATCH_SIZE === 0) {
            await AdminShippingExportsHandler.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count });
          }

          let row = {
            "User ID": e.userId,
            "Transaction ID": e.id,
            "AWB Number": e.awb_number,
            "Created Date": formatDate_DD_MM_YYYY_HH_MM(e.createdAt),
            "Weight (gm)": Math.max(e.packageDetails.weight, e.packageDetails.volumetricWeight) || null,
            Zone: e.zone,
            Status: e.shipping_status,
            Debit: Number(e.freight_charge || 0) + Number(e.cod_price || 0),
          };

          if (e.courier_id) {
            let courierDetails = await CourierService.read({ id: e.courier_id });
            row["Courier Name"] = courierDetails?.data?.result?.[0]?.name;
          }

          console.log("row: ", row);
          callback(null, row);
        },
      });

      const dir = path.join("uploads", "exports", "shipping");
      fs.mkdirSync(dir, { recursive: true });

      const uploadPath = path.join(dir, `${Date.now()}.shipping_charges.csv`);

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

const AdminShippingExportsHandler = new Service();
export default AdminShippingExportsHandler;
