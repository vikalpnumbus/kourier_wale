import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ImageService from "../../services/image.service.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.bankDetails?.queue ||
      !queueConfig?.bankDetails?.exchange
    ) {
      throw new Error("Missing exchange and Consumer.");
    }
    this.queue = queueConfig.bankDetails.queue;
    this.exchange = queueConfig.bankDetails.exchange;
    this.routingKey = queueConfig.bankDetails.routingKey;

    this.repository = FactoryRepository.getRepository("bankDetails");
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
              "metadata.id (bankDetails document id) is not provided."
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
}

const BankDetailsConsumer = new Class();
export default BankDetailsConsumer;
