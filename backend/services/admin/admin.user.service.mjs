import FactoryRepository from "../../repositories/factory.repository.mjs";
import KYCService from "../../services/kyc.service.mjs";
import BankDetailsService from "../../services/bankDetails.service.mjs";
import { Op, where, fn, col } from "sequelize";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("user");
    this.otpRepository = FactoryRepository.getRepository("otp");
  }

  async read(params) {
    const {
      page = 1,
      limit = 50,
      id,
      name,
      email,
      phone,
      isVerified,
      start_date,
      end_date,
      include,
    } = params;

    const whereClause = { [Op.and]: [] };
    if (id) whereClause[Op.and].push({ id });
    if (email) {
      whereClause[Op.and].push({
        email: { [Op.like]: `%${email}%` },
      });
    }
    if (phone) whereClause[Op.and].push({ phone });
    if (isVerified) whereClause[Op.and].push({ isVerified });

    if (name) {
      whereClause[Op.and].push(
        where(fn("CONCAT", col("fname"), " ", col("lname")), {
          [Op.like]: `%${name}%`,
        })
      );
    }

    if (start_date) {
      whereClause[Op.and].push(
        where(fn("DATE", col("createdAt")), { [Op.gte]: start_date })
      );
    }
    if (end_date) {
      whereClause[Op.and].push(
        where(fn("DATE", col("createdAt")), { [Op.lte]: end_date })
      );
    }

    if (!whereClause[Op.and].length) delete whereClause[Op.and];

    let result;
    let totalCount;

    if (id) {
      result = await this.repository.find(whereClause);
      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      const kycPromise =
        include === "kycDetails"
          ? KYCService.read({ userId: id })
          : Promise.resolve(null);
      const bankPromise =
        include === "bankDetails"
          ? BankDetailsService.read({ userId: id })
          : Promise.resolve(null);

      const [kycDetailsRes, bankDetailsRes] = await Promise.all([
        kycPromise,
        bankPromise,
      ]);

      const kycDetails = kycDetailsRes?.data || null;
      const bankDetails = bankDetailsRes?.data?.result || null;

      if (kycDetails) result = [{ ...result[0].dataValues, kycDetails }];
      else if (bankDetails) result = [{ ...result[0].dataValues, bankDetails }];

      totalCount = result.length;
    } else {
      result = await this.repository.find(whereClause, { page, limit });
      totalCount = await this.repository.countDocuments(whereClause);

      if (!result || result.length === 0) {
        result = [];
      }
    }

    result = result;

    return { data: { total: totalCount, result } };
  }
}

const AdminUserService = new Service();
export default AdminUserService;
