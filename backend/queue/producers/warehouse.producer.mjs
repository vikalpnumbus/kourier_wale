import queueConfig from "../../configurations/queue.config.mjs";
import rabbitMQ from "../../configurations/rabbitMQ.config.mjs";

class Class {
  constructor() {
    if (
      !queueConfig?.warehouse.import?.exchange ||
      !queueConfig?.warehouse.import?.routingKey
    ) {
      throw new Error("Missing exchange and Routing Key.");
    }

    this.import_exchange = queueConfig.warehouse.import.exchange;
    this.import_routingKey = queueConfig.warehouse.import.routingKey;
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

const WarehouseProducer = new Class();
export default WarehouseProducer;
