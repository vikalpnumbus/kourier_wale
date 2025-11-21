import pLimit from "p-limit";
import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import UserService from "../../services/user.service.mjs";
import XpressBeesProvider from "../../providers/couriers/xpressbees.provider.mjs";
import ShadowfaxProvider from "../../providers/couriers/shadowfax.provider.mjs";
import ShippingService from "../../services/shipping.service.mjs";
import CourierAWBListService from "../../services/courierAWBList.service.mjs";
import { createCsvFromArray } from "../../utils/basic.utils.mjs";
import WarehouseService from "../../services/warehouse.service.mjs";
import CourierService from "../../services/courier.service.mjs";
import OrdersService from "../../services/orders.service.mjs";
import { priceCalculator } from "../../controllers/pricingCard.controller.mjs";
import PricingCardService from "../../services/pricingCard.service.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.shipping?.create?.queue ||
      !queueConfig?.shipping?.exchange
    ) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.exchange = queueConfig.shipping?.exchange;
    this.queue = queueConfig.shipping?.create.queue;
    this.routingKey = queueConfig.shipping?.create.routingKey;

    this.cancel_queue = queueConfig.shipping.cancel?.queue;
    this.cancel_routingKey = queueConfig.shipping.cancel?.routingKey;

    this.retry_queue = queueConfig.shipping.retry?.queue;
    this.retry_routingKey = queueConfig.shipping.retry?.routingKey;

    this.error = null;
    this.repository = FactoryRepository.getRepository("shipping");
    this.limit = pLimit(100);
  }

  async handleShipmentCreateConsumer() {
    try {
      await rabbitMQ.consume(
        this.queue,
        async (msg) => {
          console.time("single-ship-orders");

          let {
            order_db_ids,
            warehouse_id,
            rto_warehouse_id,
            courier_id,
            zone,
            plan_id,
            userId,
          } = msg;

          order_db_ids = [...new Set(msg.order_db_ids)];

          const shipmentArray = await Promise.all(
            order_db_ids.map((id) =>
              this.limit(async () => {
                try {
                  const warehouseData = await WarehouseService.read({
                    id: warehouse_id,
                  });
                  const originPincode =
                    (await warehouseData?.data?.result?.[0]?.pincode) || null;
                  const orderData =
                    (await OrdersService.read({ id: id, userId }))?.data
                      ?.result?.[0] || null;
                  const destinationPincode =
                    orderData?.shippingDetails?.pincode || null;
                  const weight = orderData?.packageDetails?.weight || null;
                  const length = orderData?.packageDetails?.length || null;
                  const breadth = orderData?.packageDetails?.breadth || null;
                  const height = orderData?.packageDetails?.height || null;
                  const paymentType = orderData?.paymentType || null;

                  const result = await PricingCardService.priceCalculator({
                    origin: originPincode,
                    destination: destinationPincode,
                    weight,
                    length,
                    breadth,
                    height,
                    paymentType,
                    userId,
                  });
                  const { cod_charge, freight_charge } = result.rows.filter(
                    (e) => e.courier_id == courier_id
                  )?.[0];

                  const shipmentRes = await ShippingService.create({
                    data: {
                      order_id: id,
                      warehouse_id,
                      rto_warehouse_id,
                      courier_id,
                      freight_charge,
                      cod_price: cod_charge,
                      zone,
                      plan_id,
                      userId,
                    },
                  });
                  if (!shipmentRes) throw ShippingService.error;
                  return { success: true, value: id };
                } catch (error) {
                  return { success: false, value: id, reason: error.message };
                }
              })
            )
          );

          if (shipmentArray.filter((e) => !e.success).length > 0) {
            createCsvFromArray({
              userId,
              data: shipmentArray
                .filter((e) => !e.success)
                .map((e) => ({ orderId: e.value, error: e.reason })),
              dir: "shipping",
            });
          }
          console.timeEnd("single-ship-orders");
        },

        { exchange: this.exchange, routingKey: this.routingKey }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async handleShipmentCancelConsumer() {
    try {
      await rabbitMQ.consume(
        this.cancel_queue,
        async (msg) => {
          // console.time("single-ship-cancel-orders");
          let { shipment_ids, userId } = msg;

          shipment_ids = [...new Set(msg.shipment_ids)];

          const shipmentArray = await Promise.all(
            shipment_ids.map((id) =>
              this.limit(async () => {
                try {
                  const shipmentRes =
                    await ShippingService.handleCancelSingleShipment({
                      data: {
                        id,
                        userId,
                      },
                    });
                  if (!shipmentRes) throw ShippingService.error;
                  return { success: true, value: id };
                } catch (error) {
                  return { success: false, value: id, reason: error.message };
                }
              })
            )
          );

          if (shipmentArray.filter((e) => !e.success).length > 0) {
            createCsvFromArray({
              userId,
              data: shipmentArray
                .filter((e) => !e.success)
                .map((e) => ({ id: e.value, error: e.reason })),
              dir: "shipping",
            });
          }
          // console.timeEnd("single-ship-cancel-orders");
        },

        { exchange: this.exchange, routingKey: this.cancel_routingKey }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async handleShipmentRetryConsumer() {
    try {
      await rabbitMQ.consume(
        this.retry_queue,
        async (msg) => {
          // console.time("single-ship-retry-orders");
          const [warehousesRes, courier] = [
            await WarehouseService.read({
              id: [msg.warehouse_id, msg.rto_warehouse_id],
            }),
            await CourierService.read({ id: msg.courier_id }),
          ];
          const warehouses = warehousesRes?.data?.result || [];

          const createSingleShipment =
            await ShippingService.handleCreateSingleShipment({
              ...msg,
              warehouses,
              courier,
            });
          if (!createSingleShipment) {
            throw ShippingService.error;
          }
          // console.timeEnd("single-ship-retry-orders");
        },

        { exchange: this.exchange, routingKey: this.retry_routingKey }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

const ShippingConsumer = new Class();
export default ShippingConsumer;
