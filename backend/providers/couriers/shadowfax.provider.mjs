import axios from "axios";
import { SHADOWFAX_API_URL, SHADOWFAX_SECRET_KEY } from "../../configurations/base.config.mjs";

class ShadowfaxService {
  constructor() {
    this.apiKey = SHADOWFAX_SECRET_KEY;
    this.url = SHADOWFAX_API_URL;
    if (!this.apiKey) {
      throw new Error("SHADOWFAX_SECRET_KEY is missing in .env");
    }
    if (!this.url) {
      throw new Error("SHADOWFAX_API_URL is missing in .env");
    }
  }

  async createShipment(data) {
    if (!data) throw new Error("Invalid data");
    const { shippingDetails = {}, warehouses, warehouse_id, rto_warehouse_id, products = [], packageDetails = {} } = data;

    let pickup_warehouse = warehouses.filter((e) => e.id == warehouse_id)[0];
    let rto_warehouse = warehouses.filter((e) => e.id == rto_warehouse_id)[0];

    const jsonData = {
      order_details: {
        client_order_id: data.orderId,
        awb_number: "AWB" + Math.floor(Math.random() * 9000 + 1000),
        actual_weight: packageDetails.weight,
        volumetric_weight: packageDetails.volumetricWeight,
        product_value: data.total_price,
        payment_mode: data.paymentType,
        cod_amount:data?.paymentType=='cod'? data.collectableAmount:0,
        total_amount: data.total_price,
      },
      customer_details: {
        name: shippingDetails.fname + " " + shippingDetails.lname,
        contact: shippingDetails.phone ?? "",
        address_line_1: shippingDetails.address ?? "",
        address_line_2: shippingDetails.city,
        city: shippingDetails.city ?? "",
        state: shippingDetails.state ?? "",
        pincode: shippingDetails.pincode ?? "",
        alternate_contact: shippingDetails.alternate_phone ?? "",
      },
      pickup_details: {
        name: pickup_warehouse.contactName,
        contact: pickup_warehouse.contactPhone,
        address_line_1: pickup_warehouse.address,
        address_line_2: pickup_warehouse.city,
        city: pickup_warehouse.city,
        state: pickup_warehouse.state,
        pincode: pickup_warehouse.pincode,
      },
      rts_details: {
        name: rto_warehouse.contactName,
        contact: rto_warehouse.contactPhone,
        address_line_1: rto_warehouse.address,
        address_line_2: rto_warehouse.city,
        city: rto_warehouse.city,
        state: rto_warehouse.state,
        pincode: rto_warehouse.pincode,
      },
      product_details: [],
    };

    if (products?.length) {
      products.forEach((prod) => {
        jsonData.product_details.push({
          invoice_no: prod.id,
          sku_name: "Sample Product",
          client_sku_id: "SKU123",
          price: prod.price,
          seller_details: {
            seller_name: "aa",
            seller_address: "aa",
            seller_state: "delhi",
            gstin_number: "22AAAAA0000A1Z5",
          },
        });
      });
    }

    const url = `${this.url}/v1/clients/orders/`;

    const response = await axios.post(url, jsonData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.apiKey}`,
      },
    });

    const res = response.data;

    if (!res.message) throw new Error("Internal Error");

    if (res.message.toLowerCase() === "failure") {
      const err = typeof res.errors === "object" ? "Error in payload" : res.errors;

      // AWB used → mark used
      if (err?.toLowerCase().includes("awb already used")) {
        // await this.db("awb_list").where({ id: awbRow.id }).update({ used: 1 });
      }

      throw new Error(err);
    }

    if (res.message.toLowerCase() === "success") {
      return {
        AWBNo: res.data.awb_number,
      };
    }

    throw new Error("Unknown response");
  }

  // /**
  //  * =====================================================================
  //  * Create Reverse Order
  //  * =====================================================================
  //  */
  // async createReverseOrder(data) {
  //     const { data: data, products, customer, pickup } = data;

  //     const jsonData = {
  //         client_order_number: data.shipment_id ?? Math.floor(Math.random() * 90000 + 10000),
  //         total_amount: data.total,
  //         price: data.total,
  //         address_attributes: {
  //             name: customer.name ?? "",
  //             phone_number: customer.phone ?? "",
  //             address_line: `${customer.address ?? ""} ${customer.address_2 ?? ""}`,
  //             city: customer.city ?? "",
  //             state: customer.state ?? "",
  //             country: customer.country ?? "",
  //             pincode: customer.zip ?? ""
  //         },
  //         seller_attributes: {
  //             name: pickup.name,
  //             phone: pickup.phone,
  //             address_line: `${pickup.address_1} ${pickup.address_2}`,
  //             city: pickup.city,
  //             state: pickup.state,
  //             pincode: pickup.zip
  //         },
  //         skus_attributes: []
  //     };

  //     if (products?.length) {
  //         products.forEach((prod) => {
  //             jsonData.skus_attributes.push({
  //                 invoice_id: data.shipment_id ?? Math.floor(Math.random() * 90000 + 10000),
  //                 name: prod.name,
  //                 client_sku_id: prod.sku,
  //                 price: prod.price,
  //                 seller_details: {
  //                     regd_name: pickup.name,
  //                     regd_address: pickup.address_1,
  //                     state: pickup.state,
  //                     gstin: pickup.gst
  //                 }
  //             });
  //         });
  //     }

  //     const url = this.debug
  //         ? "https://dale.staging.shadowfax.in/api/v3/clients/requests"
  //         : "https://reverse.shadowfax.in/api/v3/clients/requests";

  //     const response = await axios.post(url, jsonData, {
  //         headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Token ${this.apiKey}`
  //         }
  //     });

  //     const res = response.data;

  //     if (!res) throw new Error("Internal Error");

  //     if (res.responseMsg?.toLowerCase() === "failure") {
  //         throw new Error(res.errors);
  //     }

  //     return {
  //         [data.shipment_id]: {
  //             status: "success",
  //             awb: res.awb_number
  //         }
  //     };
  // }
}

const ShadowfaxProvider = new ShadowfaxService();
export default ShadowfaxProvider;
