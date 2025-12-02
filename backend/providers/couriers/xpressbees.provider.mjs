import https from "https";
import {
  XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD,
  XPRESSBEES_URL_GENERATE_SMALL_TOKEN,
  XPRESSBEES_URL_GENERATE_SMALL_USERNAME,
  XPRESSBEES_URL_GENERATE_SMALL_PASSWORD,
  XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY,
  NODE_ENV,
  XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD,
} from "../../configurations/base.config.mjs";
import axios from "axios";
import CourierAWBListService from "../../services/courierAWBList.service.mjs";
import ShippingService from "../../services/shipping.service.mjs";
import WarehouseService from "../../services/warehouse.service.mjs";
import CustomMath from "../../utils/basic.utils.mjs";

class Provider {
  constructor() {
    this.error = null;
    this.XPRESSBEES_URL_GENERATE_SMALL_TOKEN =
      XPRESSBEES_URL_GENERATE_SMALL_TOKEN;
    this.XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD =
      XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD;
    this.XPRESSBEES_URL_GENERATE_SMALL_USERNAME =
      XPRESSBEES_URL_GENERATE_SMALL_USERNAME;
    this.XPRESSBEES_URL_GENERATE_SMALL_PASSWORD =
      XPRESSBEES_URL_GENERATE_SMALL_PASSWORD;
    this.XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY =
      XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY;
    this.XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD =
      XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD;
    if (!this.XPRESSBEES_URL_GENERATE_SMALL_TOKEN) {
      throw new Error("XPRESSBEES_URL_GENERATE_SMALL_TOKEN is required.");
    }
    if (!this.XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD) {
      throw new Error("XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD is required.");
    }
    if (!this.XPRESSBEES_URL_GENERATE_SMALL_USERNAME) {
      throw new Error("XPRESSBEES_URL_GENERATE_SMALL_USERNAME is required.");
    }
    if (!this.XPRESSBEES_URL_GENERATE_SMALL_PASSWORD) {
      throw new Error("XPRESSBEES_URL_GENERATE_SMALL_PASSWORD is required.");
    }
    if (!this.XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY) {
      throw new Error("XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY is required.");
    }
    if (!this.XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD) {
      throw new Error("XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD is required.");
    }
  }

  async generateTokenSmall() {
    try {
      const url = this.XPRESSBEES_URL_GENERATE_SMALL_TOKEN;
      const response = await axios.post(url, {
        username: this.XPRESSBEES_URL_GENERATE_SMALL_USERNAME,
        password: this.XPRESSBEES_URL_GENERATE_SMALL_PASSWORD,
        secretkey: this.XPRESSBEES_URL_GENERATE_SMALL_SECRET_KEY,
      });
      return response.data;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async createShipment(data) {
    try {
      const {
        courier_id,
        order_db_id,
        paymentType,
        total_price,
        shippingDetails,
        warehouse_id,
        warehouses,
        rto_warehouse_id,
        packageDetails,
      } = data;
      const errors = [];

      let [courierAWBListRes] = await Promise.all([
        CourierAWBListService.readAndUpdateNextAvailable({
          courier_id,
          used: false,
          mode: "forward",
        }),
      ]);

      if (!courierAWBListRes) {
        errors.push("No awb number is available.");
      }

      if (errors.length > 0) {
        throw new Error(errors.join("|"));
      }

      const availableAWB =  courierAWBListRes?.dataValues?.awb_number;
      if (!availableAWB) {
        errors.push("No awb number is available.");
      }
      console.log('availableAWB: ', availableAWB);

      if (errors.length > 0) {
        throw new Error(errors.join("|"));
      }

      let pickup_warehouse = null;
      let rto_warehouse = null;
      if (warehouse_id == rto_warehouse_id) {
        pickup_warehouse = rto_warehouse = warehouses[0];
      } else {
        pickup_warehouse = warehouses.filter((e) => e.id == warehouse_id)[0];
        rto_warehouse = warehouses.filter((e) => e.id == rto_warehouse_id)[0];
      }

      const payload = {
        AirWayBillNO: availableAWB,
        BusinessAccountName: "Quickdaak Small",
        OrderNo: order_db_id?.toString(),
        SubOrderNo: order_db_id?.toString(),
        OrderType:
          paymentType == "prepaid"
            ? "PrePaid"
            : paymentType == "cod"
            ? "COD"
            : null,
        CollectibleAmount: total_price?.toString(),
        DeclaredValue: total_price?.toString(),
        PickupType: "Vendor",
        Quantity: "1",
        ServiceType: "SD",
        DropDetails: {
          Addresses: [
            {
              Address: shippingDetails.address,
              City: shippingDetails.city,
              EmailID: "",
              Name: shippingDetails.fname + " " + shippingDetails.lname,
              PinCode: shippingDetails.pincode,
              State: shippingDetails.state,
              Type: "Primary",
            },
          ],
          ContactDetails: [
            {
              PhoneNo: shippingDetails.phone,
              Type: "Primary",
              VirtualNumber: null,
            },
            {
              PhoneNo: shippingDetails.alternate_phone,
              Type: "Secondary",
              VirtualNumber: null,
            },
          ],
          IsGenSecurityCode: null,
          SecurityCode: null,
          IsGeoFencingEnabled: null,
          Latitude: null,
          Longitude: null,
          MaxThresholdRadius: null,
          MidPoint: null,
          MinThresholdRadius: null,
          RediusLocation: null,
        },
        PickupDetails: {
          Addresses: [
            {
              Address: pickup_warehouse.address,
              City: pickup_warehouse.city,
              EmailID: "",
              Name: pickup_warehouse.contactName,
              PinCode: pickup_warehouse.pincode,
              State: pickup_warehouse.state,
              Type: "Primary",
            },
          ],
          ContactDetails: [
            {
              PhoneNo: pickup_warehouse.contactPhone,
              Type: "Primary",
            },
          ],
          PickupVendorCode: "ORUF1THL3Y0SJ",
          IsGenSecurityCode: null,
          SecurityCode: null,
          IsGeoFencingEnabled: null,
          Latitude: null,
          Longitude: null,
          MaxThresholdRadius: null,
          MidPoint: null,
          MinThresholdRadius: null,
          RediusLocation: null,
        },
        RTODetails: {
          Addresses: [
            {
              Address: rto_warehouse.address,
              City: rto_warehouse.city,
              EmailID: "",
              Name: rto_warehouse.contactName,
              PinCode: rto_warehouse.pincode,
              State: rto_warehouse.state,
              Type: "Primary",
            },
          ],
          ContactDetails: [
            {
              PhoneNo: rto_warehouse.contactPhone,
              Type: "Primary",
            },
          ],
        },
        Instruction: "",
        CustomerPromiseDate: null,
        IsCommercialProperty: null,
        IsDGShipmentType: null,
        IsOpenDelivery: null,
        IsSameDayDelivery: null,
        ManifestID: order_db_id,
        MultiShipmentGroupID: null,
        SenderName: null,
        IsEssential: "false",
        IsSecondaryPacking: "false",
        PackageDetails: {
          Dimensions: {
            Height: packageDetails.height,
            Length: packageDetails.length,
            Width: packageDetails.breadth,
          },
          Weight: {
            BillableWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(), //g->kg
            PhyWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(),
            VolWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(),
          },
        }
        // ,
        // GSTMultiSellerInfo: [],
      };

      const token = (await this.generateTokenSmall())?.token || null;
      console.log('token: ', token);
      if (!token) {
        throw this.error;
      }

      const agent = new https.Agent({
        rejectUnauthorized: NODE_ENV == "development" ? false : false,
      });

      const url = this.XPRESSBEES_URL_CREATE_SHIPMENT_FORWARD;
      console.log('url: ', url);
      console.log('payload: ', JSON.stringify(payload, null, 2));
      const response = await axios.post(url, payload, {
        httpsAgent: agent,
        headers: { token },
      });

      console.log('response: ', response);
      const resData = response.data;
      console.log('resData: ', resData);
      if (resData.ReturnCode != 100) {
        throw new Error(resData.ReturnMessage);
      }

      if (
        resData.ReturnCode == 100 &&
        resData.ReturnMessage.includes("AirWayBillNO Already exists")
      ) {
        await CourierAWBListService.update({
          data: { id: courierAWBListRes?.dataValues?.id, used: true },
        });
        throw new Error(resData.ReturnMessage);
      }
      return {
        ...response.data,
        courierAWBListData: courierAWBListRes.dataValues,
      };
    } catch (error) {
      // console.error("error: ", error);
      this.error = error;
      return false;
    }
  }

  async cancelShipment(data) {
    try {
      const { awb_number } = data;

      const payload = {
        ShippingID: awb_number,
        CancellationReason: "Cancelling from Portal",
      };

      const token = (await this.generateTokenSmall())?.token || null;
      if (!token) {
        throw new Error("Error generating the token.");
      }

      const agent = new https.Agent({
        rejectUnauthorized: NODE_ENV == "development" ? false : true,
      });
      const url = this.XPRESSBEES_URL_CANCEL_SHIPMENT_FORWARD;
      const response = await axios.post(url, payload, {
        httpsAgent: agent,
        headers: { token },
      });

      const resData = response.data;
      if (resData.ReturnCode != 100) {
        throw new Error(resData.ReturnMessage);
      }
      if (
        resData.ReturnCode == 103 &&
        resData.ReturnMessage.includes("Shipment is already notified.")
      ) {
        throw new Error(resData.ReturnMessage);
      }

      return true;
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const XpressBeesProvider = new Provider();
export default XpressBeesProvider;
