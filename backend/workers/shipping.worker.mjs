import shippingCron from "../crons/shipping.cron.mjs";
import ShippingConsumer from "../queue/consumer/shipping.consumer.mjs";

(async () => {
  await ShippingConsumer.handleShipmentCreateConsumer();
  await ShippingConsumer.handleShipmentCancelConsumer();
  await ShippingConsumer.handleShipmentRetryConsumer();
  await shippingCron.start();
})();
