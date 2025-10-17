import WarehouseConsumer from "../queue/consumer/warehouse.consumer.mjs";

(async () => {
  await WarehouseConsumer.importConsume();
})();
