import KycProducer from "../../queue/producers/kyc.producer.mjs";
import FactoryRepository from "../../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("kyc");
  }

  async create({ files, data }) {
    try {
      const {
        userId,
        kycType,
        panCardNumber,
        nameOnPanCard,
        documentType,
        documentId,
        nameOnDocument,
        coiNumber,
        status,
        gstNumber,
        gstName,
      } = data;

      const result = await this.repository.save({
        userId,
        kycType,
        panCardNumber,
        nameOnPanCard,
        documentType,
        documentId,
        nameOnDocument,
        coiNumber,
        status,
        gstNumber,
        gstName,
      });

      KycProducer.publish({
        files: files.map((e) => ({
          imageName: data.userId,
          image: e,
          dir: "kyc",
        })),
        metadata: {
          id: result.id,
        },
      });

      return {
        status: 201,
        data: {
          message:
            "KYC created successfully. Now wait for it to be verified by our team.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ files, data }) {
    try {
      let payload = { ...data };

      if (files) {
        KycProducer.publish({
          files: files.map((e) => ({
            imageName: data.userId,
            image: e,
            dir: "kyc",
          })),
          metadata: {
            id: data.id,
          },
        });
      }
      if (
        !["public limited company", "private limited company"].includes(
          data.kycType
        )
      ) {
        payload.coiNumber = null;
      }
      const existingKYCId = data.id;

      delete data.id;

      await this.repository.findOneAndUpdate({ id: existingKYCId }, payload);

      return {
        status: 201,
        data: {
          message:
            "KYC updated successfully. Now wait for it to be verified by our team.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const result = await this.repository.findOne(params);

      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      return { data: result };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const KYCService = new Service();
export default KYCService;
