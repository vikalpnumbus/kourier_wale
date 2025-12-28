import queueConfig from "../../../configurations/queue.config.mjs";
import rabbitMQ from "../../../configurations/rabbitMQ.config.mjs";
import FactoryRepository from "../../../repositories/factory.repository.mjs";
import ExportsHandlerFactory from "../../../services/admin/exports/exports.factory.mjs";
import ImportsHandlerFactory from "../../../services/admin/imports/imports.factory.mjs";

class Class {
  constructor() {
    if (!queueConfig?.adminImports?.queue || !queueConfig?.adminImports?.exchange || !queueConfig?.adminImports?.routingKey) {
      throw new Error("Missing exchange and Consumer.");
    }

    this.exchange = queueConfig.adminImports?.exchange;
    this.queue = queueConfig.adminImports?.queue;
    this.routingKey = queueConfig.adminImports?.routingKey;

    this.error = null;
    this.repository = FactoryRepository.getRepository("exportJobs");
    this.handler = null;
  }

  async handleImportProcessConsumer() {
    try {
      await rabbitMQ.consume(
        this.queue,
        async (msg) => {
          const { type, file, importJobId } = msg;

          if (type == "utr") {
            this.handler = ImportsHandlerFactory.getImportsHandler("utr");
          } else {
            throw new Error("This type has not been implemented yet.");
          }
          console.time("admin-imports-queue");
          await this.handler.createData({ file, importJobId });

          console.timeEnd("admin-imports-queue");
        },

        { exchange: this.exchange, routingKey: this.routingKey }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

const AdminImportsConsumer = new Class();
export default AdminImportsConsumer;
