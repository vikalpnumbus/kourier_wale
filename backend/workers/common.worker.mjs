import { parentPort, isMainThread } from "node:worker_threads";
import BankDetailsConsumer from "../queue/consumer/bankDetails.consumer.mjs";
import CompanyDetailsConsumer from "../queue/consumer/companyDetails.consumer.mjs";
import KycConsumer from "../queue/consumer/kyc.consumer.mjs";
import WeightRecoConsumer from "../queue/consumer/weightReco.consumer.mjs";

(async () => {
  await CompanyDetailsConsumer.consume();
  await BankDetailsConsumer.consume();
  await KycConsumer.consume();
  await WeightRecoConsumer.consume();

  if (!isMainThread && parentPort) {
    parentPort.postMessage("ready");
  }
})();
