import axios from "axios";
import https from "https";
import {
  SHIPROCKET_LOGIN_URL,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
} from "../../configurations/base.config.mjs";

class ShiprocketProvider {

  constructor() {
    this.agent = new https.Agent({
      rejectUnauthorized: false
    });

    this.token = null;
    this.tokenExpiry = 0;
    this.error = null;
  }

  async getToken() {

    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(
        SHIPROCKET_LOGIN_URL,
        {
          email: SHIPROCKET_EMAIL,
          password: SHIPROCKET_PASSWORD
        },
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const token = response.data?.token;
      if (!token) {
        throw new Error("Shiprocket token missing");
      }
      this.token = token;
      this.tokenExpiry = Date.now() + (1000 * 60 * 60 * 8);
      console.log("✅ Shiprocket token generated");
      return token;
    } catch (error) {
      console.log("❌ Shiprocket token generation failed");
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      this.error = error;
      return null;
    }
  }

  async createPickupLocation(warehouse) {
  
    try {
      const token = await this.getToken();
      if (!token) throw new Error("Token failed");
      const payload = {
        pickup_location: `WH_${warehouse.id}`,
        name: warehouse.contactName,
        email: warehouse.labelDetails?.support_email || "support@gamil.com",
        phone: warehouse.contactPhone,
        address: warehouse.address,
        address_2: "",
        city: warehouse.city,
        state: warehouse.state,
        country: "India",
        pin_code: warehouse.pincode
      };
      console.log("Shiprocket Pickup Payload", payload);
      const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/settings/company/addpickup",
        payload,
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.log("❌ Shiprocket pickup create failed");
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      this.error = error;
      return null;
    }
  }

  async createOrder(data)
  {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("Token failed");
      const payload = {
        order_id: data.orderId,
        order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        pickup_location: data.pickup_location,
        billing_customer_name: data.shippingDetails.fname,
        billing_last_name: data.shippingDetails.lname || "",
        billing_address: data.shippingDetails.address,
        billing_city: data.shippingDetails.city,
        billing_pincode: data.shippingDetails.pincode,
        billing_state: data.shippingDetails.state,
        billing_country: "India",
        billing_email: "support@kourierwale.com",
        billing_phone: data.shippingDetails.phone,
        shipping_is_billing: true,
        order_items: data.products.map(p => ({
          name: p.name,
          sku: p.sku || "SKU001",
          units: p.qty,
          selling_price: p.price
        })),
        payment_method: data.paymentType === "cod" ? "COD" : "Prepaid",
        sub_total: data.orderAmount,
        length: data.packageDetails.length,
        breadth: data.packageDetails.breadth,
        height: data.packageDetails.height,
        weight: data.packageDetails.weight / 1000
      };
      const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        payload,
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.log("❌ Shiprocket order create failed");
      if (error.response) console.log(error.response.data);
      this.error = error;
      return null;
    }
  }

  async assignAWB({ shipment_id, courier_id })
  {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("Shiprocket Token Failed");
      const payload = {
        shipment_id,
        courier_id
      };
      console.log("📦 Shiprocket AWB Payload");
      console.log(payload);
      const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
        payload,
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("📦 Shiprocket AWB Response");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log("❌ Shiprocket AWB Failed");
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      this.error = error;
      return null;
    }
}
}
export default new ShiprocketProvider();