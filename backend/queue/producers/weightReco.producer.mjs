import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (!queueConfig?.weightReco.exchange || !queueConfig?.weightReco?.routingKey) {
      throw new Error("Missing exchange and Routing Key.");
    }

    this.exchange = queueConfig.weightReco.exchange;
    this.routingKey = queueConfig.weightReco.routingKey;
  }

  async publishImportFile(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const WeightRecoProducer = new Class();
export default WeightRecoProducer;
