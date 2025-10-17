import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.orders.exchange ||
      !queueConfig?.orders.import?.routingKey
    ) {
      throw new Error("Missing exchange and Routing Key.");
    }

    this.import_exchange = queueConfig.orders.exchange;
    this.import_routingKey = queueConfig.orders.import.routingKey;
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

const OrdersProducer = new Class();
export default OrdersProducer;
