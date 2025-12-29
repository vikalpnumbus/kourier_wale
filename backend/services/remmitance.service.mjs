import FactoryRepository from "../repositories/factory.repository.mjs";
import UserModel from "../model/user.sql.model.mjs";

class Service {
  constructor() {
    this.error = null;
    this.remittanceSellerRepository = FactoryRepository.getRepository("remittanceSeller");
  }
 

  async readSellerRemittance(params) {
    try {
      const { page = 1, limit = 50 , userId} = params;
      console.log('userId: ', userId);
      const result = await this.remittanceSellerRepository.find({userId

        // remittance_status:paid
      }, { page, limit }, [
        { model: UserModel, as: "user", attributes: ["companyName", "wallet_balance", "seller_remit_cycle"], required: true },
      ]);
      const total = await this.remittanceSellerRepository.countDocuments({userId});
      return { data: { total, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

 
}

const RemittanceService = new Service();
export default RemittanceService; 