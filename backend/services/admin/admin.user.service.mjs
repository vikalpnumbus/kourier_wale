import FactoryRepository from "../../repositories/factory.repository.mjs";
import KYCService from "../../services/kyc.service.mjs";
import BankDetailsService from "../../services/bankDetails.service.mjs";
import { Op, where, fn, col } from "sequelize";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("user");
    this.kycRepository = FactoryRepository.getRepository("kyc");
    this.AdminUserMapRepository = FactoryRepository.getRepository("adminUserMap");
  }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, name, email, phone, isVerified, start_date, end_date, include, isActive, handlingAdmins, userId } = params;

      const whereClause = {
        [Op.and]: [
          {
            role: "user",
          },
        ],
      };
      if (id) whereClause[Op.and].push({ id });
      if (email) {
        whereClause[Op.and].push({
          email: { [Op.like]: `%${email}%` },
        });
      }
      if (userId) whereClause[Op.and].push({ id: userId?.toString()?.split(",") });
      if (phone) whereClause[Op.and].push({ phone });
      if (isVerified) whereClause[Op.and].push({ isVerified: isVerified == "true" });
      if (isActive) whereClause[Op.and].push({ isActive: isActive == "true" });

      if (name) {
        whereClause[Op.and].push(
          where(fn("CONCAT", col("User.fname"), " ", col("User.lname")), {
            [Op.like]: `%${name}%`,
          })
        );
      }

      if (start_date) {
        whereClause[Op.and].push({ "$User.createdAt$": { [Op.gte]: new Date(start_date) } });
        // whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.gte]: start_date }));
      }
      if (end_date) {
        whereClause[Op.and].push({ "$User.createdAt$": { [Op.lte]: new Date(end_date) } });
        // whereClause[Op.and].push(where(fn("DATE", col("createdAt")), { [Op.lte]: end_date }));
      }

      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let handlingAdminIds = [];

      const includeKyc = {
        model: this.kycRepository.model,
        as: "kyc",
        required: false, // LEFT JOIN
        attributes: ["id", "status", "createdAt", "remarks", "approvedBy"],
        include: [
          {
            model: this.repository.model, // User model
            as: "approvedByUser",
            attributes: ["id", "fname", "lname", "email"],
          },
        ],
      };

      const includeHandlingAdmins = {
        model: this.repository.model, // UserModel
        as: "handlingAdmins",
        required: false,
        attributes: ["id", "fname", "lname", "email", "phone"],
        through: {
          attributes: ["assignedAt"], // from admin_user_map
        },
      };

      if (handlingAdmins) {
        handlingAdminIds = handlingAdmins
          .toString()
          .split(",")
          .map((e) => Number(e.trim()))
          .filter(Number.isFinite);
      }

      if (handlingAdminIds.length) {
        includeHandlingAdmins.through = {
          where: {
            adminId: { [Op.in]: handlingAdminIds },
          },
          attributes: ["assignedAt"],
        };

        includeHandlingAdmins.required = true;
        includeHandlingAdmins.duplicating = false;
      }

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(whereClause, {}, [includeKyc, includeHandlingAdmins], false, {
          attributes: {
            exclude: ["password", "resetPasswordToken", "resetPasswordExpires"],
          },
        });
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }

        const kycPromise = include === "kycDetails" ? KYCService.read({ userId: id }) : Promise.resolve(null);
        const bankPromise = include === "bankDetails" ? BankDetailsService.read({ userId: id }) : Promise.resolve(null);

        const [kycDetailsRes, bankDetailsRes] = await Promise.all([kycPromise, bankPromise]);

        const kycDetails = kycDetailsRes?.data || null;
        const bankDetails = bankDetailsRes?.data?.result || null;

        if (kycDetails) result = [{ ...result[0].dataValues, kycDetails }];
        else if (bankDetails) result = [{ ...result[0].dataValues, bankDetails }];

        totalCount = result.length;
      } else {
        result = await this.repository.find(whereClause, { page, limit }, [includeKyc, includeHandlingAdmins], false, {
          attributes: {
            exclude: ["password", "resetPasswordToken", "resetPasswordExpires"],
          },
        });
        totalCount = await this.repository.countDocuments(whereClause);

        if (!result || result.length === 0) {
          result = [];
        }
      }

      result = result;

      return { data: { total: totalCount, result } };
    } catch (error) {
      throw error;
    }
  }

  async update({ data }) {
    console.log("data: ", data);
    try {
      const { isActive, seller_remit_cycle, pricingPlanId, id } = data;

      delete data.id;

      let payload = { isActive, seller_remit_cycle, pricingPlanId };

      const result = await this.repository.findOneAndUpdate({ id }, payload);

      return {
        status: 201,
        data: {
          message: "User has been updated successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async adminUserHandling({ data }) {
    try {
      let { adminId, userId } = data;
      adminId = [
        ...new Set(
          adminId
            ?.toString()
            .split(",")
            .map((e) => Number(e.trim()))
            .filter((e) => !isNaN(e))
        ),
      ];

      userId = [
        ...new Set(
          userId
            ?.toString()
            .split(",")
            .map((e) => Number(e.trim()))
            .filter((e) => !isNaN(e))
        ),
      ];

      if (!adminId?.length || !userId?.length) {
        throw new Error("adminId and userId are required and that too in the form of ids.");
      }

      if (userId.filter((e) => adminId.includes(e)).length > 0) {
        const error = new Error(`Self assignment is not possible for ids ${userId.filter((e) => adminId.includes(e)).join(", ")}`);
        error.status = 403;
        throw error;
      }

      const [userRes, adminRes] = await Promise.all([this.repository.find({ id: userId }), this.repository.find({ id: adminId })]);

      const userResIds = new Set(userRes.map((e) => e.id));
      const adminResIds = new Set(adminRes.map((e) => e.id));

      const usersNotFound = [...userId.filter((e) => !userResIds.has(e)), ...adminId.filter((e) => !adminResIds.has(e))];
      if (usersNotFound.length) {
        const error = new Error(`These users are not found: ${usersNotFound}`);
        error.status = 400;
        throw error;
      }

      const usersInAdminIds = adminRes.filter((e) => e.role !== "admin")?.map((e) => e.id);

      if (usersInAdminIds.length) {
        const error = new Error(`These users are not admins: ${usersInAdminIds}`);
        error.status = 400;
        throw error;
      }

      const adminsInUserIds = userRes.filter((e) => e.role == "admin")?.map((e) => e.id);

      if (adminsInUserIds.length) {
        const error = new Error(`These users are admins: ${adminsInUserIds}. Assignment of admin to admin is not possible.`);
        error.status = 400;
        throw error;
      }

      const payload = [];

      for (const user of userRes) {
        const { id: userId } = user;
        for (const admin of adminRes) {
          const { id: adminId } = admin;
          payload.push({ userId, adminId });
        }
      }

      await this.AdminUserMapRepository.bulkSave(payload, { ignoreDuplicates: true });

      return {
        status: 201,
        data: {
          message: "Users has been updated successfully.",
          result: payload,
        },
      };
    } catch (error) {
      console.log("error: ", error);
      this.error = error;
      return false;
    }
  }
}

const AdminUserService = new Service();
export default AdminUserService;
