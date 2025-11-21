import { parentPort, isMainThread } from "node:worker_threads";
import ProductsConsumer from "../queue/consumer/products.consumer.mjs";

(async () => {
  await ProductsConsumer.consume();
  await ProductsConsumer.importConsume();

  if (!isMainThread && parentPort) {
    parentPort.postMessage("ready");
  }
})();
