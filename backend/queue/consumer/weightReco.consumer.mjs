import pLimit from "p-limit";
import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import { validationResult } from "express-validator";
import OrdersService from "../../services/orders.service.mjs";
import OrdersValidations from "../../validators/orders.validator.mjs";
import { createCsvFromArray, readCsvAsArray } from "../../utils/basic.utils.mjs";

class Class {
  constructor() {
    if (!queueConfig?.weightReco?.exchange || !queueConfig?.weightReco?.queue) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.exchange = queueConfig.weightReco.exchange;

    this.queue = queueConfig.weightReco.queue;
    this.routingKey = queueConfig.weightReco.routingKey;

    this.repository = FactoryRepository.getRepository("weightReco");
    this.limit = pLimit(225);
  }

  async updateFunc({ id, payload }) {
    const result = await this.repository.findOneAndUpdate({ id }, payload);
    return result;
  }

  async consume() {
    try {
      await rabbitMQ.consume(
        this.import_queue,
        async (msg) => {
          const { files = null, metadata = null } = msg;

          if (!files) throw new Error("No files provided.");
          if (!metadata || !metadata.id) throw new Error("metadata.id (user's document id) is not provided.");

          async function validateRow(row) {
            return null;
            // const req = { body: row };
            // await Promise.all(OrdersValidations.create().map((v) => v.run(req)));
            // const errors = validationResult(req);
            // return errors.isEmpty() ? null : errors.array();
          }

          const fileBuffer = files[0]?.file?.buffer;
          if (!fileBuffer) throw new Error("File buffer missing.");

          let rows = await readCsvAsArray(Buffer.from(fileBuffer));

          rows = rows.map((e, index) => {
            const payload = {
              userId: metadata.id,
              ...e,
            };

            return payload;
          });

          const rowsValidation = await Promise.all(
            rows.map((e) => validateRow(e).then((check) => (check ? { success: false, value: e, reason: check } : { success: true, value: e })))
          );
          const response = await Promise.all(
            rowsValidation
              .filter((e) => e.success)
              .map((e) =>
                this.limit(async () => {
                  return { success: true };
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

          // if (invalidData.length > 0) {
          //   createCsvFromArray({
          //     userId: metadata.id,
          //     data: invalidData.flatMap((e) => {
          //       return e.reason.map((r) => ({
          //         // orderId: e.value.orderId,
          //         ...r,
          //       }));
          //     }),
          //     dir: "weightReco",
          //   });
          // }
          if (response.filter((e) => !e.success).length > 0) {
            createCsvFromArray({
              userId: metadata.id,
              data: response.filter((e) => !e.success).map((e) => ({ orderId: e.orderId, error: e.error })),
              dir: "weightReco",
            });
          }
        },
        { exchange: this.exchange, routingKey: this.routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const WeightRecoConsumer = new Class();
export default WeightRecoConsumer;
