import pLimit from "p-limit";
import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ImageService from "../../services/image.service.mjs";
import ProductsValidations from "../../validators/products.validator.mjs";
import { validationResult } from "express-validator";
import axios from "axios";
import ProductsService from "../../services/products.service.mjs";
import {
  createCsvFromArray,
  readCsvAsArray,
} from "../../utils/basic.utils.mjs";

class Class {
  constructor() {
    if (!queueConfig?.products?.queue || !queueConfig?.products?.exchange) {
      throw new Error("Missing exchange and Consumer.");
    }
    this.queue = queueConfig.products.queue;
    this.exchange = queueConfig.products.exchange;
    this.routingKey = queueConfig.products.routingKey;

    this.import_queue = queueConfig.products.import.queue;
    this.import_exchange = queueConfig.products.import.exchange;
    this.import_routingKey = queueConfig.products.import.routingKey;

    this.repository = FactoryRepository.getRepository("products");
    this.limit = pLimit(10); // max 10 concurrent jobs
  }

  async consume() {
    try {
      await rabbitMQ.consume(
        this.queue,
        async (msg) => {
          // console.info("-------------------------------");
          // console.info("📥 Received");

          const { files = null, metadata = null } = msg;

          if (!files) throw new Error("No files provided.");
          if (!metadata || !metadata.id)
            throw new Error(
              "metadata.id (product's document id) is not provided."
            );
          const receivedFiles = files;
          const paths = await Promise.all(
            receivedFiles.map((e) => {
              return ImageService.processImage(e);
            })
          );

          await this.updateFunc({
            id: metadata.id,
            payload: paths.reduce((acc, e) => {
              acc[e.fieldname] = e.path;
              return acc;
            }, {}),
          });
          // console.info(`✅ Task done`);
          // console.info("-------------------------------");
        },
        { exchange: this.exchange, routingKey: this.routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
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
          console.time("bulk-import-products");

          const { files = null, metadata = null } = msg;

          if (!files) throw new Error("No files provided.");
          if (!metadata || !metadata.id)
            throw new Error(
              "metadata.id (product's document id) is not provided."
            );

          async function validateRow(row) {
            const req = { body: row };
            await Promise.all(
              ProductsValidations.create().map((v) => v.run(req))
            );
            const errors = validationResult(req);
            return errors.isEmpty() ? null : errors.array();
          }

          const fileBuffer = files[0]?.file?.buffer;
          if (!fileBuffer) throw new Error("File buffer missing.");

          let rows = await readCsvAsArray(Buffer.from(fileBuffer));
          rows = rows.map((e) => ({
            ...e,
            userId: metadata.id,
            name: e.name || "",
            sku: e.sku || "",
            price: e.price || "",
            category: e.category?.toLowerCase().trim() || "",
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
                  const value = e.value;
                  if (value.image) {
                    try {
                      const resp = await axios.get(value?.image, {
                        responseType: "arraybuffer",
                      });
                      const imageBuffer = resp?.data;

                      return await ProductsService.create({
                        files: [
                          {
                            buffer: imageBuffer,
                            fieldname: "productImage",
                          },
                        ],
                        data: value,
                      });
                    } catch (error) {
                      console.warn(
                        `Image download failed for SKU=${value.sku}`
                      );
                    }
                  }

                  delete value.image;
                  value.productImage = [];

                  return await ProductsService.create({
                    data: value,
                  });
                })
              )
          );

          const invalidData = rowsValidation
            .filter((e) => e.success == false)
            .map((e) => ({
              value: e.value,
              reason: e.reason.map((error) => ({
                path: error.path,
                msg: error.msg,
              })),
            }));

          if (invalidData.length > 0) {
            createCsvFromArray({
              userId: metadata.id,
              data: invalidData.flatMap((e) => {
                return e.reason.map((r) => {
                  const payload = {
                    name: e.value.name,
                    field: r.path,
                    error: r.msg,
                  };
                  return payload;
                });
              }),
              dir: "products-import",
            });
          }

          console.timeEnd("bulk-import-products");
        },
        { exchange: this.import_exchange, routingKey: this.import_routingKey }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const ProductsConsumer = new Class();
export default ProductsConsumer;
