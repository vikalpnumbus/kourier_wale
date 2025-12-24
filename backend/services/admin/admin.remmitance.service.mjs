import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ShippingModel from "../../model/shipping.sql.model.mjs";
import RemittanceModel from "../../model/remittance.sql.model.mjs";
import UserModel from "../../model/user.sql.model.mjs";
import RemittanceBatchModel from "../../model/remittanceBatch.sql.model.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("remittance");
    this.remittanceBatchRepository = FactoryRepository.getRepository("remittanceBatch");
  }

  async read(params) {
    try {
      const { page = 1, limit = 50 } = params;

      const offset = (page - 1) * limit;

      const result = await RemittanceBatchModel.findAll({
        offset,
        limit,
        include: [
          {
            model: RemittanceModel,
            as: "remittances",
            required: false,
            include: [
              {
                model: UserModel,
                as: "user",
                required: false,
                attributes: ["id", "seller_remit_cycle", "wallet_balance", "companyName"],
              },
            ],
          },
        ],
      });

      const totalCount = await this.remittanceBatchRepository.countDocuments();

      return {
        data: {
          total: totalCount,
          result,
        },
      };
    } catch (error) {
      console.error(error);
      this.error = error;
      return false;
    }
  }

  async calculateRemittance() {
    let users = [];
    let page = 1;
    do {
      users = await UserModel.findAll({
        // attributes: ["id", "seller_remit_cycle"],
        limit: 50,
        offset: 50 * (page - 1),
      });

      for (const user of users) {
        const cycleMs = Number(user.seller_remit_cycle) * 24 * 60 * 60 * 1000; // ensure number
        const cutoffDate = new Date(Date.now() - cycleMs); // delivered before X cycle

        const remittancesDue = await ShippingModel.findOne({
          attributes: [
            "userId",
            [fn("SUM", col("shipping.collectableAmount")), "totalCollectableAmount"],
            [fn("COUNT", col("shipping.id")), "totalOrders"],
            [literal("GROUP_CONCAT(shipping.awb_number)"), "awbNumbers"],
          ],

          include: [
            {
              model: RemittanceModel,
              as: "remittance",
              required: false,
              attributes: [],
            },
          ],

          where: {
            shipping_status: "delivered",
            paymentType: "cod",
            "$remittance.awb_number$": null,
            userId: user.id,
            createdAt: {
              [Op.lte]: cutoffDate,
            },
          },

          group: ["shipping.userId"],
          raw: true,
        });

        if (remittancesDue) {
          const { totalCollectableAmount } = remittancesDue || {};
          const remittanceBatchId = await RemittanceBatchModel.create({
            remittance_amount: totalCollectableAmount,
            remittance_status: "pending",
          });
          const { id: batch_id } = remittanceBatchId;
          const { awbNumbers } = remittancesDue || {};
          awbNumbers.split(",").map(async (awb) => {
            const { collectableAmount } =
              (await ShippingModel.findOne({
                attributes: ["collectableAmount"],
                where: { awb_number: awb },
              })) || {};
            await RemittanceModel.create({
              userId: user.id,
              awb_number: awb,
              collectable_amount: collectableAmount,
              batch_id,
            });
          });
        }
      }
      page++;
    } while (users && users.length > 0);
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
