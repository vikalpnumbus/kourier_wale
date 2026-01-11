import FactoryRepository from "../repositories/factory.repository.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("invoiceSettings");
    this.shippingRepository = FactoryRepository.getRepository("shipping");
  }
  async create(data) {
    try {
      if (await this.repository.findOne({ userId: data.userId })) {
        throw new Error("Invoice settings already exists for this user.");
      }
      const result = await this.repository.save(data);

      if (!result) throw new Error("Some error occured. Please try again later.");

      return {
        status: 201,
        data: {
          message: "Invoice Settings saved successfully.",
        },
      };
    } catch (error) {
      throw error;
    }
  }
  async read(params) {
    try {
      const result = await this.repository.findOne(params);

      if (!result) throw new Error("Some error occured. Please try again later.");

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }
  async update(data) {
    try {
      const { userId } = data;
      const payload = { ...data };
      delete payload.userId;
      const result = await this.repository.findOneAndUpdate({ userId }, payload);
      console.log("payload: ", payload);

      if (!result) throw new Error("Some error occured. Please try again later.");

      return {
        status: 201,
        data: {
          message: "Invoice Settings updated successfully.",
        },
      };
    } catch (error) {
      throw error;
    }
  }
  async generate({ userId, shipping_db_ids }) {
    try {
      const result = await this.shippingRepository.find({ userId, id: shipping_db_ids, [Op.notIn]: ["cancelled", "new"] });
      console.log("result: ", result);

      if (!result) throw new Error("Some error occured. Please try again later.");

      return {
        status: 201,
        data: {
          message: "Invoice Settings updated successfully.",
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

const InvoiceSettingsService = new Service();
export default InvoiceSettingsService;
