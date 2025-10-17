import ProductsConsumer from "../queue/consumer/products.consumer.mjs";

(async () => {
  await ProductsConsumer.consume();
  await ProductsConsumer.importConsume();
})();
