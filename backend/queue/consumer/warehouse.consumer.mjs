import pLimit from "p-limit";
import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import { validationResult } from "express-validator";
import WarehouseService from "../../services/warehouse.service.mjs";
import WarehouseValidations from "../../validators/warehouse.validator.mjs";
import {
  createCsvFromArray,
  readCsvAsArray,
} from "../../utils/basic.utils.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.warehouse?.import?.queue ||
      !queueConfig?.warehouse?.import?.exchange
    ) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.import_queue = queueConfig.warehouse.import.queue;
    this.import_exchange = queueConfig.warehouse.import.exchange;
    this.import_routingKey = queueConfig.warehouse.import.routingKey;

    this.repository = FactoryRepository.getRepository("warehouse");
    this.limit = pLimit(10); // max 10 concurrent jobs
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
          console.time("bulk-import-warehouse");

          const { files = null, metadata = null } = msg;

          if (!files) throw new Error("No files provided.");
          if (!metadata || !metadata.id)
            throw new Error(
              "metadata.id (product's document id) is not provided."
            );

          async function validateRow(row) {
            const req = { body: row };
            await Promise.all(
              WarehouseValidations.create().map((v) => v.run(req))
            );
            const errors = validationResult(req);
            return errors.isEmpty() ? null : errors.array();
          }

          const fileBuffer = files[0]?.file?.buffer;
          if (!fileBuffer) throw new Error("File buffer missing.");

          let rows = await readCsvAsArray(Buffer.from(fileBuffer));
          rows = rows.map((e) => ({
            userId: metadata.id,
            name: e.name || "",
            contactName: e.contactName || "",
            contactPhone: e.contactPhone || "",
            address: e.address || "",
            city: e.city || "",
            state: e.state || "",
            pincode: e.pincode || "",
            support_email: e.support_email || "",
            support_phone: e.support_phone || "",
            hide_end_customer_contact_number: false,
            hide_warehouse_mobile_number: false,
            hide_warehouse_address: false,
            hide_product_details: false,
          }));
          const rowsValidation = await Promise.all(
            rows.map((e) =>
              validateRow(e).then((check) =>
                check
                  ? { success: false, value: e, reason: check }
                  : { success: true, value: e }
              )
            )
          );

          await Promise.all(
            rowsValidation
              .filter((e) => e.success)
              .map((e) =>
                this.limit(async () => {
                  // await new Promise((resolve) => setTimeout(resolve, 1000));
                  return await WarehouseService.create({
                    data: {
                      ...e.value,
                      labelDetails: {
                        support_email: e.support_email,
                        support_phone: e.support_phone,
                        hide_end_customer_contact_number:
                          e.hide_end_customer_contact_number,
                        hide_warehouse_mobile_number:
                          e.hide_warehouse_mobile_number,
                        hide_warehouse_address: e.hide_warehouse_address,
                        hide_product_details: e.hide_product_details,
                      },
                    },
                  });
                })
              )
          );

          const invalidData = rowsValidation
            .filter((e) => e.success == false)
            .map((e) => ({
              value: e.value,
              reason: e.reason.map((error) => ({
                field: error.path,
                message: error.msg,
              })),
            }));

          if (invalidData.length > 0) {
            const csvData = createCsvFromArray(
              invalidData.flatMap((e) =>
                e.reason.map((r) => ({ ...r, name: e.value.name }))
              )
            );
            console.error("invalid-data:");
            console.error(csvData);
          }

          console.timeEnd("bulk-import-warehouse");
        },
        { exchange: this.import_exchange, routingKey: this.import_routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const WarehouseConsumer = new Class();
export default WarehouseConsumer;
