import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.products?.exchange ||
      !queueConfig?.products?.routingKey ||
      !queueConfig?.products.import?.exchange ||
      !queueConfig?.products.import?.routingKey
    ) {
      throw new Error("Missing exchange and Routing Key.");
    }
    this.exchange = queueConfig.products.exchange;
    this.routingKey = queueConfig.products.routingKey;
    this.import_exchange = queueConfig.products.import.exchange;
    this.import_routingKey = queueConfig.products.import.routingKey;
  }
  async publish(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
  async publishImportFile(data) {
    try {
      await rabbitMQ.publish(
        this.import_exchange,
        this.import_routingKey,
        data
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const ProductsProducer = new Class();
export default ProductsProducer;
