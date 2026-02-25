import axios from "axios";
import qs from "qs";
import {
  ATS_GENERATE_TOKEN,
  ATS_REFRESH_TOKEN,
  ATS_CLIENT_IDENTIFIER,
  ATS_CLIENT_SECRET,
} from "../../configurations/base.config.mjs";

class ATSProvider {
  constructor() {
    if (!ATS_GENERATE_TOKEN) throw new Error("ATS_GENERATE_TOKEN is required");
    if (!ATS_REFRESH_TOKEN) throw new Error("ATS_REFRESH_TOKEN is required");
    if (!ATS_CLIENT_IDENTIFIER) throw new Error("ATS_CLIENT_IDENTIFIER is required");
    if (!ATS_CLIENT_SECRET) throw new Error("ATS_CLIENT_SECRET is required");
  }

  async generateATSToken() {
    try {
      const payload = qs.stringify({
        grant_type: "refresh_token",
        refresh_token: ATS_REFRESH_TOKEN,
        client_id: ATS_CLIENT_IDENTIFIER,
        client_secret: ATS_CLIENT_SECRET,
      });

      const response = await axios.post(
        ATS_GENERATE_TOKEN,
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        }
      );
      return response.data; 
    } catch (error) {
      console.error(
        "ATS TOKEN ERROR:",
        error?.response?.data || error.message
      );
      return false;
    }
  }

  async createShipment(data) {
    console.log('data: ', data);
    // const {
    //   courier_id,
    //   orderId,
    //   paymentType,
    //   total_price,
    //   shippingDetails,
    //   warehouse_id,
    //   warehouses,
    //   rto_warehouse_id,
    //   packageDetails,
    //   shipmentId,
    //   userId
    // } = data;
    // try {
    //   const errors = [];
    //   console.log('errors: ', errors);

    //   let [courierAWBListRes] = await Promise.all([
    //     CourierAWBListService.readAndUpdateNextAvailable({
    //       courier_id,
    //       used: false,
    //       mode: "forward",
    //     }),
    //   ]);

    //   if (!courierAWBListRes) {
    //     errors.push("No awb number is available.");
    //   }

    //   if (errors.length > 0) {
    //     throw new Error(errors.join("|"));
    //   }

    //   const availableAWB =  courierAWBListRes?.dataValues?.awb_number;
    //   console.log('availableAWB: ', availableAWB);
    //   if (!availableAWB) {
    //     errors.push("No awb number is available.");
    //   }
    //   console.log('availableAWB: ', availableAWB);

    //   if (errors.length > 0) {
    //     throw new Error(errors.join("|"));
    //   }

    //   let pickup_warehouse = null;
    //   let rto_warehouse = null;
    //   if (warehouse_id == rto_warehouse_id) {
    //     pickup_warehouse = rto_warehouse = warehouses[0];
    //   } else {
    //     pickup_warehouse = warehouses.filter((e) => e.id == warehouse_id)[0];
    //     rto_warehouse = warehouses.filter((e) => e.id == rto_warehouse_id)[0];
    //   }

    //   const payload = {
    //     AirWayBillNO: availableAWB,
    //     BusinessAccountName: "Quickdaak Small",
    //     OrderNo: orderId?.toString(),
    //     SubOrderNo: orderId?.toString(),
    //     OrderType:
    //       paymentType == "prepaid"
    //         ? "PrePaid"
    //         : paymentType == "cod"
    //         ? "COD"
    //         : null,
    //     CollectibleAmount: total_price?.toString(),
    //     DeclaredValue: total_price?.toString(),
    //     PickupType: "Vendor",
    //     Quantity: "1",
    //     ServiceType: "SD",
    //     DropDetails: {
    //       Addresses: [
    //         {
    //           Address: shippingDetails.address,
    //           City: shippingDetails.city,
    //           EmailID: "",
    //           Name: shippingDetails.fname + " " + shippingDetails.lname,
    //           PinCode: shippingDetails.pincode,
    //           State: shippingDetails.state,
    //           Type: "Primary",
    //         },
    //       ],
    //       ContactDetails: [
    //         {
    //           PhoneNo: shippingDetails.phone,
    //           Type: "Primary",
    //           VirtualNumber: null,
    //         },
    //         {
    //           PhoneNo: shippingDetails.alternate_phone,
    //           Type: "Secondary",
    //           VirtualNumber: null,
    //         },
    //       ],
    //       IsGenSecurityCode: null,
    //       SecurityCode: null,
    //       IsGeoFencingEnabled: null,
    //       Latitude: null,
    //       Longitude: null,
    //       MaxThresholdRadius: null,
    //       MidPoint: null,
    //       MinThresholdRadius: null,
    //       RediusLocation: null,
    //     },
    //     PickupDetails: {
    //       Addresses: [
    //         {
    //           Address: pickup_warehouse.address,
    //           City: pickup_warehouse.city,
    //           EmailID: "",
    //           Name: pickup_warehouse.contactName,
    //           PinCode: pickup_warehouse.pincode,
    //           State: pickup_warehouse.state,
    //           Type: "Primary",
    //         },
    //       ],
    //       ContactDetails: [
    //         {
    //           PhoneNo: pickup_warehouse.contactPhone,
    //           Type: "Primary",
    //         },
    //       ],
    //       PickupVendorCode: "ORUF1THL3Y0SJ",
    //       IsGenSecurityCode: null,
    //       SecurityCode: null,
    //       IsGeoFencingEnabled: null,
    //       Latitude: null,
    //       Longitude: null,
    //       MaxThresholdRadius: null,
    //       MidPoint: null,
    //       MinThresholdRadius: null,
    //       RediusLocation: null,
    //     },
    //     RTODetails: {
    //       Addresses: [
    //         {
    //           Address: rto_warehouse.address,
    //           City: rto_warehouse.city,
    //           EmailID: "",
    //           Name: rto_warehouse.contactName,
    //           PinCode: rto_warehouse.pincode,
    //           State: rto_warehouse.state,
    //           Type: "Primary",
    //         },
    //       ],
    //       ContactDetails: [
    //         {
    //           PhoneNo: rto_warehouse.contactPhone,
    //           Type: "Primary",
    //         },
    //       ],
    //     },
    //     Instruction: "",
    //     CustomerPromiseDate: null,
    //     IsCommercialProperty: null,
    //     IsDGShipmentType: null,
    //     IsOpenDelivery: null,
    //     IsSameDayDelivery: null,
    //     ManifestID: orderId,
    //     MultiShipmentGroupID: null,
    //     SenderName: null,
    //     IsEssential: "false",
    //     IsSecondaryPacking: "false",
    //     PackageDetails: {
    //       Dimensions: {
    //         Height: packageDetails.height,
    //         Length: packageDetails.length,
    //         Width: packageDetails.breadth,
    //       },
    //       Weight: {
    //         BillableWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(), //g->kg
    //         PhyWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(),
    //         VolWeight: (CustomMath.roundOff(packageDetails.weight / 1000))?.toString(),
    //       },
    //     }
    //     // ,
    //     // GSTMultiSellerInfo: [],
    //   };

    //   const token = (await this.generateTokenSmall())?.token || null;
    //   console.log('token: ', token);
    //   if (!token) {
    //     throw this.error;
    //   }

    //   const agent = new https.Agent({
    //     rejectUnauthorized: NODE_ENV == "development" ? false : false,
    //   });

    //   const url = this.ATS_APPLICATION_ID;
    //   console.log('url: ', url);
    //   console.log('payload: ', JSON.stringify(payload, null, 2));
    //   const response = await axios.post(url, payload, {
    //     httpsAgent: agent,
    //     headers: { token },
    //   });

    //   console.log('response: ', response);
    //   const resData = response.data;
    //   console.log('resData: ', resData);
    //   if (resData.ReturnCode != 100) {
    //     throw new Error(resData.ReturnMessage);
    //   }

    //   if (
    //     resData.ReturnCode == 100 &&
    //     resData.ReturnMessage.includes("AirWayBillNO Already exists")
    //   ) {
    //     await CourierAWBListService.update({
    //       data: { id: courierAWBListRes?.dataValues?.id, used: true },
    //     });
    //     throw new Error(resData.ReturnMessage);
    //   }
    //   return {
    //     ...response.data,
    //     courierAWBListData: courierAWBListRes.dataValues,
    //   };
    // } catch (error) {
    //   console.error("[Xpressbees.provider.mjs/createShipment]: error", error);
    //   if(error.message == "No awb number is available.")
    //   await NotificationService.sendEmail({
    //     email: ['hisinghrahul44895@gmail.com', 'sharmavikalp99@gmail.com', 'rajsinghnp2003@gmail.com'],
    //     subject: "URGENT: No AWB number available",
    //     html: `<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color:#f7f8fa; padding: 20px;">
    //     <tr>
    //         <td align="center">
    //         <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding: 30px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                
    //             <!-- Company Logo -->
    //             <tr>
    //             <td align="center" style="padding-bottom: 20px;">
    //                 <img src="http://kourierwale.live/assets/logo_company-B_87LJ-d.png" alt="Company Logo" width="120" style="display:block;">
    //             </td>
    //             </tr>

    //             <!-- Title -->
    //             <tr>
    //             <td style="font-size: 20px; font-weight:600; color:#333; padding-bottom: 10px;">
    //                 URGENT: AWB Number Unavailable
    //             </td>
    //             </tr>

    //             <!-- Body Content -->
    //             <tr>
    //             <td style="font-size: 15px; line-height: 22px; color:#555;">
    //                 Dear Team,<br><br>

    //                 This is to inform you that there are currently <strong>no available AWB numbers</strong> in the system.  
    //                 As a result, the shipment with the following details could not be pushed to Xpressbees:<br><br>

    //                 <strong>Shipment ID:</strong> ${shipmentId}<br>
    //                 <strong>Seller/User ID:</strong> ${userId}<br><br>

    //                 Kindly take immediate action to replenish the AWB inventory to avoid any operational delays.
    //             </td>
    //             </tr>

    //             <!-- Footer -->
    //             <tr>
    //             <td style="padding-top: 30px; font-size: 14px; color:#777; border-top:1px solid #eee;">
    //                 Regards,<br>
    //                 <strong>Your Operations System</strong><br>
    //                 (This is an automated email)
    //             </td>
    //             </tr>

    //         </table>
    //         </td>
    //     </tr>
    //     </table>
    //     `,
    //   });
    //   this.error = error;
    //   return false;
    // }
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

const atsProvider = new ATSProvider();
export default atsProvider;