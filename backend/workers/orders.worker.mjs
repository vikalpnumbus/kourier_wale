import { parentPort, isMainThread } from "node:worker_threads";
import OrdersConsumer from "../queue/consumer/orders.consumer.mjs";

(async () => {
  await OrdersConsumer.importConsume();
  await OrdersConsumer.createOrderConsumer();

  if (!isMainThread && parentPort) {
    parentPort.postMessage("ready");
  }
})();
