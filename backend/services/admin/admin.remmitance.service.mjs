import { col, fn, literal, Op } from "sequelize";
import FactoryRepository from "../../repositories/factory.repository.mjs";
import ShippingModel from "../../model/shipping.sql.model.mjs";
import UserModel from "../../model/user.sql.model.mjs";
import sqlDB from "../../configurations/sql.config.mjs";

class Service {
  constructor() {
    this.error = null;
    this.remittanceBatchRepository = FactoryRepository.getRepository("remittanceBatch");
    this.remittanceSellerRepository = FactoryRepository.getRepository("remittanceSeller");
    this.shippingRepository = FactoryRepository.getRepository("shipping");
  }

  async readAdminRemittance(params) {
    try {
      const { page = 1, limit = 50 } = params;
      const result = await this.remittanceBatchRepository.find({}, { page, limit }, [
        { model: UserModel, as: "user", attributes: ["companyName", "wallet_balance", "seller_remit_cycle"], required: true },
      ]);
      const total = await this.remittanceBatchRepository.countDocuments();
      return { data: { total, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async readSellerRemittance(params) {
    try {
      const { page = 1, limit = 50 } = params;
      const result = await this.remittanceSellerRepository.find({}, { page, limit }, [
        { model: UserModel, as: "user", attributes: ["companyName", "wallet_balance", "seller_remit_cycle"], required: true },
      ]);
      const total = await this.remittanceSellerRepository.countDocuments();
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
            await this.shippingRepository.updateMany(
              { awb_number: { [Op.in]: [...awb_numbers.split(",")] } },
              { remittance_batch_id: remittanceData.id, remittance_status: "pending" }
            );
          }
        })
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async createRemittance({ awb_numbers }) {
    const t = await sqlDB.sequelize.transaction();
    try {
      const awbList = awb_numbers.split(",");
      const pendingCount = await this.shippingRepository.countDocuments(
        { awb_number: { [Op.in]: awbList }, remittance_status: "pending" },
        { transaction: t }
      );
      if (pendingCount === 0) {
        await t.rollback();
        return { data: "No awb found with remittance_status as pending." };
      }
      // Update only unpaid AWBs
      const updatedShipments = await this.shippingRepository.updateMany(
        {
          awb_number: { [Op.in]: awbList },
          remittance_status: "pending",
        },
        { remittance_status: "paid" },
        { transaction: t }
      );

      if (!updatedShipments) {
        await t.rollback();
        return { data: "No awb found with remittance_status as pending." };
      }

      // Get their remittance_batch_id
      let remittanceBatchIds = await this.shippingRepository.find(
        {
          awb_number: { [Op.in]: awbList },
        },
        {},
        [],
        false,
        { attributes: ["remittance_batch_id"], transaction: t }
      );
      remittanceBatchIds = remittanceBatchIds?.map((e) => e.remittance_batch_id);

      if (!remittanceBatchIds?.length) {
        await t.commit();
        return; // nothing to process
      }

      // Fetch remittance batches
      const remittances = await this.remittanceBatchRepository.find({ id: { [Op.in]: remittanceBatchIds } }, {}, [], false, {}, { transaction: t });

      // Insert into remittance_seller
      await this.remittanceSellerRepository.bulkSave(
        (
          await Promise.all(
            remittances?.map(async (remittance) => {
              const amountOfRemainingAWBs = (
                await this.shippingRepository.find(
                  {
                    awb_number: {
                      [Op.in]: remittance.awb_numbers?.split(",")?.filter((e) => awbList.includes(e)),
                    },
                  },
                  {},
                  [],
                  false,
                  {
                    attributes: [[fn("SUM", col("collectableAmount")), "totalCollectableAmount"]],
                    transaction: t,
                  }
                )
              )?.map((e) => e.dataValues?.totalCollectableAmount)?.[0];
              if (!amountOfRemainingAWBs) return null;
              return {
                userId: remittance.userId,
                remittance_amount: amountOfRemainingAWBs || 0,
                awb_numbers: remittance.awb_numbers
                  ?.split(",")
                  ?.filter((e) => awbList.includes(e))
                  .join(","),
              };
            })
          )
        )?.filter(Boolean),
        { transaction: t }
      );

      // Process which batches to delete or update
      const remittancesToBeDeleted = (
        await Promise.all(
          remittances?.map(async (remittance) => {
            const remainingAwbs = remittance.awb_numbers?.split(",")?.filter((e) => !awbList.includes(e));

            if (!remainingAwbs.length) {
              return remittance.id;
            } else {
              const amountOfRemainingAWBs = (
                await this.shippingRepository.find(
                  {
                    awb_number: {
                      [Op.in]: remittance.awb_numbers?.split(",")?.filter((e) => awbList.includes(e)),
                    },
                  },
                  {},
                  [],
                  false,
                  {
                    attributes: [[fn("SUM", col("collectableAmount")), "totalCollectableAmount"]],
                    transaction: t,
                  }
                )
              )?.map((e) => e.dataValues?.totalCollectableAmount)?.[0];
              await this.remittanceBatchRepository.findOneAndUpdate(
                { id: remittance.id },
                {
                  awb_numbers: remainingAwbs.join(","),
                  remittance_amount: remittance.remittance_amount,
                  hold_amount: Number(remittance.hold_amount) - Number(amountOfRemainingAWBs || 0),
                },
                { transaction: t }
              );
            }
          })
        )
      )?.filter(Boolean);

      // Delete empty batches + unlink shipping
      if (remittancesToBeDeleted?.length) {
        await this.shippingRepository.updateMany(
          {
            remittance_batch_id: { [Op.in]: remittancesToBeDeleted },
          },
          { remittance_batch_id: null },
          { transaction: t }
        );

        await this.remittanceBatchRepository.deleteMany({ id: { [Op.in]: remittancesToBeDeleted } }, { transaction: t });
      }

      await t.commit();

      console.log("Remittance created successfully");
      return { data: "Remittance created successfully" };
    } catch (error) {
      await t.rollback();
      console.error("Transaction Rolled Back ❌", error);
      this.error = error;
      return false;
    }
  }
}

const RemittanceService = new Service();
export default RemittanceService;
(async () => {
  const isRemittanceCalculated = await RemittanceService.calculateRemittance();
  // console.log("isRemittanceCalculated: ", isRemittanceCalculated);
  // if (isRemittanceCalculated)
    // await RemittanceService.createRemittance({ awb_numbers: `${[153758598607, 153758598597, 153758598595, 153758597633].slice(0, 2).join(",")}` });
})();
