import axios from "axios";
import https from "https";
import {
  BLUEDART_LICENCE_KEY,
  BLUEDART_LOGIN_ID,
  BLUEDART_CUSTOMER_CODE,
  BLUEDART_VENDOR_CODE
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
  }
  generateDateFormat() {
    return `/Date(${Date.now()})/`;
  }
  async createShipment(data) {
    try {

      const {
        orderId,
        paymentType,
        total_price,
        shippingDetails,
        warehouse,
        packageDetails
      } = data;
      const weight = Math.max(packageDetails.weight / 1000, 0.5);
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
                CustomerAddress2: warehouse.city + "," + warehouse.state,
                CustomerPincode: warehouse.pincode,
                CustomerMobile: warehouse.contactPhone,
                CustomerCode: this.customerCode,
                OriginArea: "DEL",
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
      const url = "https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill";
      const response = await axios.post(url, payload, {
        httpsAgent: this.agent,
        headers: {
          "Content-Type": "application/json"
        }
      });
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
      console.error("Bluedart Create Shipment Error:", error);
      return false;
    }
  }

  async cancelAWB(awb) {
    try {
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
      const url = "https://apigateway.bluedart.com/in/transportation/waybill/v1/CancelWaybill";
      const response = await axios.post(url, payload, {
        httpsAgent: this.agent
      });
      const result = response.data;
      if (
        result.CancelWaybillResult &&
        result.CancelWaybillResult.IsError === "0"
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Bluedart Cancel Error:", error);
      return false;
    }
  }

//   async trackOrder(awb) {
//     try {
//       const url =
//         "https://api.bluedart.com/servlet/RoutingServlet";
//       const params = {
//         handler: "tnt",
//         action: "custawbquery",
//         loginid: this.loginId,
//         awb: "awb",
//         numbers: awb,
//         format: "json",
//         verno: "1.9",
//         scan: "1"
//       };
//       const response = await axios.get(url, { params });
//       return response.data;
//     } catch (error) {
//       console.error("Bluedart Tracking Error:", error);
//       return false;
//     }
//   }
}

export default new Provider();