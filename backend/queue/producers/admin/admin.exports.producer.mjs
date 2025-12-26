import queueConfig from "../../../configurations/queue.config.mjs";
import rabbitMQ from "../../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (!queueConfig?.adminExports?.exchange || !queueConfig?.adminExports?.routingKey || !queueConfig?.adminExports?.queue) {
      throw new Error("Missing exchange, queue and routing Key.");
    }

    this.exchange = queueConfig.adminExports.exchange;
    this.routingKey = queueConfig.adminExports.routingKey;
  }

  async publishData(data) {
    try {
      await rabbitMQ.publish(this.exchange, this.routingKey, data);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const AdminExportsProducer = new Class();
export default AdminExportsProducer;
