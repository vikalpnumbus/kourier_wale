import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ProductsService from "../products.service.mjs";
import CourierService from "../courier.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("shipping");
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
        courier_id,
        paymentType,
        start_date,
        end_date,
        awb_number,
      } = params;

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
          result = [];
        }
      }

       const courierCache = {};
      const getCourier = async (id) => {
        if (courierCache[id]) return courierCache[id];
        return await CourierService.read({ id });
      };
      // fill products in each order record
      result = await Promise.all(
        result.map(async (e) => {
          let productIDs = e.products.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((e) => e?.trim())
            .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

          let courierID = e.courier_id;

          let foundProducts = (await ProductsService.read({ id: productIDs })).data.result;
          let courierRes = await getCourier(courierID);
          if (!courierCache[courierID]) courierCache[courierID] = courierRes;

          foundProducts = foundProducts.map((product) => ({
            ...product.dataValues,
            ...e.products.filter((curr) => curr.id == product.id)[0],
          }));

          const payload = { ...e.dataValues, products: foundProducts, courier_name: courierRes?.data?.result?.[0]?.name };
          delete payload.productIDs;
          return payload;
        })
      );
      return { data: { total: totalCount, result } };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }
}

const OrdersService = new Service();
export default OrdersService;
