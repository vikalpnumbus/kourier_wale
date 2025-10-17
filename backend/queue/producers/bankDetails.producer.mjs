import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.bankDetails?.exchange ||
      !queueConfig?.bankDetails?.routingKey
    ) {
      throw new Error("Missing exchange and Routing Key.");
    }
    this.exchange = queueConfig.bankDetails.exchange;
    this.routingKey = queueConfig.bankDetails.routingKey;
  }
  async publish(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const BankDetailsProducer = new Class();
export default BankDetailsProducer;
