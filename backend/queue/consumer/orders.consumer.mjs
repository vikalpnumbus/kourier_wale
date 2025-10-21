import pLimit from "p-limit";
import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import { validationResult } from "express-validator";
import OrdersService from "../../services/orders.service.mjs";
import OrdersValidations from "../../validators/orders.validator.mjs";
import {
  createCsvFromArray,
  readCsvAsArray,
} from "../../utils/basic.utils.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.orders?.exchange ||
      !queueConfig?.orders?.import?.queue ||
      !queueConfig?.orders?.create?.queue
    ) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.exchange = queueConfig.orders.exchange;

    this.import_queue = queueConfig.orders.import.queue;
    this.import_routingKey = queueConfig.orders.import.routingKey;

    this.create_queue = queueConfig.orders.create.queue;
    this.create_routingKey = queueConfig.orders.create.routingKey;

    this.repository = FactoryRepository.getRepository("orders");
    this.limit = pLimit(225);
  }

  async updateFunc({ id, payload }) {
    const result = await this.repository.findOneAndUpdate({ id }, payload);
    return result;
  }

  async importConsume() {
    try {
      await rabbitMQ.consume(
        this.import_queue,
        async (msg) => {
          console.time("bulk-import-orders");

          const { files = null, metadata = null } = msg;

          if (!files) throw new Error("No files provided.");
          if (!metadata || !metadata.id)
            throw new Error(
              "metadata.id (user's document id) is not provided."
            );

          async function validateRow(row) {
            const req = { body: row };
            await Promise.all(
              OrdersValidations.create().map((v) => v.run(req))
            );
            const errors = validationResult(req);
            return errors.isEmpty() ? null : errors.array();
          }

          const fileBuffer = files[0]?.file?.buffer;
          if (!fileBuffer) throw new Error("File buffer missing.");

          let rows = await readCsvAsArray(Buffer.from(fileBuffer));
          const productRegex = /^Product (\d+) (ID|Qty)$/;

          rows = rows.map((e, index) => {
            const payload = {
              userId: metadata.id,
              orderId: e["orderId"],
              orderAmount: e["orderAmount"],
              collectableAmount:
                e["paymentType"] == "cod"
                  ? e["collectableAmount"] ?? e["orderAmount"]
                  : "0",
              paymentType: e["paymentType"],
              order_source: "portal_import",
              shippingDetails: {
                phone: e["shippingDetails.phone"],
                fname: e["shippingDetails.fname"],
                lname: e["shippingDetails.lname"],
                address: e["shippingDetails.address"],
                city: e["shippingDetails.city"],
                state: e["shippingDetails.state"],
                country: e["shippingDetails.country"],
                pincode: e["shippingDetails.pincode"],
              },
              packageDetails: {
                weight: e["packageDetails.weight"],
                length: e["packageDetails.length"],
                height: e["packageDetails.height"],
                breadth: e["packageDetails.breadth"],
                volumetricWeight:
                  (e["packageDetails.length"] *
                    e["packageDetails.breadth"] *
                    e["packageDetails.height"]) /
                  5,
              },
              charges: {
                shipping: e["charges.shipping"],
                tax_amount: e["charges.tax_amount"],
                cod: e["charges.cod"],
                discount: e["charges.discount"],
              },
              warehouse_id: e["warehouse_id"],
              rto_warehouse_id: e["rto_warehouse_id"],
            };

            const productMap = [];

            for (const key in e) {
              const match = key.match(productRegex);
              if (!match) continue;
              const [, number, type] = match;
              let prod = productMap[number] || { id: null, qty: null };
              if (type === "ID") prod.id = e[key];
              if (type === "Qty") prod.qty = e[key];
              productMap[number] = prod;
            }

            payload.products = productMap.filter((p) => p.id && p.qty);
            return payload;
          });

          const rowsValidation = await Promise.all(
            rows.map((e) =>
              validateRow(e).then((check) =>
                check
                  ? { success: false, value: e, reason: check }
                  : { success: true, value: e }
              )
            )
          );
          const response = await Promise.all(
            rowsValidation
              .filter((e) => e.success)
              .map((e) =>
                this.limit(async () => {
                  const result = await OrdersService.create({
                    data: {
                      ...e.value,
                    },
                  });

                  if (!result) {
                    return {
                      success: false,
                      orderId: e.value.orderId,
                      error:
                        OrdersService.error?.message || "Some error occured.",
                    };
                  }
                  return { success: true, ...result };
                })
              )
          );

          let invalidData = rowsValidation
            .filter((e) => e.success == false)
            .map((e) => ({
              value: e.value,
              reason: e.reason.map((error) => ({
                field: error.path,
                message: error.msg,
              })),
            }));

          if (invalidData.length > 0) {
            createCsvFromArray({
              userId: metadata.id,
              data: invalidData.flatMap((e) => {
                return e.reason.map((r) => ({
                  orderId: e.value.orderId,
                  ...r,
                }));
              }),
              dir: "orders-import",
            });
          }
          if (response.filter((e) => !e.success).length > 0) {
            createCsvFromArray({
              userId: metadata.id,
              data: response
                .filter((e) => !e.success)
                .map((e) => ({ orderId: e.orderId, error: e.error })),
              dir: "orders-import",
            });
          }

          console.timeEnd("bulk-import-orders");
        },
        { exchange: this.exchange, routingKey: this.import_routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async createOrderConsumer() {
    try {
      await rabbitMQ.consume(
        this.create_queue,
        async (msg) => {
          console.time("bulk-create-orders");
          await msg.map(async (order) => {
            const savedOrder = await OrdersService.create({ data: order });
            if(!savedOrder){
              console.error(OrdersService.error)
            }
          });
          console.timeEnd("bulk-create-orders");
        },
        { exchange: this.exchange, routingKey: this.create_routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const OrdersConsumer = new Class();
export default OrdersConsumer;
