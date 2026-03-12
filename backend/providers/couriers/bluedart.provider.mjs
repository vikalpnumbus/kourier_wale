import axios from "axios";
import https from "https";
const TOKEN_URL = "https://apigateway.bluedart.com/in/transportation/token/v1/login";
const BLUEDART_LICENCE_KEY = "elqrnftfqjtfksrqrmlhmkmq3ntimlgf";
const BLUEDART_CUSTOMER_CODE = 908014;
const BLUEDART_LOGIN_ID = "DEL28808";
const BLUEDART_VENDOR_CODE = "C47646875";
const BLUEDART_API_KEY = "4AYuiEkp1mhpuFGVbNqx3eMThSO3VtWG";
const BLUEDART_API_SECRATE = "Ei8ubHdmaWEg3Ffl"
const BLUEDART_CREATE_SHIPMENT_FORWARD = "https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill";
const BLUEDART_CANCEL_SHIPMENT_FORWARD = "https://apigateway.bluedart.com/in/transportation/waybill/v1/CancelWaybill";


class BluedartProvider {
  constructor() {
    this.agent = new https.Agent({
      rejectUnauthorized: false
    });
  }
  generateDateFormat() {
    return `/Date(${Date.now()})/`;
  }
  async getToken() {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    try {
      const url = `${TOKEN_URL}?ClientID=${BLUEDART_LICENCE_KEY}`;
      const response = await axios.get(url, {
        httpsAgent: this.agent
      });
      const token = response.data?.JwtToken;
      if (!token) {
        throw new Error("Bluedart token missing");
      }
      this.token = token;
      this.tokenExpiry = Date.now() + 1000 * 60 * 100;
      console.log("✅ Bluedart token generated");
      return token;
    } catch (error) {
      console.log("❌ Token generation failed");
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      return null;
    }
  }

  async createShipment(data) {
    try {
      if (!data) {
        console.log("❌ Shipment data missing");
        return false;
      }
      const token = await this.getToken();
      if (!token) {
        console.log("❌ Token not available");
        return false;
      }
      const {
        orderId,
        paymentType,
        total_price,
        shippingDetails,
        packageDetails,
        warehouses
      } = data;
      const warehouseData =
        warehouses?.[0]?.dataValues || warehouses?.[0] || null;
      if (!warehouseData) {
        console.log("❌ warehouse missing");
        return false;
      }
      const warehouse = {
        address: warehouseData.address || "",
        city: warehouseData.city || "",
        state: warehouseData.state || "",
        pincode: warehouseData.pincode || "",
        contactPhone:
          warehouseData.phone || warehouseData.contactPhone || "",
        contactName:
          warehouseData.contact_name || warehouseData.contactName || "",
        origin: warehouseData.origin || "DEL"
      };
      const weight = Math.max(
        Number(packageDetails?.weight || 500) / 1000,
        0.5
      );
      const payload = {
        Request: {
          Consignee: {
            AvailableDays: "",
            AvailableTiming: "",
            ConsigneeAddress1: shippingDetails.address,
            ConsigneeAddress2: "",
            ConsigneeAddress3:
              shippingDetails.city + " " + shippingDetails.state,
            ConsigneeAddressType: "",
            ConsigneeAddressinfo: "",
            ConsigneeAttention: "",
            ConsigneeEmailID:
              shippingDetails.email || "",
            ConsigneeFullAddress: "",
            ConsigneeGSTNumber: "",
            ConsigneeLatitude: "",
            ConsigneeLongitude: "",
            ConsigneeMaskedContactNumber: "",
            ConsigneeMobile: shippingDetails.phone,
            ConsigneeName:
              shippingDetails.fname +
              " " +
              shippingDetails.lname,
            ConsigneePincode: shippingDetails.pincode,
            ConsigneeTelephone: ""
          },
          Returnadds: {
            ManifestNumber: "",
            ReturnAddress1: warehouse.address,
            ReturnAddress2:
              warehouse.city + " " + warehouse.state,
            ReturnAddress3: "",
            ReturnAddressinfo: "",
            ReturnContact: warehouse.contactName,
            ReturnEmailID: "",
            ReturnLatitude: "",
            ReturnLongitude: "",
            ReturnMaskedContactNumber: "",
            ReturnMobile: warehouse.contactPhone,
            ReturnPincode: warehouse.pincode,
            ReturnTelephone: ""
          },
          Services: {
            AWBNo: "",
            ActualWeight: weight.toFixed(2),
            CollectableAmount:
              paymentType === "cod"
                ? Number(total_price)
                : 0,
            Commodity: {
              CommodityDetail1: "Order Item",
              CommodityDetail2: "",
              CommodityDetail3: ""
            },
            CreditReferenceNo: orderId,
            CreditReferenceNo2: "",
            CreditReferenceNo3: "",
            DeclaredValue: Number(total_price),
            DeliveryTimeSlot: "",
            Dimensions: [
              {
                Breadth: Number(packageDetails.breadth) || 10,
                Count: 1,
                Height: Number(packageDetails.height) || 10,
                Length: Number(packageDetails.length) || 10
              }
            ],
            FavouringName: "",
            IsDedicatedDeliveryNetwork: false,
            IsDutyTaxPaidByShipper: false,
            IsForcePickup: false,
            IsPartialPickup: false,
            IsReversePickup: false,
            ItemCount: 1,
            Officecutofftime: "",
            PDFOutputNotRequired: true,
            PackType: "",
            ParcelShopCode: "",
            PayableAt: "",
            PickupDate: this.generateDateFormat(),
            PickupMode: "",
            PickupTime: "1600",
            PickupType: "",
            PieceCount: "1",
            PreferredPickupTimeSlot: "",
            ProductCode: "A",
            ProductFeature: "",
            ProductType: 1,
            RegisterPickup: true,
            SpecialInstruction: "",
            SubProductCode: paymentType === "cod" ? "C" : "P",
            TotalCashPaytoCustomer: 0,
            itemdtl: [
              {
                CGSTAmount: 0,
                HSCode: "",
                IGSTAmount: 0,
                Instruction: "",
                InvoiceDate: this.generateDateFormat(),
                InvoiceNumber: "",
                ItemID: orderId,
                ItemName: "Order Item",
                ItemValue: Number(total_price),
                Itemquantity: 1,
                PlaceofSupply: "",
                ProductDesc1: "",
                ProductDesc2: "",
                ReturnReason: "",
                SGSTAmount: 0,
                SKUNumber: "",
                SellerGSTNNumber: "",
                SellerName: "",
                SubProduct1: "",
                SubProduct2: "",
                TaxableAmount: 0,
                TotalValue: Number(total_price),
                cessAmount: "0.0",
                countryOfOrigin: "",
                docType: "",
                subSupplyType: 0,
                supplyType: ""
              }
            ],
            noOfDCGiven: 0
          },
          Shipper: {
            CustomerAddress1: warehouse.address,
            CustomerAddress2:
              warehouse.city + " " + warehouse.state,
            CustomerAddress3: "",
            CustomerAddressinfo: "",
            CustomerBusinessPartyTypeCode: "",
            CustomerCode: BLUEDART_CUSTOMER_CODE,
            CustomerEmailID: "",
            CustomerGSTNumber: "",
            CustomerLatitude: "",
            CustomerLongitude: "",
            CustomerMaskedContactNumber: "",
            CustomerMobile: warehouse.contactPhone,
            CustomerName: warehouse.contactName,
            CustomerPincode: warehouse.pincode,
            CustomerTelephone: "",
            IsToPayCustomer: false,
            OriginArea: warehouse.origin,
            Sender: warehouse.contactName,
            VendorCode: BLUEDART_VENDOR_CODE
          }
        },
        Profile: {
          LoginID: BLUEDART_LOGIN_ID,
          LicenceKey: BLUEDART_LICENCE_KEY,
          Api_type: "S"
        }
      };
      console.log("📦 Bluedart Payload");
      console.log(JSON.stringify(payload, null, 2));
      const response = await axios.post(
        SHIPMENT_URL,
        payload,
        {
          httpsAgent: this.agent,
          headers: {
            "Content-Type": "application/json",
            JWTToken: token
          }
        }
      );
      console.log("📦 Bluedart Response");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log("❌ Bluedart Shipment Error");
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
      return false;
    }
  }
}

export default new BluedartProvider();