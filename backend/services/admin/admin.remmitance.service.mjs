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
        attributes: ["id", "seller_remit_cycle"],
        limit: 50,
        offset: 50 * (page - 1),
      });

      for (const user of users) {
        const cycleMs = Number(user.seller_remit_cycle) * 24 * 60 * 60 * 1000; // ensure number
        const cutoffDate = new Date(Date.now() - cycleMs); // delivered before X cycle

        const remittancesDue = await ShippingModel.findOne({
          attributes: [
            "userId",
            [fn("SUM", col("shipping.orderAmount")), "totalOrderAmount"],
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
          const { totalOrderAmount } = remittancesDue || {};
          const remittanceBatchId = await RemittanceBatchModel.create({
            remittance_amount: totalOrderAmount,
            remittance_status: "pending",
          });
          const { id: batch_id } = remittanceBatchId;
          const { awbNumbers } = remittancesDue || {};
          awbNumbers.split(",").map(async (awb) => {
            await RemittanceModel.create({
              userId: user.id,
              awb_number: awb,
              batch_id,
            });
          });
        }
      }
      page++;
    } while (users && users.length > 0);
  }
}

const RemittanceService = new Service();
export default RemittanceService;
