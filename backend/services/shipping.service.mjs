import { fn, Op, where, col } from "sequelize";
import ShippingProducer from "../queue/producers/shipping.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import ProductsService from "./products.service.mjs";
import WarehouseService from "./warehouse.service.mjs";
import OrdersService from "./orders.service.mjs";
import UserService from "./user.service.mjs";
import CourierService from "./courier.service.mjs";
import CourierAWBListService from "./courierAWBList.service.mjs";
import ChannelService from "./channel.service.mjs";
import ShadowfaxProvider from "../providers/couriers/shadowfax.provider.mjs";
import XpressBeesProvider from "../providers/couriers/xpressbees.provider.mjs";
import Xpressbeespanel from "../providers/couriers/xpressbees.panel.provider.mjs"
import ATSProvider from "../providers/couriers/ats.provider.mjs";
import BluedartProvider from "../providers/couriers/bluedart.provider.mjs";
import ShiprocketProvider from "../providers/aggregator/shiprocket.provider.mjs";
// import ShiprocketProviderats from "../providers/aggregator/shiprocket.provider.ats.mjs";
import ShippingModel from "../model/shipping.sql.model.mjs";
import { mapTrackingStatus } from "../utils/statusMapper.mjs";
const num = (v, fallback = 1) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.round(n);
};

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("shipping");
    this.trackingRepo = FactoryRepository.getRepository("shipment_tracking");
  }
  async create({ data }) {
    try {
      let {
        order_id,
        warehouse_id,
        rto_warehouse_id,
        courier_id,
        freight_charge,
        cod_price,
        zone,
        plan_id,
        userId,
      } = data;

      let [orderRes, warehouseRes, user] = await Promise.all([
        OrdersService.read({ id: order_id, userId }),
        WarehouseService.read({ id: [warehouse_id, rto_warehouse_id] }),
        UserService.read({ id: userId }),
      ]);

      let order = orderRes?.data?.result?.[0];
      if (!order) throw new Error("Order not found.");
      if (order.shipping_status == "cancelled")
        throw new Error("Cancelled order cannot be shipped.");

      const warehouses = warehouseRes?.data?.result || [];
      const user_wallet_balance = user?.wallet_balance || 0;

      const total_price = Number(freight_charge) + Number(cod_price);

      const errors = [];

      if (user_wallet_balance < total_price)
        errors.push("Wallet Balance is low");

      const courierRes = await CourierService.read({ id: courier_id });
      if (!courierRes) errors.push("Courier does not exist.");

      if (errors.length > 0) {
        await OrdersService.update({
          data: {
            id: order_id,
            is_valid: 0,
            error_message: errors.join("|"),
          },
        });
        throw new Error(errors.join(", "));
      }

      // ✅ Prepare payload (NO DB SAVE)
      delete order.id;
      delete order.createdAt;
      delete order.updatedAt;

      const payload = {
        order_db_id: order_id,
        ...order,
        warehouse_id,
        rto_warehouse_id,
        courier_id,
        freight_charge,
        cod_price,
        total_price,
        zone,
        plan_id,
      };

      // ================= 🔥 STEP: FIRST CREATE AWB =================
      const shipmentRes = await this.handleCreateSingleShipment({
        ...payload,
        courier: courierRes,
        warehouses,
        userId,
      });

      // ❌ FAIL → NO shipment + NO booking
      if (!shipmentRes?.success) {
        await OrdersService.update({
          data: {
            id: order_id,
            is_valid: 0,
            error_message: shipmentRes?.error || "Shipment failed",
          },
        });

        throw new Error(shipmentRes?.error || "Shipment failed");
      }


      // ================= ✅ WALLET SUCCESS =================
      const existingUser = await UserService.read({ id: userId });
      await UserService.update(
        { id: userId },
        {
          wallet_balance:
            Number(existingUser.wallet_balance) -
            Number(total_price),
        }
      );

      // ================= ✅ SUCCESS =================

      // ✅ Create shipment now
      const result = await this.repository.save({
        ...payload,
        awb_number: shipmentRes.awb_number,
        shipping_status: "booked",
        shiprocket_shipment_id: shipmentRes.shipment_id,
      });

      // ✅ Update order
      await OrdersService.update({
        data: {
          id: order_id,
          warehouse_id,
          rto_warehouse_id,
          shipping_status: "booked",
          is_valid: 1,
          error_message: null,
        },
      });

      return {
        status: 201,
        data: {
          message: "Shipment created successfully",
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
      if (!existingRecordId) throw new Error("Record ID missing");
      delete data.id;
      const payload = {};
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) payload[key] = data[key];
      });
      if (Object.keys(payload).length === 0) {
        return {
          status: 200,
          data: {
            message: "Nothing to update.",
            id: existingRecordId,
          },
        };
      }
      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        payload
      );
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
      if (userId) whereClause[Op.and].push({ userId });
      if (id) whereClause[Op.and].push({ id });
      if (shipping_status) whereClause[Op.and].push({ shipping_status });
      if (warehouse_id) whereClause[Op.and].push({ warehouse_id });
      if (courier_id) whereClause[Op.and].push({ courier_id });
      if (paymentType) whereClause[Op.and].push({ paymentType });
      if (orderId){
        const orderIdsArray = Array.isArray(orderId)
          ? orderId
          : orderId.split(",").map((e) => e.trim());
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
        const idsArray = Array.isArray(awb_number)
          ? awb_number
          : awb_number.split(",").map((e) => e.trim());

        whereClause[Op.and].push({
          awb_number: { [Op.in]: idsArray },
        });
      }
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
      if (shipping_phone) {
        whereClause[Op.and].push({
          [Op.or]: [
            where(
              fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.phone'"))),
              { [Op.like]: `%${shipping_phone}%` }
            ),
            where(
              fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.alternate_phone'"))),
              { [Op.like]: `%${shipping_phone}%` }
            ),
          ],
        });
      }
      if (start_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.gte]: start_date })
        );
      }
      if (end_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.lte]: end_date })
        );
      }
      if (!whereClause[Op.and].length) delete whereClause[Op.and];
      let result;
      let totalCount;
      if (id) {
        result = await this.repository.find(whereClause);
        totalCount = result.length;
      } else {
        result = await this.repository.find(whereClause, { page, limit });
        totalCount = await this.repository.countDocuments(whereClause);
      }
      if (!result) result = [];
      const courierCache = {};
      const getCourier = async (id) => {
        if (courierCache[id]) return courierCache[id];
        const data = await CourierService.read({ id });
        courierCache[id] = data;
        return data;
      };
      result = await Promise.all(
        result.map(async (e) => {
          const productIDs = e.products
            .map((p) => p.id)
            .filter(Boolean)
            .join(",");
          const [productsRes, courierRes] = await Promise.all([
            ProductsService.read({ id: productIDs }),
            getCourier(e.courier_id),
          ]);
          let foundProducts = productsRes?.data?.result || [];
          foundProducts = foundProducts.map((product) => ({
            ...product.dataValues,
            ...e.products.find((p) => p.id == product.id),
          }));
          return {
            ...e.dataValues,
            products: foundProducts,
            courier_name: courierRes?.data?.result?.[0]?.name,
          };
        })
      );
      const baseWhere = { ...whereClause };
      if (baseWhere[Op.and]) {
        baseWhere[Op.and] = baseWhere[Op.and].filter(
          (cond) => !cond.shipping_status
        );
      }
      const statusGroupCounts = await this.repository.model.findAll({
        attributes: [
          "shipping_status",
          [fn("COUNT", col("id")), "count"],
        ],
        where: baseWhere,
        group: ["shipping_status"],
        raw: true,
      });
      const counts = {
        All: await this.repository.countDocuments(baseWhere),
        booked: 0,
        new: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        ndr: 0,
        cancelled: 0,
        Stuck: 0,
      };
      statusGroupCounts.forEach((row) => {
        counts[row.shipping_status] = Number(row.count);
      });
      return {
        data: {
          total: totalCount,
          result,
          counts,
        },
      };
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
      const { courier } = data;
      const { code, name} = courier?.data?.result?.[0];
      console.log()
      // ================= XpressBees =================
      if (code.includes("xpressbees")) {
        const res = await XpressBeesProvider.createShipment(data);

        if (!res) {
          return {
            success: false,
            error: XpressBeesProvider.error.message,
          };
        }
        return {
          success: true,
          awb_number: res.AWBNo,
        };
      }
      // ================= Shadowfax =================
      if (code.includes("Shadow_Fax")) {
        const res = await ShadowfaxProvider.createShipment(data);
        if (!res) {
          return {
            success: false,
            error: ShadowfaxProvider.error.message,
          };
        }
        return {
          success: true,
          awb_number: res.AWBNo,
        };
      }
      // ================= Amazon =================
      if (code.includes("Amazon_500_Gram")) {
        const res = await ATSProvider.createShipment(data);
        if (!res) {
          const err = ATSProvider.error;
          const message =
            err?.errors?.[0]?.details ||
            err?.errors?.[0]?.message ||
            err?.message ||
            "Amazon failed";

          return {
            success: false,
            error: message,
          };
        }
        const payload = res.payload || {};
        console.log("ATS Response",payload);
        const shipmentId = payload?.shipmentId;
        const pkg = payload?.packageDocumentDetails?.[0] || {};
        const awb = pkg?.trackingId;
        const labelBase64 = pkg?.packageDocuments?.[0]?.contents;
        let labelUrl = null;
        if (labelBase64) {
          const fileName = `${awb}.png`;
          const filePath = `labels/${fileName}`;
          require("fs").writeFileSync(
            filePath,
            Buffer.from(labelBase64, "base64")
          );
          labelUrl = filePath;
        }
        return {
          success: true,
          awb_number: awb,
          amazon_shipment_id: shipmentId,
          // label_url: labelUrl,
          // shipment_info: payload?.promise || null,
        };
      }
      // ================= Bluedart =================
      if (code.includes("Bluedart_500_Gram")) {
        const res = await BluedartProvider.createShipment(data);
        if (!res) {
          return {
            success: false,
            error:
              BluedartProvider.error?.message || "Bluedart failed",
          };
        }
        return {
          success: true,
          awb_number: res.GenerateWayBillResult?.AWBNo,
        };
      }
      // ================= Shiprocket =================
      if (code.includes("Shiprocket_dl")) {
        const orderRes = await ShiprocketProvider.createOrder(data);
        if (!orderRes) {
          return {
            success: false,
            error: "Shiprocket order failed",
          };
        }
        const awbRes = await ShiprocketProvider.assignAWB({
          shipment_id: orderRes.shipment_id,
          courier_id: "753",
        });
        if (!awbRes) {
          return {
            success: false,
            error: "AWB Generation failed",
          };
        }
        return {
          success: true,
          awb_number: awbRes.response.data.awb_code,
        };
      }
      if (code.includes("xb_panel")) {
        const courierMap = {
          "Air Xpressbees 0.5 K.G": "6",
          "Surface Xpressbees 0.5 K.G": "1",
          "Xpressbees 1 K.G": "12298",
          "Xpressbees 2 K.G": "2",
          "Xpressbees 5 K.G": "3",
          "Xpressbees 10 K.G": "4",
        };
        const courierid = courierMap[name];
        if (!courierid) {
          return {
            success: false,
            error: "Invalid Xpressbees courier selected",
          };
        }
        const res = await Xpressbeespanel.createShipment(data, courierid);
        if (!res || !res.status) {
          return {
            success: false,
            error:
              res?.error ||
              Xpressbeespanel.error?.message ||
              "Xpressbees Failed To Create Shipment.",
          };
        }
        const awb = res?.data?.awb_number;
        if (!awb) {
          return {
            success: false,
            error: "AWB not received from Xpressbees",
          };
        }
        return {
          success: true,
          awb_number: awb,
        };
      }
      return {
        success: false,
        error: "Unsupported courier",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleCancelSingleShipment({ data }) {
    try {
      const { id, userId } = data;
      const isShipmentExistsRes = await this.read({ id, userId });
      const existingShipmentData = isShipmentExistsRes?.data?.result?.[0] || null;
      console.log("Existing Data in DB",existingShipmentData);
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
      if (existingShipmentData.shipment_error == null)
      {
        if (existingShipmentData.courier_id == "5")
        {
          const shipmentRes = await XpressBeesProvider.cancelShipment({awb_number: existingShipmentData.awb_number});
          if (!shipmentRes)
          {
            throw XpressBeesProvider.error;
          }
        }
      }
      if (existingShipmentData.shipment_error == null)
      {
        if (existingShipmentData.courier_id == "7")
        {
          const shipmentRes = await ATSProvider.cancelShipment({amazon_shipment_id: existingShipmentData.amazon_shipment_id});
          if (!shipmentRes)
          {
            throw ATSProvider.error;
          }
        }
      }
      if (existingShipmentData.shipment_error == null) {
        if (existingShipmentData.courier_id == "8") {
          const shipmentRes = await BluedartProvider.cancelShipment(
            existingShipmentData.awb_number
          );
          if (!shipmentRes) {
            throw BluedartProvider.error;
          }
          console.log("✅ Bluedart shipment cancelled");
        }
      }
      if (existingShipmentData.shipment_error == null) {
        if (existingShipmentData.courier_id == "9") {
          const shipmentRes = await ShiprocketProvider.cancelShipment({
            awb_number: existingShipmentData.awb_number
          });

          if (!shipmentRes) {
            throw ShiprocketProvider.error;
          }

          console.log("✅ Shiprocket shipment cancelled");
        }
      }
      if (existingShipmentData.shipment_error == null) {
        if ([12,13,14,15,16,17,18].includes(existingShipmentData.courier_id))
        {
          const shipmentRes = await Xpressbeespanel.cancelShipment(existingShipmentData.awb_number);
          if (!shipmentRes || !shipmentRes.success) {
            throw new Error(shipmentRes?.error || "XB Cancel Failed");
          }
          console.log("✅ Xpressbees Shipment Cancelled");
        }
      }
      if (existingShipmentData.shipping_status === "booked" && existingShipmentData.awb_number)
      {
        const refundAmount = Number(existingShipmentData.freight_charge || 0) + Number(existingShipmentData.cod_price || 0);
        const existingUser = await UserService.read({ id: userId });
        await UserService.update(
          { id: userId },
          {
            wallet_balance:
              Number(existingUser.wallet_balance) + refundAmount,
          }
        );
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

  async runTrackingCron() {
    try {
      console.log("🚀 Tracking Cron Started");
      const shipments = await ShippingModel.findAll({
        where: {
          shipping_status: {
            [Op.notIn]: ["delivered", "cancelled", "rto"],
          },
        },
      });
      for (const shipment of shipments) {
        await this.syncTracking(shipment);
      }
      console.log("✅ Tracking Cron Completed");
    } catch (error) {
      console.error("❌ Cron Error:", error.message);
    }
  }


  async getShipmentTrackingById({ shipment_id }) {
  const trackingRepo = FactoryRepository.getRepository("shipment_tracking");
  const data = await trackingRepo.model.findAll({
    where: {
      shipment_id: Number(shipment_id),
    },
    order: [["datetime", "DESC"]],
    raw: true,
  });
  console.log("Tracking data from DB:", data);
  return {
    total: data.length,
    result: data,
  };
  }


  async syncTracking(shipment) {
    console.log(`🔄 Syncing tracking for AWB: ${shipment.awb_number}`);
    console.log('shipment courier data in DB', shipment.courier_id);
    try {
      if (!shipment?.awb_number) return;
      const trackingRes = await Xpressbeespanel.getTracking(shipment.awb_number);
      if (!trackingRes || !trackingRes.status) return;
      const data = trackingRes.data || {};
      const history = data.history || [];
      history.sort(
        (a, b) => new Date(a.event_time) - new Date(b.event_time)
      );
      const records = history.map((item) => ({
        awb_number: data.awb_number,
        shipment_id: shipment.id,
        status: item.message?.toLowerCase() || "",
        datetime: new Date(item.event_time),
        description: item.message || "",
        location: item.location || "",
      }));
      const uniqueMap = new Map();
      for (const r of records) {
        const key = `${r.awb_number}-${r.status}-${r.datetime}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, r);
        }
      }
      const uniqueRecords = Array.from(uniqueMap.values());
      if (uniqueRecords.length) {
        await this.trackingRepo.model.bulkCreate(uniqueRecords, {
          ignoreDuplicates: true,
        });
      }
      if (data.status) {
        const newStatus = mapTrackingStatus("xpressbees", data.status);
        if (shipment.shipping_status !== newStatus) {
          await this.update({
            data: {
              id: shipment.id,
              shipping_status: newStatus,
              delivered_date: newStatus === "delivered" ? new Date() : shipment.delivered_date,
            },
          });
        }
      }
      console.log(`✅ Tracking synced: ${shipment.awb_number}`);
    } catch (error) {
      console.error(
        "❌ Tracking Sync Error:",
        error?.response?.data || error.message
      );
    }
  }
}

const ShippingService = new Service();
export default ShippingService;
