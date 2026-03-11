import axios from "axios";
import https from "https";

import {
  BLUEDART_CUSTOMER_CODE,
  BLUEDART_LICENCE_KEY,
  BLUEDART_LOGIN_ID,
  BLUEDART_VENDOR_CODE,
  BLUEDART_CREATE_SHIPMENT_FORWARD,
  BLUEDART_CANCEL_SHIPMENT_FORWARD
} from "../../configurations/base.config.mjs";

class Provider {
  constructor() {
    this.licenceKey = BLUEDART_LICENCE_KEY;
    this.loginId = BLUEDART_LOGIN_ID;
    this.customerCode = BLUEDART_CUSTOMER_CODE;
    this.vendorCode = BLUEDART_VENDOR_CODE;

    this.agent = new https.Agent({
      rejectUnauthorized: false
    });
    // ENV validation
    if (!this.licenceKey) console.log("❌ BLUEDART_LICENCE_KEY missing in .env");
    if (!this.loginId) console.log("❌ BLUEDART_LOGIN_ID missing in .env");
    if (!this.customerCode) console.log("❌ BLUEDART_CUSTOMER_CODE missing in .env");
    if (!this.vendorCode) console.log("❌ BLUEDART_VENDOR_CODE missing in .env");
    console.log("✅ Bluedart Provider Loaded");
  }
  generateDateFormat() {
    return `/Date(${Date.now()})/`;
  }
  async createShipment(data) {
    try {
      if (!data) {
        console.log("❌ Shipment data missing");
        return false;
      }
      console.log("shipment Data:", data);
      const {
        orderId,
        paymentType,
        total_price,
        shippingDetails,
        warehouse,
        packageDetails
      } = data;
      if (!shippingDetails) console.log("❌ shippingDetails missing");
      if (!warehouse) console.log("❌ warehouse details missing");
      if (!packageDetails) console.log("❌ packageDetails missing");
      if (!shippingDetails?.pincode)
        console.log("❌ Consignee pincode missing");
      if (!shippingDetails?.phone)
        console.log("❌ Consignee phone missing");
      if (!warehouse?.pincode)
        console.log("❌ Warehouse pincode missing");
      const weight = Math.max((packageDetails?.weight || 500) / 1000, 0.5);
      const payload = {
        Request: {
          Consignee: {
            ConsigneeName:
              shippingDetails.fname + " " + shippingDetails.lname,
            ConsigneeAddress1: shippingDetails.address,
            ConsigneeAddress2: "",
            ConsigneeAddress3:
              shippingDetails.city + "," + shippingDetails.state,
            ConsigneePincode: shippingDetails.pincode,
            ConsigneeMobile: shippingDetails.phone
          },
          Returnadds: {
            ReturnAddress1: warehouse.address,
            ReturnAddress2: warehouse.city + "," + warehouse.state,
            ReturnAddress3: "",
            ReturnPincode: warehouse.pincode,
            ReturnMobile: warehouse.contactPhone,
            ReturnContact: warehouse.contactName
          },
          Services: {
            ActualWeight: weight,
            CollectableAmount:
              paymentType === "cod" ? total_price : "0",
            SubProductCode:
              paymentType === "cod" ? "C" : "P",
            Commodity: {
              CommodityDetail1: "Order Item",
              CommodityDetail2: "",
              CommodityDetail3: ""
            },
            CreditReferenceNo: orderId,
            DeclaredValue: total_price,
            Dimensions: {
              Dimension: {
                Length: packageDetails.length || 10,
                Breadth: packageDetails.breadth || 10,
                Height: packageDetails.height || 10,
                Count: "1"
              }
            },
            PickupDate: this.generateDateFormat(),
            PickupTime: "1800",
            PieceCount: "1",
            ProductCode: "A",
            ProductType: "1",
            RegisterPickup: false,
            PDFOutputNotRequired: true
          },

          Shipper: {
            CustomerName: warehouse.contactName,
            CustomerAddress1: warehouse.address,
            CustomerAddress2:
              warehouse.city + "," + warehouse.state,
            CustomerPincode: warehouse.pincode,
            CustomerMobile: warehouse.contactPhone,
            CustomerCode: this.customerCode,
            OriginArea: warehouse.origin || "DEL",
            Sender: warehouse.contactName,
            VendorCode: this.vendorCode,
            IsToPayCustomer: false
          }
        },
        Profile: {
          Api_type: "S",
          LicenceKey: this.licenceKey,
          LoginID: this.loginId
        }
      };
      console.log("📦 Bluedart Shipment Payload");
      console.log(JSON.stringify(payload, null, 2));
      const response = await axios.post(
        BLUEDART_CREATE_SHIPMENT_FORWARD,
        payload,
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("📦 Bluedart API Response");
      console.log(JSON.stringify(response.data, null, 2));
      const result = response.data;
      if (
        !result.GenerateWayBillResult ||
        result.GenerateWayBillResult.IsError === "1"
      ) {
        throw new Error(
          result.GenerateWayBillResult?.Status?.[0]
            ?.StatusInformation || "Shipment failed"
        );
      }
      return {
        awb: result.GenerateWayBillResult.AWBNo,
        destination:
          result.GenerateWayBillResult.DestinationArea +
          " / " +
          result.GenerateWayBillResult.DestinationLocation
      };
    } catch (error) {
      console.error("❌ Bluedart Create Shipment Error");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  async cancelAWB(awb) {
    try {
      if (!awb) {
        console.log("❌ AWB missing for cancel");
        return false;
      }
      const payload = {
        Request: {
          AWBNo: awb
        },
        Profile: {
          Api_type: "S",
          LicenceKey: this.licenceKey,
          LoginID: this.loginId
        }
      };
      console.log("📦 Cancel AWB:", awb);
      const response = await axios.post(
        BLUEDART_CANCEL_SHIPMENT_FORWARD,
        payload,
        {
          httpsAgent: this.agent
        }
      );
      console.log("📦 Cancel Response");
      console.log(response.data);
      const result = response.data;
      if (
        result.CancelWaybillResult &&
        result.CancelWaybillResult.IsError === "0"
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Bluedart Cancel Error");
      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  async trackOrder(awb) {
    try {
      if (!awb) {
        console.log("❌ AWB missing for tracking");
        return false;
      }
      const url =
        "https://api.bluedart.com/servlet/RoutingServlet";
      const params = {
        handler: "tnt",
        action: "custawbquery",
        loginid: this.loginId,
        awb: "awb",
        numbers: awb,
        format: "json",
        verno: "1.9",
        scan: "1"
      };
      const response = await axios.get(url, { params });
      console.log("📦 Tracking Response");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Bluedart Tracking Error");
      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}
export default new Provider();