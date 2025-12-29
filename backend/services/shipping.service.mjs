import { fn, Op, where, col } from "sequelize";
import ShippingProducer from "../queue/producers/shipping.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import ProductsService from "./products.service.mjs";
import WarehouseService from "./warehouse.service.mjs";
import OrdersService from "./orders.service.mjs";
import UserService from "./user.service.mjs";
import CourierService from "./courier.service.mjs";
import XpressBeesProvider from "../providers/couriers/xpressbees.provider.mjs";
import CourierAWBListService from "./courierAWBList.service.mjs";
import ChannelService from "./channel.service.mjs";
import ShadowfaxProvider from "../providers/couriers/shadowfax.provider.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("shipping");
  }

  async create({ data }) {
    try {
      let payload = {};
      let { order_id, warehouse_id, rto_warehouse_id, courier_id, freight_charge, cod_price, zone, plan_id, userId } = data;

      let [orderRes, warehouseRes, user] = await Promise.all([
        OrdersService.read({ id: order_id, userId }),
        WarehouseService.read({ id: [warehouse_id, rto_warehouse_id] }),
        UserService.read({ id: userId }),
      ]);

      let order = orderRes?.data?.result?.[0];

      if (!order) {
        if (["No record found."].includes(OrdersService?.error?.message)) {
          const error = new Error("Order not found.");
          error.status = 404;
          throw error;
        }
        throw OrdersService.error;
      }

      // if (order.shipping_status == "booked") {
      //   const error = new Error("Order is already booked.");
      //   error.status = 400;
      //   throw error;
      // }

      if (order.shipping_status == "cancelled") {
        const error = new Error("Cancelled order cannot be shipped.");
        error.status = 400;
        throw error;
      }

      const warehouses = warehouseRes?.data?.result || [];
      const user_wallet_balance = user?.wallet_balance || 0;

      let productIDs = order.products.map((product) => product.id + "");
      const foundProducts = await ProductsService.read({ id: productIDs });
      const checkProductExistence = new Set(foundProducts?.data?.result?.map((e) => e.id + ""));
      const missingIds = productIDs.filter((id) => !checkProductExistence.has(id));

      const total_price =
        Number(freight_charge) +
        Number(cod_price) +
        Number(order.charges?.cod) +
        Number(order.charges?.shipping) +
        Number(order.charges?.tax_amount) -
        Number(order.charges?.discount) +
        order.products.reduce((acc, e) => acc + Number(e.qty) * Number(e.price), 0);

      const errors = [];

      if (missingIds.length > 0) {
        errors.push(`Product with IDs ${missingIds.join(", ")} does not exist.`);
      }

      if (warehouse_id == rto_warehouse_id && warehouses.length !== 1) {
        errors.push("Pickup Warehouse or RTO warehouse with given IDs not found.");
      } else if (warehouse_id != rto_warehouse_id && warehouses.length !== 2) {
        errors.push("Pickup Warehouse or RTO warehouse with given IDs not found.");
      }

      const isCourierExist = await CourierService.read({ id: courier_id });
      if (!isCourierExist) {
        errors.push("Courier does not exist.");
      }

      if (user_wallet_balance < total_price) {
        errors.push("Wallet Balance is low");
      }

      if (total_price > 2_00_000 && order.paymentType == "cod") {
        const error = new Error("COD is not available for more than 200000 collectable amount");
        error.status = 400;
        throw error;
      }

      if (errors.length > 0) {
        payload.shipment_error = errors.join("|");
      }

      delete order.id;
      delete order.createdAt;
      delete order.updatedAt;

      payload = {
        ...payload,
        order_db_id: order_id,
        ...order,
        warehouse_id,
        rto_warehouse_id,
        shipping_status: "new",
        courier_id,
        freight_charge,
        cod_price,
        total_price,
        zone,
        plan_id,
        courierPackageDetails: {
          courier_billed_weight: 0,
          courier_billed_length: 0,
          courier_billed_height: 0,
          courier_billed_breadth: 0,
        },
      };

      const result = await this.repository.save(payload);

      const orderUpdate = await OrdersService.update({
        data: {
          id: order_id,
          warehouse_id,
          rto_warehouse_id,
          shipping_status: "booked",
        },
      });
      if (!orderUpdate) console.error("shipping/create/orderUpdate", OrdersService.error);

      // console.error("err: ", errors);
      if (errors.length == 0) {
        const createSingleShipment = await this.handleCreateSingleShipment({
          ...payload,
          courier: isCourierExist,
          warehouses,
          id: result.id,
        });

        if (!createSingleShipment) throw ShippingService.error;
      } else throw new Error(errors.join(", "));

      return {
        status: 201,
        data: {
          message: "Shipment has been created successfully.",
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
      const { shipping_status, shipment_error, awb_number } = data;
      let payload = {};
      if (shipping_status) payload.shipping_status = shipping_status;
      if (shipment_error) payload.shipment_error = shipment_error;
      if (awb_number) payload.awb_number = awb_number;
      if (Object.keys(payload).length == 0) {
        return {
          status: 200,
          data: {
            message: "Nothing to update.",
            id: existingRecordId,
          },
        };
      }
      const result = await this.repository.findOneAndUpdate({ id: existingRecordId }, payload);

      return {
        status: 201,
        data: {
          message: "Shipment has been updated successfully.",
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
        courier_id,
        paymentType,
        start_date,
        end_date,
        awb_number,
        exclude_shipping_status,
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

      // fill products in each order record
      const courierCache = {};
      const getCourier = async (id) => {
        if (courierCache[id]) return courierCache[id];
        return await CourierService.read({ id });
      };
      result = await Promise.all(
        result.map(async (e) => {
          let productIDs = e.products.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((e) => e?.trim())
            .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

          let courierID = e.courier_id;

          let [foundProductsRes, courierRes] = await Promise.all([await ProductsService.read({ id: productIDs }), await getCourier(courierID)]);

          if (!courierCache[courierID]) courierCache[courierID] = courierRes;
          let foundProducts = foundProductsRes?.data?.result || [];

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

  async handleCreateSingleShipment(data) {
    try {
      const { id, userId, courier, total_price, freight_charge, cod_price } = data;

      const { code } = courier?.data?.result?.[0];
      console.log("courier: ", courier.data);
      console.log("code: ", code);

      if (code.includes("xpressbees")) {
        const shipmentRes = await XpressBeesProvider.createShipment({ ...data, shipmentId: id });

        if (!shipmentRes) {
          await ShippingService.update({
            data: {
              id,
              shipment_error: XpressBeesProvider.error.message,
            },
          });
        } else {
          const updatedShipmentData = await ShippingService.update({
            data: {
              id,
              shipping_status: "booked",
              awb_number: shipmentRes.AWBNo,
              shipment_error: null,
            },
          });

          if (!updatedShipmentData) {
            console.error(ShippingService.error);
          }

          const updatedAWBData = await CourierAWBListService.update({
            data: {
              id: shipmentRes?.courierAWBListData?.id,
              used: 1,
            },
          });
          if (!updatedAWBData) {
            console.error(CourierAWBListService.error);
          }

          const existingUser = await UserService.read({ id: userId });

          const updatedUser = await UserService.update(
            { id: userId },
            {
              wallet_balance: existingUser.wallet_balance - ((freight_charge || 0) + (cod_price || 0)),
            }
          );

          if (!updatedUser) {
            console.error("shipping/create/userWalletUpdate", UserService.error);
          }
        }
      } else if (code.includes("Shadow_Fax")) {
        const shipmentRes = await ShadowfaxProvider.createShipment(data);

        if (!shipmentRes) {
          await ShippingService.update({
            data: {
              id,
              shipment_error: ShadowfaxProvider.error.message,
            },
          });
        } else {
          const updatedShipmentData = await ShippingService.update({
            data: {
              id,
              shipping_status: "booked",
              awb_number: shipmentRes.AWBNo,
              shipment_error: null,
            },
          });

          if (!updatedShipmentData) {
            console.error(ShippingService.error);
          }

          const existingUser = await UserService.read({ id: userId });

          const updatedUser = await UserService.update(
            { id: userId },
            {
              wallet_balance: existingUser.wallet_balance - total_price,
            }
          );

          if (!updatedUser) {
            console.error("shipping/create/userWalletUpdate", UserService.error);
          }
        }
      }
      return true;
    } catch (error) {
      this.error = error;
      return false;
    }
  }
  async handleCancelSingleShipment({ data }) {
    try {
      const { id, userId } = data;
      const isShipmentExistsRes = await this.read({ id, userId });
      const existingShipmentData = isShipmentExistsRes?.data?.result?.[0] || null;

      const existingShipmentCount = isShipmentExistsRes?.data?.total || null;
      if (!existingShipmentCount || existingShipmentCount == 0) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      const shipping_status = existingShipmentData.shipping_status;

      const allowedStatusesForCancellation = ["new", "booked", "pending-pickup"];

      if (!allowedStatusesForCancellation.includes(shipping_status)) {
        const error = new Error(`Shipment status is ${shipping_status}. It cannot be cancelled.`);
        error.status = 400;
        throw error;
      }

      const isCourierExist = await CourierService.read({
        id: existingShipmentData.courier_id,
      });
      if (!isCourierExist) {
        const error = new Error("Courier does not exist.");
        error.status = 400;
        throw error;
      }

      if (existingShipmentData.shipment_error == null) {
        const shipmentRes = await XpressBeesProvider.cancelShipment({
          awb_number: existingShipmentData.awb_number,
        });
        if (!shipmentRes) {
          throw XpressBeesProvider.error;
        }
      }

      await Promise.all([
        OrdersService.update({
          data: {
            id: existingShipmentData.order_db_id,
            shipping_status: "new",
          },
        }),
        ShippingService.update({
          data: {
            id: existingShipmentData.id,
            shipping_status: "cancelled",
          },
        }),
      ]);

      return { data: { message: "Cancelled successfully." } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const ShippingService = new Service();
export default ShippingService;
