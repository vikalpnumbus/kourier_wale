import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ShippingModel from "../../model/shipping.sql.model.mjs";
import UserModel from "../../model/user.sql.model.mjs";

class Service {
  constructor() {
    this.error = null;
    this.remittanceBatchRepository = FactoryRepository.getRepository("remittanceBatch");
    this.shippingRepository = FactoryRepository.getRepository("shipping");
  }

  async read(params) {
    try {
      const { page = 1, limit = 50 } = params;
      const result = await this.remittanceBatchRepository.find({}, { page, limit }, [
        { model: UserModel, as: "user", attributes: ["companyName", "wallet_balance"], required: true },
      ]);
      const total = await this.remittanceBatchRepository.countDocuments();
      return { data: { total, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async calculateRemittance() {
    try {
      const shipments = await ShippingModel.findAll({
        attributes: [
          [fn("SUM", col("collectableAmount")), "totalCollectableAmount"],
          [fn("GROUP_CONCAT", col("awb_number")), "awb_numbers"],
          "userId",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "seller_remit_cycle"],
            required: true,
          },
        ],
        where: {
          remittance_status: {
            [Op.or]: {
              [Op.is]: null,
              [Op.eq]: "",
            },
          },
          shipping_status: "delivered",
          paymentType: "cod",
          [Op.and]: literal("shipping.createdAt <= DATE_SUB(NOW(), INTERVAL user.seller_remit_cycle DAY)"),
        },
        group: ["userId"],
        raw: true,
      });

      await Promise.all(
        shipments.map(async (shipment) => {
          const { totalCollectableAmount, awb_numbers, userId } = shipment;
          const remittanceData = await this.remittanceBatchRepository.save({
            remittance_amount: totalCollectableAmount,
            hold_amount: totalCollectableAmount,
            awb_numbers,
            userId,
          });
          if (remittanceData) {
            console.log("remittanceData: ", remittanceData.id);
            await this.shippingRepository.updateMany({ awb_number: { [Op.in]: [...awb_numbers.split(",")] } }, { remittance_status: "pending" });
          }
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  async update({ id, remarks, remittance_status }) {
    try {
      const isExists = await this.remittanceBatchRepository.findOne({ id });
      if (!isExists) {
        const error = new Error("No record found.");
        error.status = 400;
        throw error;
      }

      const updatedRecord = await this.remittanceBatchRepository.findOneAndUpdate({ id }, { remarks, remittance_status });
      if (!updatedRecord) {
        const error = new Error("Unable to update the record.");
        error.status = 500;
        throw error;
      }
      return { status: 201, data: "Record updated successfully." };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const RemittanceService = new Service();
export default RemittanceService;
(async () => {
  await RemittanceService.calculateRemittance();
})();
