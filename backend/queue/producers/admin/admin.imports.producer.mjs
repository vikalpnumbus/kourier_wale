import queueConfig from "../../../configurations/queue.config.mjs";
import rabbitMQ from "../../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (!queueConfig?.adminImports?.exchange || !queueConfig?.adminImports?.routingKey || !queueConfig?.adminImports?.queue) {
      throw new Error("Missing exchange, queue and routing Key.");
    }

    this.exchange = queueConfig.adminImports.exchange;
    this.routingKey = queueConfig.adminImports.routingKey;
  }

  async publishData(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const AdminImportsProducer = new Class();
export default AdminImportsProducer;
