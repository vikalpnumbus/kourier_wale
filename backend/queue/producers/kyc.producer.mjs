import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (!queueConfig?.kyc?.exchange || !queueConfig?.kyc?.routingKey) {
      throw new Error("Missing exchange and Routing Key.");
    }
    this.exchange = queueConfig.kyc.exchange;
    this.routingKey = queueConfig.kyc.routingKey;
  }
  async publish(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const KycProducer = new Class();
export default KycProducer;
