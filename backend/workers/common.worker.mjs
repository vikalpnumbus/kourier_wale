import BankDetailsConsumer from "../queue/consumer/bankDetails.consumer.mjs";
import CompanyDetailsConsumer from "../queue/consumer/companyDetails.consumer.mjs";
import KycConsumer from "../queue/consumer/kyc.consumer.mjs";

(async () => {
  await CompanyDetailsConsumer.consume();
  await BankDetailsConsumer.consume();
  await KycConsumer.consume();
})();
