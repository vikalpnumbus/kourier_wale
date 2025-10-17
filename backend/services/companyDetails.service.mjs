import FactoryRepository from "../repositories/factory.repository.mjs";
import CompanyDetailsProducer from "../queue/producers/companyDetails.producer.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("user");
  }

  async save(data) {
    try {
      const {
        id,
        files,
        companyAddress,
        companyCity,
        companyState,
        companyPincode,
      } = data;

      await this.repository.findOneAndUpdate(
        { id },
        {
          companyAddress,
          companyCity,
          companyState,
          companyPincode,
        }
      );
      CompanyDetailsProducer.publish({
        files: files.map((e) => ({
          imageName: data.id,
          image: e,
          dir: "companyDetails",
        })),
        metadata: {
          id: data.id,
        },
      });

      return {
        status: 201,
        data: {
          message: `Details saved successfully.`,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async view(data) {
    try {
      const { id } = data;

      const result = await this.repository.findOne({
        id,
      });

      return {
        status: 200,
        data: {
          companyDetails: result
            ? { ...result, password: undefined }
            : {
                companyAddress: null,
                companyCity: null,
                companyState: null,
                companyPincode: null,
                companyLogo: [],
              },
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const CompanyDetailsService = new Service();
export default CompanyDetailsService;
