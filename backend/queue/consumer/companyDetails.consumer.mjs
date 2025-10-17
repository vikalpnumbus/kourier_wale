import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ImageService from "../../services/image.service.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.companyDetails?.queue ||
      !queueConfig?.companyDetails?.exchange
    ) {
      throw new Error("Missing exchange and Consumer.");
    }
    this.queue = queueConfig.companyDetails.queue;
    this.exchange = queueConfig.companyDetails.exchange;
    this.routingKey = queueConfig.companyDetails.routingKey;

    this.repository = FactoryRepository.getRepository("user");
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
            throw new Error("metadata.id (user id) is not provided.");

          const receivedFiles = files;
          const paths = await Promise.all(
            receivedFiles.map((e) => {
              return ImageService.processImage(e);
            })
          );

          await this.updatecompanyDetails({
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

  async updatecompanyDetails({ id, payload }) {
    const { companyLogo } = payload;
    const result = await this.repository.findOneAndUpdate(
      { id },
      {
        companyLogo: companyLogo,
      }
    );
    return result;
  }
}

const CompanyDetailsConsumer = new Class();
export default CompanyDetailsConsumer;
