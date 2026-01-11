import { Op } from "sequelize";
import FactoryRepository from "../repositories/factory.repository.mjs";
import CompanyDetailsService from "./companyDetails.service.mjs";
import OrdersService from "./orders.service.mjs";
import CourierService from "./courier.service.mjs";
import WarehouseService from "./warehouse.service.mjs";
import ProductsService from "./products.service.mjs";
import UserService from "./user.service.mjs";

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
      const result = await this.shippingRepository.find({ userId, id: shipping_db_ids, shipping_status: { [Op.notIn]: ["cancelled", "new"] } });

      if (!result) throw new Error("Some error occured. Please try again later.");
      result.map(async (shipment) => {
        const { order_db_id, warehouse_id, courier_id, shipping_status, awb_number, createdAt, products } = shipment;
        console.log("{order_db_id, warehouse_id, courier_id, shipping_status, awb_number, createdAt} : ", {
          order_db_id,
          warehouse_id,
          courier_id,
          shipping_status,
          awb_number,
          createdAt,
        });

        const [
          orderDataRes = {},
          companyDetailsDataRes = {},
          courierDataRes = {},
          warehouseDataRes = {},
          productsDataRes = {},
          invoiceSettingsDataRes = {},
          orderInvoiceDateDataRes = {},
          userDataRes = {},
        ] = await Promise.all([
          await OrdersService.read({ userId, id: order_db_id }),
          await CompanyDetailsService.view({ id: userId }),
          await CourierService.read({ id: courier_id }),
          await WarehouseService.read(warehouse_id == "0" ? { userId } : { id: warehouse_id, userId }),
          products,
          await this.repository.findOne({ userId }),
          {},
          await UserService.read({ id: userId }),
        ]);

        const orderData = orderDataRes?.data?.result?.[0];
        const companyDetailsData = companyDetailsDataRes?.data?.companyDetails;
        const courierData = courierDataRes?.data?.result?.[0];
        const warehouseData = warehouseDataRes?.data?.result?.[0];
        const productsData = orderData?.products;
        const invoiceSettingsData = invoiceSettingsDataRes;
        const orderInvoiceDateData = orderInvoiceDateDataRes?.data?.result?.[0];
        const userData = userDataRes
        console.log({ orderData, companyDetailsData, courierData, warehouseData, productsData, invoiceSettingsData, orderInvoiceDateData, userData });
      });

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
