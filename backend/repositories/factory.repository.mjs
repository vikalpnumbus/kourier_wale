import BankDetailsModel from "../model/bankDetails.sql.model.mjs";
import CourierModel from "../model/courier.sql.model.mjs";
import CourierAWBListModel from "../model/courierAWBList.sql.model.mjs";
import CourierPricingCardModel from "../model/courierPricingCard.sql.model.mjs";
import CSVModel from "../model/csvLogs.sql.model.mjs";
import KycModel from "../model/kyc.sql.model.mjs";
import OrdersModel from "../model/orders.sql.model.mjs";
import OTPModel from "../model/otp.sql.model.mjs";
import PricingCardModel from "../model/pricingCard.sql.model.mjs";
import PricingPlansModel from "../model/pricingPlans.sql.model.mjs";
import ProductsModel from "../model/products.sql.model.mjs";
import ServiceablePincodeModel from "../model/serviceablePincodes.sql.model.mjs";
import ShippingModel from "../model/shipping.sql.model.mjs";
import UserModel from "../model/user.sql.model.mjs";
import UserCourierModel from "../model/user_courier.sql.model.mjs";
import WarehouseModel from "../model/warehouse.sql.model.mjs";
import { BaseRepositoryClass } from "./base.sql.repository.mjs";
// import { BankDetailsRepositoryClass } from "./bankDetails.sql.repository.mjs";
// import { CourierRepositoryClass } from "./courier.sql.repository.mjs";
// import { CourierPricingCardRepositoryClass } from "./courierPricingCard.repository.mjs";
// import { CSVRepositoryClass } from "./csvLogs.repository.mjs";
// import { KYCRepositoryClass } from "./kyc.sql.repository.mjs";
// import { OrdersRepositoryClass } from "./orders.sql.repository.mjs";
// import { OtpRepositoryClass } from "./otp.sql.repository.mjs";
// import { PricingCardRepositoryClass } from "./pricingCard.repository.mjs";
// import { PricingPlansRepositoryClass } from "./pricingPlans.repository.mjs";
// import { ProductsRepositoryClass } from "./products.sql.repository.mjs";
// import { ServiceablePincodeRepositoryClass } from "./serviceablePincode.repository.mjs";
// import { UserCourierRepositoryClass } from "./user_courier.sql.repository.mjs";
// import { WarehouseRepositoryClass } from "./warehouse.sql.repository.mjs";

class Class {
  getRepository(model) {
    const repositories = {
      user: new BaseRepositoryClass(UserModel),
      otp: new BaseRepositoryClass(OTPModel),
      kyc: new BaseRepositoryClass(KycModel),
      bankDetails: new BaseRepositoryClass(BankDetailsModel),
      csvLogs: new BaseRepositoryClass(CSVModel),
      orders: new BaseRepositoryClass(OrdersModel),
      products: new BaseRepositoryClass(ProductsModel),

      warehouse: new BaseRepositoryClass(WarehouseModel),
      courier: new BaseRepositoryClass(CourierModel),
      pricingPlans: new BaseRepositoryClass(PricingPlansModel),
      pricingCard: new BaseRepositoryClass(PricingCardModel),
      courierPricingCard: new BaseRepositoryClass(CourierPricingCardModel),
      userCourier: new BaseRepositoryClass(UserCourierModel),
      serviceablePincodes: new BaseRepositoryClass(ServiceablePincodeModel),

      shipping: new BaseRepositoryClass(ShippingModel),
      courierAWBList: new BaseRepositoryClass(CourierAWBListModel),
    };

    if (!repositories[model]) {
      throw new Error(`${model} not implemented yet.`);
    }
    return repositories[model];
  }
}

const FactoryRepository = new Class();
export default FactoryRepository;
