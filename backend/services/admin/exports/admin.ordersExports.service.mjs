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
    const { userId, id, orderId, shipping_name, shipping_phone, shipping_status, warehouse_id, paymentType, start_date, end_date } = params || {};

    const whereClause = { [Op.and]: [] };

    // Direct equality filters
    if (userId) whereClause[Op.and].push({ userId });
    if (id) whereClause[Op.and].push({ id });
    if (shipping_status) whereClause[Op.and].push({ shipping_status });
    if (warehouse_id) whereClause[Op.and].push({ warehouse_id });
    if (paymentType) whereClause[Op.and].push({ paymentType });

    if (orderId) {
      const orderIdsArray = Array.isArray(orderId) ? orderId : orderId?.split(",").map((e) => e.trim());
      whereClause[Op.and].push({
        orderId: { [Op.in]: orderIdsArray },
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
          where(fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.alternate_phone'"))), { [Op.like]: `%${shipping_phone}%` }),
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
    try {
      let whereClause = this.buildWhereClause(filters);
      const whereSQL = queryGenerator.getWhereConditions(whereClause, "orders");
      const sql = `SELECT * FROM orders ${whereSQL ? `WHERE ${whereSQL}` : ""} ORDER BY id DESC`;
      const countQuery = `SELECT count(*) FROM orders ${whereSQL ? `WHERE ${whereSQL}` : ""}`;
      const [rows] = await mysqlConnection.promise().query(countQuery);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "processing", total_count: rows?.[0]?.["count(*)"] });
      const channelCache = new Map();

      let columns = [
        "User ID",
        "id",
        "Order ID",
        "Order Date",
        "Payment Type",
        "Channel Name",
        "Warehouse ID",
        "Warehouse Name",
        "Warehouse No",
        "Warehouse Address",
        "Warehouse Pincode",
        "Warehouse City",
        "Warehouse State",
        "Customer Name",
        "Customer Email",
        "Customer Address",
        "Customer Pincode",
        "Customer City",
        "Customer State",
        "Product Weight",
        "Product LBH",
        "Shipping Charges (By Seller)",
        "Shipping TAX (By Seller)",
        "COD Charge (By Seller)",
        "Shipping Discount (By Seller)",
        "Collectable Amount",
        "Product Total Amount",
      ];

      for (let i = 1; i <= AdminOrderExportsHandler.MAX_PRODUCTS; i++) {
        columns.push(`Product ${i} Name`);
        columns.push(`Product ${i} SKU`);
        columns.push(`Product ${i} Price`);
        columns.push(`Product ${i} Qty`);
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
          if (processed_count % AdminOrderExportsHandler.BATCH_SIZE === 0) {
            await AdminOrderExportsHandler.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count });
          }

          const channel_id = e.channel_id;

          let channel_name = null;
          if (channel_id) {
            if (channelCache.has(channel_id)) {
              channel_name = channelCache.get(channel_id);
            } else {
              channel_name = (await ChannelService.read({ id: channel_id }))?.data?.result?.[0]?.channel_name;
              channelCache.set(channel_id, channel_name);
            }
          }
          let productIDs = e.products?.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((e) => e?.trim())
            .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

          let foundProducts = (await ProductsService.read({ id: productIDs })).data.result;

          foundProducts = foundProducts.map((product) => ({
            ...product.dataValues,
            ...e.products.filter((curr) => curr.id == product.id)[0],
          }));

          let row = {
            "User ID": e.userId,
            id: e.id,
            "Order ID": e.orderId,
            "Order Date": new Date(e.createdAt),
            "Payment Type": e.paymentType,
            "Channel Name": channel_name,
            "Warehouse ID": e.warehouse_id,
            "Warehouse Name": null,
            "Warehouse No": null,
            "Warehouse Address": null,
            "Warehouse Pincode": null,
            "Warehouse City": null,
            "Warehouse State": null,
            "Customer Name": e["shippingDetails"].fname + " " + e["shippingDetails"].lname,
            "Customer Email": e["shippingDetails"].email || null,
            "Customer Address": e["shippingDetails"].address || null,
            "Customer Pincode": e["shippingDetails"].pincode || null,
            "Customer City": e["shippingDetails"].city || null,
            "Customer State": e["shippingDetails"].state || null,
            "Product Weight": e.packageDetails.weight || null,
            "Product LBH": e.packageDetails.length + " X " + e.packageDetails.breadth + " X " + e.packageDetails.height,
            "Shipping Charges (By Seller)": e.charges.shipping || null,
            "Shipping TAX (By Seller)": e.charges.tax_amount || null,
            "COD Charge (By Seller)": e.charges.cod || null,
            "Shipping Discount (By Seller)": e.charges.discount || null,
            "Collectable Amount": e.collectableAmount || null,
            "Product Total Amount": null,
          };

          for (let i = 1; i <= AdminOrderExportsHandler.MAX_PRODUCTS; i++) {
            const p = foundProducts[i];

            row[`Product ${i} Name`] = p?.name ?? "";
            row[`Product ${i} SKU`] = p?.sku ?? "";
            row[`Product ${i} Price`] = p?.price ?? "";
            row[`Product ${i} Qty`] = p?.qty ?? "";
          }

          callback(null, row);
        },
      });

      const dir = path.join("uploads", "exports", "orders");
      fs.mkdirSync(dir, { recursive: true });

      const uploadPath = path.join(dir, `${Date.now()}.orders.csv`);

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

const AdminOrderExportsHandler = new Service();
export default AdminOrderExportsHandler;
