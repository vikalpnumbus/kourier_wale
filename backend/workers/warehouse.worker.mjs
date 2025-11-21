import { parentPort, isMainThread } from "node:worker_threads";
import WarehouseConsumer from "../queue/consumer/warehouse.consumer.mjs";

(async () => {
  await WarehouseConsumer.importConsume();

  if (!isMainThread && parentPort) {
    parentPort.postMessage("ready");
  }
})();
