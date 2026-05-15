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
        const payload = {
            order_number: data.orderId,
            payment_type: data.paymentType,
            order_amount: data.orderAmount,
            package_weight: Number(data.packageDetails.weight), 
            package_length: data.packageDetails.length,
            package_breadth: data.packageDetails.breadth,
            package_height: data.packageDetails.height,
            consignee: {
                name: `${data.shippingDetails.fname} ${data.shippingDetails.lname}`,
                address: data.shippingDetails.address,
                city: data.shippingDetails.city,
                state: data.shippingDetails.state,
                pincode: data.shippingDetails.pincode,
                phone: data.shippingDetails.phone,
            },
            pickup: {
                warehouse_name: "default",
                name: data.warehouses[0].dataValues.name,
                address: data.warehouses[0].dataValues.address,
                city: data.warehouses[0].dataValues.city,
                state: data.warehouses[0].dataValues.state,
                pincode: data.warehouses[0].dataValues.pincode,
                phone: data.warehouses[0].dataValues.phone || "9999999999",
            },
            order_items: [
                {
                name: data.products[0]?.name,
                qty: Number(data.products[0]?.qty),
                price: String(data.products[0]?.price),
                sku: data.products[0]?.sku || "sku001",
                },
            ],
            collectable_amount: data.paymentType === "cod" ? data.collectableAmount : 0,
            courier_id: Number(courierid),
        };
        console.log("XB FINAL PAYLOAD =>", payload);
        const response = await axios.post("https://shipment.xpressbees.com/api/shipments2",payload,{
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        }
        );
        console.log("XB FINAL RESPONSE =>", response.data);
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

    async cancelShipment(awb) {
        console.log(awb);
        try
        {
            const token = await this.generateToken();
            if (!awb) {
            return {
                success: false,
                error: "AWB number is required",
            };
            }
            const response = await axios.post(
            "https://shipment.xpressbees.com/api/shipments2/cancel",{awb: String(awb),},
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                },
            }
            );
            console.log("XB CANCEL RESPONSE =>", response.data);
            if (!response.data?.status) {
            return {
                success: false,
                error:
                response.data?.message || "Failed to cancel shipment",
            };
            }
            return {
            success: true,
            message: "Shipment cancelled successfully",
            data: response.data,
            };
        } catch (error) {
            const xbError =
            error.response?.data?.message ||
            error.response?.data ||
            error.message;
            console.error("XB Cancel Error:", xbError);
            return {
            success: false,
            error: xbError,
            };
        }
    }

    async getTracking(awb) {
        try {
            const token = await this.generateToken();
            const response = await axios.get(
            `https://shipment.xpressbees.com/api/shipments2/track/${awb}`,
            {},
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
            "XB Tracking Error:",
            error?.response?.data || error.message
            );
            return null;
        }
    }
}

const XpressBeesPanel = new Provider();
export default XpressBeesPanel;
