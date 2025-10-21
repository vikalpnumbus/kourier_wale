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

    this.exchange = queueConfig.orders.exchange;
    this.import_routingKey = queueConfig.orders.import.routingKey;
    this.create_routingKey = queueConfig.orders.create.routingKey;
  }

  async publishImportFile(data) {
    try {
      await rabbitMQ.publish(
        this.exchange,
        this.import_routingKey,
        data
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async publishCreateOrder(data) {
    try {
      await rabbitMQ.publish(
        this.exchange,
        this.create_routingKey,
        data
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

const OrdersProducer = new Class();
export default OrdersProducer;
