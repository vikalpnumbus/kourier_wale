import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ProductsService from "../products.service.mjs";
import ChannelService from "../channel.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("orders");
    this.channelRepository = FactoryRepository.getRepository("channel");
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
        totalCount = await this.repository.countDocuments(whereClause, { include: [includeChannel] });

        if (!result || result.length === 0) {
          result = [];
        }
      }

      // fill products in each order record
      const channelCache = new Map();
      result = await Promise.all(
        result.map(async (e) => {
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

          const payload = {
            ...e.dataValues,
            products: foundProducts,
            channel_name,
          };
          delete payload.productIDs;
          return payload;
        })
      );
      return { data: { total: totalCount, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const OrdersService = new Service();
export default OrdersService;
