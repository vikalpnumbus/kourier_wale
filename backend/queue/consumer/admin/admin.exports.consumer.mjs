import queueConfig from "../../../configurations/queue.config.mjs";
import rabbitMQ from "../../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../../repositories/factory.repository.mjs";
import ExportsHandlerFactory from "../../../services/admin/exports/exports.factory.mjs";

class Class {
  constructor() {
    if (!queueConfig?.adminExports?.queue || !queueConfig?.adminExports?.exchange || !queueConfig?.adminExports?.routingKey) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.exchange = queueConfig.adminExports?.exchange;
    this.queue = queueConfig.adminExports?.queue;
    this.routingKey = queueConfig.adminExports?.routingKey;

    this.error = null;
    this.repository = FactoryRepository.getRepository("exportJobs");
    this.handler = null;
  }

  async handleExprotProcessConsumer() {
    try {
      await rabbitMQ.consume(
        this.queue,
        async (msg) => {
          console.time("admin-exports-queue");

          const { type, filters, format, exportJobId } = msg;

          if (type == "orders") {
            this.handler = ExportsHandlerFactory.getExportsHandler("orders");
          }
          const data = await this.handler.getData({ filters, exportJobId });

          console.timeEnd("admin-exports-queue");
        },

        { exchange: this.exchange, routingKey: this.routingKey }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

const AdminExportsConsumer = new Class();
export default AdminExportsConsumer;
