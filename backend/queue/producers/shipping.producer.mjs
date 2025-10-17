import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.shipping?.exchange ||
      !queueConfig?.shipping?.create?.routingKey ||
      !queueConfig?.shipping?.cancel?.routingKey ||
      !queueConfig?.shipping?.retry?.routingKey
    ) {
      throw new Error("Missing exchange and Routing Key.");
    }

    this.exchange = queueConfig.shipping.exchange;
    this.routingKey = queueConfig.shipping.create?.routingKey;
    this.cancel_routingKey = queueConfig.shipping.cancel?.routingKey;
    this.retry_routingKey = queueConfig.shipping.retry?.routingKey;
  }

  async publishData(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async publishShipmentCancelData(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.cancel_routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async publishShipmentRetryData(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.retry_routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const ShippingProducer = new Class();
export default ShippingProducer;
