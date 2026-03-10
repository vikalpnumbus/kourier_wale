import https from "https";
import axios from "axios";

import {
  BLUEDART_LICENCE_KEY,
  BLUEDART_LOGIN_ID,
  BLUEDART_CUSTOMER_CODE,
  BLUEDART_VENDOR_CODE,
  BLUEDART_CREATE_SHIPMENT_FORWARD,
} from "../../configurations/base.config.mjs";
import CustomMath from "../../utils/basic.utils.mjs";

class Provider {
  constructor() {
    this.error = null;
    this.BLUEDART_LICENCE_KEY = BLUEDART_LICENCE_KEY;
    this.BLUEDART_LOGIN_ID = BLUEDART_LOGIN_ID;
    this.BLUEDART_CUSTOMER_CODE = BLUEDART_CUSTOMER_CODE;
    this.BLUEDART_VENDOR_CODE = BLUEDART_VENDOR_CODE;
    this.BLUEDART_CREATE_SHIPMENT_FORWARD = BLUEDART_CREATE_SHIPMENT_FORWARD;
    
    if (!this.BLUEDART_LICENCE_KEY) {
      throw new Error("BLUEDART_LICENCE_KEY is required.");
    }
    if (!this.BLUEDART_LOGIN_ID) {
      throw new Error("BLUEDART_LOGIN_ID is required.");
    }
    if (!this.BLUEDART_CUSTOMER_CODE) {
      throw new Error("BLUEDART_CUSTOMER_CODE is required.");
    }
    if (!this.BLUEDART_VENDOR_CODE) {
      throw new Error("BLUEDART_VENDOR_CODE is required.");
    }
    if (!this.BLUEDART_CREATE_SHIPMENT_FORWARD) {
      throw new Error("BLUEDART_CREATE_SHIPMENT_FORWARD is required.");
    }
  }

  generateDateFormat() {
    return `/Date(${Date.now()})/`;
  }

  async createShipment(data) {
    try {
      const {
        courier_id,
        orderId,
        paymentType,
        total_price,
        shippingDetails,
        warehouse,
        rtoWarehouse,
        packageDetails,
      } = data;
      const payload = {
        Request: {
          Consignee: {
            ConsigneeName: shippingDetails.fname + " " + shippingDetails.lname,
            ConsigneeAddress1: shippingDetails.address,
            ConsigneeAddress2: "",
            ConsigneeAddress3: shippingDetails.city + "," + shippingDetails.state,
            ConsigneePincode: shippingDetails.pincode,
            ConsigneeMobile: shippingDetails.phone,
            ConsigneeTelephone: shippingDetails.phone,
          },
          Returnadds: {
            ReturnAddress1: rtoWarehouse.address,
            ReturnAddress2: rtoWarehouse.city + "," + rtoWarehouse.state,
            ReturnAddress3: "",
            ReturnPincode: rtoWarehouse.pincode,
            ReturnMobile: rtoWarehouse.contactPhone,
            ReturnContact: rtoWarehouse.contactPhone,
          },
          Services: {
            ProductCode: "A",
            SubProductCode: "P",
            ProductType: paymentType === "cod" ? "C" : "P",
            PieceCount: 1,
            ActualWeight: CustomMath.roundOff(
              packageDetails.weight / 1000
            ),
            CollectableAmount:
              paymentType === "cod" ? total_price : "0",
            DeclaredValue: total_price,
            Commodity: {
              CommodityDetail1: "Order Items",
              CommodityDetail2: "",
              CommodityDetail3: "",
            },
            Dimensions: {
              Dimension: {
                Length: packageDetails.length,
                Breadth: packageDetails.breadth,
                Height: packageDetails.height,
                Count: "1",
              },
            },
            PickupDate: this.generateDateFormat(),
            PickupTime: "1800",
            RegisterPickup: true,
            PDFOutputNotRequired: true,
            OTPBasedDelivery: "0",
          },
          itemdtl: [
            {
              ItemID: orderId,
              ItemName: "Order Product",
              ItemValue: total_price,
              Itemquantity: 1,
              InvoiceNumber: orderId,
              InvoiceDate: this.generateDateFormat(),
              TotalValue: total_price,
              SellerName: warehouse.contactName,
              SellerGSTNNumber: "",
              HSCode: "0",
              SKUNumber: "0",
              PlaceofSupply: warehouse.city,
              CGSTAmount: 0,
              SGSTAmount: 0,
              IGSTAmount: 0,
              cessAmount: "0",
              countryOfOrigin: "IN",
            },
          ],
          Shipper: {
            CustomerName: warehouse.contactName,
            CustomerAddress1: warehouse.address,
            CustomerAddress2: warehouse.city + "," + warehouse.state,
            CustomerAddress3: "",
            CustomerPincode: warehouse.pincode,
            CustomerMobile: warehouse.contactPhone,
            CustomerCode: this.BLUEDART_CUSTOMER_CODE,
            VendorCode: this.BLUEDART_VENDOR_CODE,
            OriginArea: "DEL",
            Sender: warehouse.contactName,
            IsToPayCustomer: false,
          },
        },
        Profile: {
          Api_type: "S",
          LicenceKey: this.BLUEDART_LICENCE_KEY,
          LoginID: this.BLUEDART_LOGIN_ID,
        },
      };
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      const response = await axios.post(
        this.BLUEDART_CREATE_SHIPMENT_FORWARD,
        payload,
        {
          httpsAgent: agent,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return {
        ...response.data,
        courierAWBListData: courierAWBListRes.dataValues,
      };
    } catch (error) {
      console.error("[Bluedart.provider/createShipment]:", error);
      this.error = error;
      return false;
    }
  }
}

const BluedartProvider = new Provider();
export default BluedartProvider;