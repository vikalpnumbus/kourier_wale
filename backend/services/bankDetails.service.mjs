import BankDetailsProducer from "../queue/producers/bankDetails.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import axios from "axios";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("bankDetails");
  }

  async create({ files, data }) {
    try {
      const {
        userId,
        accountHolderName,
        accountNumber,
        ifscCode,
        accountType,
        ifscDetails,
        isPrimary,
        address,
        city,
        state,
      } = data;

      const { BANK: bankName, BRANCH: bankBranch } = ifscDetails;
      const existingRecord = await BankDetailsService.repository.findOne({
        userId: data.userId,
        accountNumber,
      });

      if (existingRecord) {
        const error = new Error("Record already exists.");
        error.status = 409;
        throw error;
      }

      if (isPrimary === "true") {
        await this.repository.updateMany({ userId }, { isPrimary: false });
      }

      const result = await this.repository.save({
        userId,
        accountHolderName,
        accountNumber,
        ifscCode,
        accountType,
        bankName,
        bankBranch,
        address,
        city,
        state,
        isActive: true,
        isPrimary,
      });

      BankDetailsProducer.publish({
        files: files.map((e) => ({
          imageName: data.userId,
          image: e,
          dir: "bankDetails",
        })),
        metadata: {
          id: result.id,
        },
      });

      return {
        status: 201,
        data: {
          message:
            "Bank Detailes created successfully. Now wait for it to be verified by our team.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ files, data }) {
    try {
      const {
        userId,
        id,
        accountHolderName,
        accountNumber,
        ifscCode,
        accountType,
        ifscDetails,
        isPrimary,
        address,
        city,
        state,
      } = data || {};

      const { BANK: bankName, BRANCH: bankBranch } = ifscDetails || {};
      let payload = {
        userId,
        accountHolderName,
        accountNumber,
        ifscCode,
        accountType,
        bankName,
        bankBranch,
        isPrimary,
        address,
        city,
        state,
      };

      if (files && files.length != 0) {
        BankDetailsProducer.publish({
          files: files.map((e) => ({
            imageName: data.userId,
            image: e,
            dir: "bankDetails",
          })),
          metadata: {
            id: data.id,
          },
        });
      }

      const existingRecordId = id;

      delete data.id;
      if (isPrimary === "true") {
        const rows = await this.repository.updateMany(
          { userId },
          { isPrimary: false }
        );
      }

      await this.repository.findOneAndUpdate(existingRecordId, payload);

      return {
        status: 201,
        data: {
          message:
            "Bank Details updated successfully. Now wait for it to be verified by our team.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, ...filters } = params;

      let query = { ...filters };
      if (id) query.id = id;

      const result = id
        ? await this.repository.findOne(query)
        : await this.repository.find(query, { page, limit });

      if (!result || (Array.isArray(result) && result.length === 0)) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      if (!id) {
        const totalCount = await this.repository.countDocuments(query);
        return { data: { total: totalCount, result } };
      }

      return { data: { total: 1, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async getBankDetails(ifscCode) {
    const url = `https://ifsc.razorpay.com/${ifscCode}`;
    const { data } = await axios.get(url);
    return data;
  }
  async validateIfscDetails(req) {
    const { ifscCode, bankName, bankBranch, state, city } = req.body;
    if (!ifscCode && !bankName && !bankBranch) return true;
    try {
      const url = `https://ifsc.razorpay.com/${ifscCode}`;
      const { data } = await axios.get(url);

      const { BANK, BRANCH, STATE, CITY } = data || {};

      const bankMatches = BANK?.toLowerCase() === bankName.toLowerCase();
      const branchMatches = BRANCH?.toLowerCase() === bankBranch.toLowerCase();
      const stateMatches = STATE?.toLowerCase() === state.toLowerCase();
      const cityMatches = CITY?.toLowerCase() === city.toLowerCase();

      if (!bankMatches || !branchMatches || !stateMatches || !cityMatches) {
        const error = new Error(
          "IFSC, bank name, branch, city and state do not match"
        );
        error.status = 400;
        throw error;
      }

      return data;
    } catch (err) {
      let error = err;
      if (err.status == 404) {
        error = new Error("No record found for the given IFSC code.");
        error.status = err.status;
      }
      this.error = error;
      return false;
    }
  }
}

const BankDetailsService = new Service();
export default BankDetailsService;
