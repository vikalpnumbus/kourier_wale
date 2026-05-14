import https from "https";
import {XB_PANEL_EMAIL,XB_PANEL_PASSWORD} from "../../configurations/base.config.mjs";
import axios from "axios";
class Provider {
  constructor() {
    this.error = null;
    this.XB_PANEL_EMAIL = XB_PANEL_EMAIL;
    this.XB_PANEL_PASSWORD = XB_PANEL_PASSWORD;
    if (!this.XB_PANEL_EMAIL) {
      throw new Error("XB_PANEL_EMAIL is required.");
    }
    if (!this.XB_PANEL_PASSWORD) {
      throw new Error("XB_PANEL_PASSWORD is required.");
    }
  }
    async generateToken() {
        try {
            const url = "https://shipment.xpressbees.com/api/users/login";
            const response = await axios.post(
            url,
            JSON.stringify({
                email: this.XB_PANEL_EMAIL,
                password: this.XB_PANEL_PASSWORD,
            }),
            {
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                },
            }
            );
            console.log("XB login response =>", response.data);
            const token = response.data?.data || response.data?.token;
            if (!token) {
            throw new Error("Token not found in response");
            }
            return token;
        } catch (error) {
            console.error(
            "Xpressbees Token Error:",
            error.response?.data || error.message
            );
            this.error = error;
            return false;
        }
    }
    async createShipment(data, courierid) {
  try {
    const token = await this.generateToken();

    const warehouse = data.warehouses[0].dataValues;

    const payload = {
      order_number: data.orderId,
      payment_type: data.paymentType === "cod" ? "cod" : "prepaid",
      order_amount: data.orderAmount,

      consignee_name: `${data.shippingDetails.fname} ${data.shippingDetails.lname}`,
      consignee_address: data.shippingDetails.address,
      consignee_city: data.shippingDetails.city,
      consignee_state: data.shippingDetails.state,
      consignee_pincode: data.shippingDetails.pincode,
      consignee_phone: data.shippingDetails.phone,

      product_name: data.products[0]?.name,
      quantity: data.products[0]?.qty,

      weight: data.packageDetails.weight / 1000,
      length: data.packageDetails.length,
      breadth: data.packageDetails.breadth,
      height: data.packageDetails.height,

      pickup_name: warehouse.name,
      pickup_address: warehouse.address,
      pickup_city: warehouse.city,
      pickup_state: warehouse.state,
      pickup_pincode: warehouse.pincode,
      pickup_phone: warehouse.phone,

      courier_id: courierid,
    };

    console.log("XB FINAL PAYLOAD =>", payload);

    const response = await axios.post(
      "https://shipment.xpressbees.com/api/shipments2",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "Xpressbees Shipment Error:",
      error.response?.data || error.message
    );
    this.error = error;
    return false;
  }
}
}

const XpressBeesPanel = new Provider();
export default XpressBeesPanel;
