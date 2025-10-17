import OrdersConsumer from "../queue/consumer/orders.consumer.mjs";

(async () => {
  await OrdersConsumer.importConsume();
  await OrdersConsumer.exportConsume();
})();
