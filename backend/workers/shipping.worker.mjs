import shippingCron from "../crons/shipping.cron.mjs";
import ShopifyProvider from "../providers/couriers/shopify.provider.mjs";
import ShippingConsumer from "../queue/consumer/shipping.consumer.mjs";

(async () => {
  await ShippingConsumer.handleShipmentCreateConsumer();
  await ShippingConsumer.handleShipmentCancelConsumer();
  await ShippingConsumer.handleShipmentRetryConsumer();
  await shippingCron.start();

  // const fetchShopifyOrders = await ShopifyProvider.fetchShopifyOrders(
  //   "rahul-store-44895.myshopify.com",
  //   "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"
  // );
  // console.log('fetchShopifyOrders: ', JSON.stringify(fetchShopifyOrders, null, 1));

  // const fulfillOrder = await ShopifyProvider.fulfillOrder(
  //   "rahul-store-44895.myshopify.com",
  //   "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",
  //   6660472209684,
  //   109660930324
  // );
  // console.log('fulfillOrder: ', fulfillOrder);

  // const cancelOrder = await ShopifyProvider.cancelOrder(
  //   "rahul-store-44895.myshopify.com",
  //   "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",
  //   6656824934676
  // );
  // console.log("cancelOrder.cancel_reason: ", cancelOrder.order.cancel_reason);
  // console.log("cancelOrder.cancelled_at: ", cancelOrder.order.cancelled_at);
})();
