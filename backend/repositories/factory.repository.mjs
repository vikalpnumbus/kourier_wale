import BankDetailsModel from "../model/bankDetails.sql.model.mjs";
import ChannelModel from "../model/channel.sql.model.mjs";
import CourierModel from "../model/courier.sql.model.mjs";
import CourierAWBListModel from "../model/courierAWBList.sql.model.mjs";
import CourierPricingCardModel from "../model/courierPricingCard.sql.model.mjs";
import CSVModel from "../model/csvLogs.sql.model.mjs";
import EscalationModel from "../model/escalation.sql.model.mjs";
import EscalationConversationsModel from "../model/escalationsConversations.sql.mode.mjs";
import KycModel from "../model/kyc.sql.model.mjs";
import OrdersModel from "../model/orders.sql.model.mjs";
import OTPModel from "../model/otp.sql.model.mjs";
import PricingCardModel from "../model/pricingCard.sql.model.mjs";
import PricingPlansModel from "../model/pricingPlans.sql.model.mjs";
import ProductsModel from "../model/products.sql.model.mjs";
import RemittanceModel from "../model/remittance.sql.model.mjs";
import RemittanceBatchModel from "../model/remittanceBatch.sql.model.mjs";
import ServiceablePincodeModel from "../model/serviceablePincodes.sql.model.mjs";
import ShippingModel from "../model/shipping.sql.model.mjs";
import UserModel from "../model/user.sql.model.mjs";
import UserCourierModel from "../model/user_courier.sql.model.mjs";
import WalletHistoryModel from "../model/wallet_history.sql.model.mjs";
import WarehouseModel from "../model/warehouse.sql.model.mjs";
import WeightRecoModel from "../model/weightReco.sql.model.mjs";
import { BaseRepositoryClass } from "./base.sql.repository.mjs";

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
      channel: new BaseRepositoryClass(ChannelModel),
      walletHistory: new BaseRepositoryClass(WalletHistoryModel),
      escalations: new BaseRepositoryClass(EscalationModel),
      escalations_conversations: new BaseRepositoryClass(EscalationConversationsModel),
      weightReco: new BaseRepositoryClass(WeightRecoModel),
      remittance: new BaseRepositoryClass(RemittanceModel),
      remittanceBatch: new BaseRepositoryClass(RemittanceBatchModel),
    };

    if (!repositories[model]) {
      throw new Error(`${model} not implemented yet.`);
    }
    return repositories[model];
  }
}

UserModel.hasOne(KycModel, { foreignKey: "userId" });
KycModel.belongsTo(UserModel, { foreignKey: "userId" });

RemittanceBatchModel.hasMany(RemittanceModel, {
  foreignKey: "batch_id",
  as: "remittances",
  onDelete: "CASCADE",
});

RemittanceModel.belongsTo(RemittanceBatchModel, {
  foreignKey: "batch_id",
  as: "batch",
});

ShippingModel.hasOne(RemittanceModel, {
  foreignKey: "awb_number",
  sourceKey: "awb_number",
});

RemittanceModel.belongsTo(ShippingModel, {
  foreignKey: "awb_number",
  targetKey: "awb_number",
});

RemittanceModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as: "user"
});

UserModel.hasMany(RemittanceModel, {
  foreignKey: "userId"
});

const FactoryRepository = new Class();
export default FactoryRepository;
