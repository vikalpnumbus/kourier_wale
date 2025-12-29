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

  async handleExportProcessConsumer() {
    try {
      await rabbitMQ.consume(
        this.queue,
        async (msg) => {
          const { type, filters, exportJobId } = msg;
          
          if (type == "orders") {
            this.handler = ExportsHandlerFactory.getExportsHandler("orders");
          }
          else if (type == "shipping") {
            this.handler = ExportsHandlerFactory.getExportsHandler("shipping");
          } 
          else if (type == "products") {
            this.handler = ExportsHandlerFactory.getExportsHandler("products");
          } 
           else if (type == "remittance") {
            this.handler = ExportsHandlerFactory.getExportsHandler("remittance");
          } 
           else if (type == "shippingCharges") {
            this.handler = ExportsHandlerFactory.getExportsHandler("shippingCharges");
          } 
          else {
            throw new Error("This type has not been implemented yet.");
          }
          console.time("admin-exports-queue");

          await this.handler.getData({ filters, exportJobId });

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
