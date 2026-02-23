import { col, fn, literal, Op, where } from "sequelize";
import OrdersProducer from "../queue/producers/orders.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import ProductsService from "./products.service.mjs";
import WarehouseService from "./warehouse.service.mjs";
import ChannelService from "./channel.service.mjs";
import ShopifyProvider from "../providers/couriers/shopify.provider.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("orders");
    this.channelRepository = FactoryRepository.getRepository("channel");
  }

  async create({ data }) {
    try {
      let { warehouse_id, products } = data;
      let productIDs = products.map((e) => e.id).join(",");
      productIDs = productIDs
        .split(",")
        .map((e) => e?.trim())
        .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

      const foundProducts = await ProductsService.read({
        id: productIDs,
      });

      const checkProductExistence = new Set(foundProducts?.data?.result?.map((e) => e.id + ""));

      const missingIds = productIDs.filter((id) => !checkProductExistence.has(id));

      if (missingIds.length > 0) {
        const error = new Error(`Product with IDs ${missingIds.join(", ")} does not exist.`);
        error.status = 422;
        throw error;
      }

      if (warehouse_id) {
        const foundWarehouses = await WarehouseService.read({
          id: warehouse_id,
        });
        if (!foundWarehouses) {
          const error = new Error("Warehouse with given ID does not found.");
          error.status = 400;
          throw error;
        }

        const checkWarehouseExistence = new Set(foundWarehouses?.data?.result?.map((e) => e.id + ""));

        const missingWarehouseIds = !checkWarehouseExistence.has(warehouse_id) ? [warehouse_id] : [];

        if (missingWarehouseIds.length > 0) {
          const error = new Error(`Warehouse with IDs ${missingWarehouseIds.join(", ")} does not exist.`);
          error.status = 422;
          throw error;
        }
      }

      const payload = { ...data, products };
      const result = await this.repository.save(payload);

      return {
        status: 201,
        data: {
          message: "Order has been created successfully.",
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

      let payload = { ...data };

      if (data.productIDs) {
        let { productIDs } = data;

        productIDs = productIDs
          .split(",")
          .map((e) => e?.trim())
          .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

        const foundProducts = await ProductsService.read({
          id: productIDs,
        });

        const checkProductExistence = new Set(foundProducts?.data?.result?.map((e) => e.id + ""));

        const missingIds = productIDs.filter((id) => !checkProductExistence.has(id));

        if (missingIds.length > 0) {
          const error = new Error(`Product with IDs ${missingIds.join(", ")} does not exist.`);
          error.status = 422;
          throw error;
        }

        payload = { ...payload, productIDs: productIDs.join(", ") };
      }
      const result = await this.repository.findOneAndUpdate({ id: existingRecordId }, payload);

      return {
        status: 201,
        data: {
          message: "Order has been updated successfully.",
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
        userId,
        page = 1,
        limit = 50,
        id,
        orderId,
        shipping_name,
        shipping_phone,
        shipping_status,
        warehouse_id,
        paymentType,
        start_date,
        end_date,
        channel_name,
        ...filters
      } = params;

      const whereClause = { [Op.and]: [], ...filters };

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
            where(fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.alternate_phone'"))), {
              [Op.like]: `%${shipping_phone}%`,
            }),
          ],
        });
      }

      // Date filters (ignore time)
      if (start_date) {
        whereClause[Op.and].push(where(fn("DATE", col("orders.createdAt")), { [Op.gte]: start_date }));
      }
      if (end_date) {
        whereClause[Op.and].push(where(fn("DATE", col("orders.createdAt")), { [Op.lte]: end_date }));
      }

      // If no conditions were added, remove Op.and
      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      const includeChannel = {
        model: this.channelRepository.model, // Channels table
        as: "channel",
        attributes: ["channel_name"],
        required: false, // optional
      };

      if (channel_name) {
        includeChannel.where = {
          channel_name: { [Op.like]: `%${channel_name}%` },
        };
        includeChannel.required = true; // makes it INNER JOIN for filtering
      }

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(whereClause, {}, [includeChannel]);
        if (result.length == 0) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = result.length;
      } else {
        result = await this.repository.find(whereClause, { page, limit }, [includeChannel]);
        totalCount = await this.repository.countDocuments(whereClause, {
          include: [includeChannel],
        });
        const baseWhereClause = { [Op.and]: [] };
        if (userId) baseWhereClause[Op.and].push({ userId });
        if (warehouse_id) baseWhereClause[Op.and].push({ warehouse_id });
        if (paymentType) baseWhereClause[Op.and].push({ paymentType });
        if (start_date) {
          baseWhereClause[Op.and].push(
            where(fn("DATE", col("orders.createdAt")), { [Op.gte]: start_date })
          );
        }
        if (end_date) {
          baseWhereClause[Op.and].push(
            where(fn("DATE", col("orders.createdAt")), { [Op.lte]: end_date })
          );
        }
        if (!baseWhereClause[Op.and].length) delete baseWhereClause[Op.and];
        const allCount = await this.repository.countDocuments(baseWhereClause, {
          include: [includeChannel],
        });
        const newCount = await this.repository.countDocuments(
          {
            ...baseWhereClause,
            shipping_status: "new",
          },
          { include: [includeChannel] }
        );
        const bookedCount = await this.repository.countDocuments(
          {
            ...baseWhereClause,
            shipping_status: "booked",
          },
          { include: [includeChannel] }
        );
        const cancelCount = await this.repository.countDocuments(
          {
            ...baseWhereClause,
            shipping_status: "cancel",
          },
          { include: [includeChannel] }
        );
        if (!result || result.length === 0) {
          result = [];
        }
      }
      result = await Promise.all(
        result.map(async (e) => {
          const modifiedData = e.dataValues;
          const channel = e?.channel?.dataValues || {};
          delete modifiedData.channel;
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
          const payload = {
            ...modifiedData,
            ...channel,
            products: foundProducts,
          };
          delete payload.productIDs;
          return payload;
        })
      );
      return {
        data: {
          total: totalCount,
          result,
          counts: {
            all: allCount,
            new: newCount,
            booked: bookedCount,
            cancel: cancelCount,
          },
        },
      };
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

      OrdersProducer.publishImportFile({
        files: files.map((e) => ({
          fileName: userId,
          file: e,
          dir: "orders",
        })),
        metadata: {
          id: userId,
        },
      });

      return {
        status: 200,
        data: {
          message: "Importing the orders.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async bulkExport(params) {
    try {
      const { page = 1, limit = 50, id, search, ...filters } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }

      if (search) {
        where[Op.or] = [
          { orderId: { [Op.like]: `%${search}%` } }, // MySQL LIKE (case-insensitive if collation allows)
        ];
      }

      let result;
      let totalCount;
      result = await this.repository.find(where, { page, limit });
      totalCount = await this.repository.countDocuments(where);

      if (!result || result.length === 0) {
        const error = new Error("No records found.");
        error.status = 404;
        throw error;
      }

      //fill products in each order record
      result = await Promise.all(
        result.map(async (e) => {
          let productIDs = e.products.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((e) => e?.trim())
            .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

          const foundProducts = (
            await ProductsService.read({
              id: productIDs,
            })
          ).data.result;

          const payload = { ...e.dataValues, products: foundProducts };
          delete payload.productIDs;
          return payload;
        })
      );
      return {
        data: {
          total: totalCount,
          result: result.map((e) => ({
            id: e.id,
            "Order ID": e.orderId,
            "Order Date": new Date(e.createdAt),
            "Payment Type": e.paymentType,
            "Channel Name": "Manual",
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
            "Orders Product section": e.products,
          })),
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async cancelOrder(params) {
    try {
      const { id, userId } = params;
      const order = (await this.read({ id, userId }))?.data?.result?.[0];
      if (!order) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      const { channel_id, channel_order_id } = order;
      const channelDataRes = (await ChannelService.read({ id: channel_id })) || null;
      const channelData = channelDataRes?.data?.result?.[0];
      if (channelData.channel == "shopify") {
        const shopDomain = channelData.channel_host;
        const accessToken = channelData.access_token;
        const response = await ShopifyProvider.cancelOrder(shopDomain, accessToken, channel_order_id);
        if (!response.order.cancel_reason) {
          throw new Error("Unable to cancel the order on shopify.");
        }
      }

      const cancelOrderRes = this.update({ id, shipping_status: "cancelled" });
      if (!cancelOrderRes) {
        throw new Error("Unable to cancel the order on our platform.");
      }
      return {
        status: 200,
        data: {
          message: "Order has been cancelled successfully.",
          id: id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const OrdersService = new Service();
export default OrdersService;
