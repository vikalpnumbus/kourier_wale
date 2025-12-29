import FactoryRepository from "../repositories/factory.repository.mjs";
import CustomMath, {
  capitialiseFirstLetter,
  formatDate_DD_MM_YYYY_HH_MM,
  formatDate_YYYY_MM_DD,
} from "../utils/basic.utils.mjs";
import { PdfGenerator } from "../utils/pdfGenerator.utils.mjs";
import CourierService from "./courier.service.mjs";
import ShippingService from "./shipping.service.mjs";
import UserService from "./user.service.mjs";
import fs from "fs";
import WarehouseService from "./warehouse.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.userRepository = FactoryRepository.getRepository("user");
    this.warehouseRepository = FactoryRepository.getRepository("warehouse");
  }
  async create({ data }) {
    const { userId, paper_size } = data;

    const user = await UserService.read({ id: userId });
    if (!user) throw UserService.error;

    let labelSettings = user.label_settings || {};
    labelSettings = { ...labelSettings, paper_size };

    const updatedUser = await UserService.update(
      { id: userId },
      {
        label_settings: labelSettings,
      }
    );

    if (!updatedUser) throw UserService.error;

    return {
      status: 201,
      data: {
        message: "Label Settings created successfully.",
      },
    };
  }

  async generate({ data }) {
    try {
      const { userId, shipping_db_ids } = data;

      const [user, shippingRes] = await Promise.all([
        UserService.read({ id: userId }),
        ShippingService.read({ userId, id: shipping_db_ids }),
      ]);
      if (!user) throw UserService.error;

      let labelSettings = user.label_settings;
      if (!labelSettings) throw new Error("Label Settings not found.");

      const shipping = await Promise.all(
        shippingRes?.data?.result?.map(async (e) => {
          const [courierRes, warehouseRes] = await Promise.all([
            await CourierService.read({ id: e.courier_id }),
            await WarehouseService.read({
              id: [...new Set([e.warehouse_id, e.rto_warehouse_id])],
            }),
          ]);
          const courier = courierRes?.data?.result?.[0];
          const pickupWarehouse = warehouseRes?.data?.result?.filter(
            (warehouse) => warehouse.id == e.warehouse_id
          )?.[0];
          const rtoWarehouse = warehouseRes?.data?.result?.filter(
            (warehouse) => warehouse.id == e.rto_warehouse_id
          )?.[0];

          if (!pickupWarehouse) {
            const error = new Error("No pickup warehouse found.");
            error.status = 400;
            throw error;
          }
          if (!rtoWarehouse) {
            const error = new Error("No rto warehouse found.");
            error.status = 400;
            throw error;
          }

          const {
            support_email,
            support_phone,
            hide_product_details,
            hide_warehouse_address,
            hide_warehouse_mobile_number,
            hide_end_customer_contact_number,
          } = pickupWarehouse?.labelDetails || {};

          const pickupWarehouse_full_address = (() => {
            const name = !hide_warehouse_address ? pickupWarehouse.name : null;

            const address = !hide_warehouse_address
              ? pickupWarehouse.address
              : null;

            const city = !hide_warehouse_address ? pickupWarehouse.city : null;

            const state = !hide_warehouse_address
              ? pickupWarehouse.state
              : null;

            const country = !hide_warehouse_address ? "India" : null;

            const pincode = !hide_warehouse_address
              ? pickupWarehouse.pincode
              : null;

            return [name, address, city, state, country, pincode].join(", ");
          })();

          const rtoWarehouse_full_address = (() => {
            const name = !hide_warehouse_address ? rtoWarehouse.name : null;

            const address = !hide_warehouse_address
              ? rtoWarehouse.address
              : null;

            const city = !hide_warehouse_address ? rtoWarehouse.city : null;

            const state = !hide_warehouse_address ? rtoWarehouse.state : null;

            const country = !hide_warehouse_address ? "India" : null;

            const pincode = !hide_warehouse_address
              ? rtoWarehouse.pincode
              : null;

            return [name, address, city, state, country, pincode].join(", ");
          })();

          const payload = {
            invoice_generated_date: formatDate_DD_MM_YYYY_HH_MM(Date.now()),

            ...(() => {
              const {
                fname,
                lname,
                address,
                city,
                state,
                pincode,
                phone,
                alternatePhone,
              } = e.shippingDetails || {};
              console.log('alternate_phone: ', alternatePhone);
              return {
                shippingDetails_fname: fname || "",
                shippingDetails_lname: lname || "",
                shippingDetails_address: address || "",
                shippingDetails_city: city || "",
                shippingDetails_state: state || "",
                shippingDetails_country: "India",
                shippingDetails_pincode: pincode || "",
                shippingDetails_phone: hide_end_customer_contact_number
                  ? null
                  : phone || "",
                shippingDetails_alternate_phone:
                  hide_end_customer_contact_number
                    ? null
                    : alternatePhone || "",
              };
            })(),

            order_date: e.updatedAt ? formatDate_YYYY_MM_DD(e.updatedAt) : "",
            invoice_no: e.orderId || "",
            awb_number: e.awb_number || "",

            paymentType: capitialiseFirstLetter(e.paymentType) || "",
            total_price: e.orderAmount || "",

            ...(() => {
              const { weight, volumetricWeight, height, length, breadth } =
                e.packageDetails || {};
              return {
                packageDetails_weight:
                  CustomMath.roundOff(
                    Math.max(weight || 0, volumetricWeight || 0) / 100
                  ) || "",
                packageDetails_length: length || "",
                packageDetails_breadth: breadth || "",
                packageDetails_height: height || "",
              };
            })(),

            courier_name: courier?.name || "",

            products: !hide_product_details
              ? e.products.map((product) => ({
                  name: product.name,
                  sku: product.sku,
                  qty: product.qty,
                  price: product.price,
                }))
              : null,

            pickupWarehouse_contactPhone: !hide_warehouse_mobile_number
              ? pickupWarehouse.contactPhone
              : null,

            rtoWarehouse_contactPhone:
              hide_warehouse_mobile_number ||
              pickupWarehouse_full_address === rtoWarehouse_full_address
                ? null
                : rtoWarehouse.contactPhone,

            pickupWarehouse_full_address,
            rtoWarehouse_full_address,

            support_email,
            support_phone,
          };
          return payload;
        })
      );

      if (!shipping) {
        const error = new Error("No shipment found.");
        error.status = 400;
        throw error;
      }

      const shipmentsCannotBeShipped = shipping.filter(
        (e) => !e.awb_number || e.shipping_status == "cancelled"
      );
      const shipmentsCanBeShipped = shipping.filter(
        (e) => e.awb_number && e.shipping_status != "cancelled"
      );

      const templateHtml = fs.readFileSync(
        "templates/label.template.html",
        "utf-8"
      );

      const pdfOptions = {
        fileName: "invoice2",
        templateHtml,
        data: shipmentsCanBeShipped,
      };

      if (labelSettings.paper_size !== "standard") {
        pdfOptions.paperSize = "A4";
      } else {
        pdfOptions.width = "4in";
        pdfOptions.height = "6in";
      }

      const pdf = new PdfGenerator(pdfOptions);
      const pdfGenRes = await pdf.generate({ returnBuffer: true });

      return { ...pdfGenRes };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const LabelSettingsService = new Service();
export default LabelSettingsService;
