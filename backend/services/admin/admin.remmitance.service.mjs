import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ShippingModel from "../../model/shipping.sql.model.mjs";
import UserModel from "../../model/user.sql.model.mjs";
import RemittanceBatchModel from "../../model/remittanceBatch.sql.model.mjs";

class Service {
  constructor() {
    this.error = null;
    this.remittanceBatchRepository = FactoryRepository.getRepository("remittanceBatch");
    this.shippingRepository = FactoryRepository.getRepository("shipping");
  }

  async read(params) {}

  async calculateRemittance() {
    const shipments = await ShippingModel.findAll({
      attributes: [[fn("SUM", col("collectableAmount")), "totalCollectableAmount"], [fn("GROUP_CONCAT", col("awb_number")), "awb_numbers"], "userId"],
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
    console.log("shipments: ", shipments);

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
          const data = await this.shippingRepository.updateMany(
            { awb_number: { [Op.in]: [...awb_numbers.split(",")] } },
            { remittance_status: "pending" }
          );
          console.log("data: ", data);
        }
      })
    );
  }

  async update({ id, remarks, remittance_status }) {
    try {
      const isExists = await RemittanceBatchModel.findByPk(id);
      if (!isExists) {
        const error = new Error("No record found.");
        error.status = 400;
        throw error;
      }

      const updatedRecord = await RemittanceBatchModel.update({ remarks, remittance_status }, { where: { id } });
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
