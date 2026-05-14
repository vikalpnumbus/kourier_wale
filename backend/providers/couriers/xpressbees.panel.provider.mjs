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
        console.log("payload request:", data);
        try {
            const token = await this.generateToken();
            if (!token) {
            throw new Error("Xpressbees token generate failed");
            }
            const url = "https://shipment.xpressbees.com/api/shipments2";
            const payload = {
            order_number: data.order_number,
            unique_order_number: "yes",
            shipping_charges: data.shipping_charges || 0,
            discount: data.discount || 0,
            cod_charges: data.cod_charges || 0,
            payment_type: data.payment_type || "prepaid",
            order_amount: data.order_amount,
            package_weight: data.package_weight,
            package_length: data.package_length,
            package_breadth: data.package_breadth,
            package_height: data.package_height,
            request_auto_pickup: "yes",
            consignee: {
                name: data.customer_name,
                address: data.address,
                address_2: data.address_2 || "",
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                phone: data.phone,
            },
            pickup: {
                warehouse_name: data.warehouse_name || "default",
                name: data.pickup_name,
                address: data.pickup_address,
                address_2: data.pickup_address_2 || "",
                city: data.pickup_city,
                state: data.pickup_state,
                pincode: data.pickup_pincode,
                phone: data.pickup_phone,
            },
            order_items: [
                {
                name: data.product_name,
                qty: Number(data.qty) || 1, // ✅ fix
                price: String(data.price),
                sku: data.sku || "sku001",
                },
            ],
            courier_id: courierid,
            collectable_amount:
                data.payment_type === "cod" ? data.collectable_amount : 0,
            };
            const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            });
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
