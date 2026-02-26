import axios from "axios";
import qs from "qs";
import {
  ATS_GENERATE_TOKEN_URL,
  ATS_REFRESH_TOKEN,
  ATS_CLIENT_IDENTIFIER,
  ATS_CLIENT_SECRET,
  ATS_CREATE_SHIPMENT_FORWARD,
} from "../../configurations/base.config.mjs";

class ATSProvider {
  constructor() {
    if (!ATS_GENERATE_TOKEN_URL) throw new Error("ATS_GENERATE_TOKEN_URL is required");
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
        ATS_GENERATE_TOKEN_URL,
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
    try {
      const {
        itemIdentifier,
        orderId,
        packageDetails,
        shipTo,
        shipFrom
      } = data;
      console.log("shipto wala data:", shipTo);
      console.log("shipfrom wala data:", shipFrom);
      const tokenRes = await this.generateATSToken();
      if (!tokenRes || !tokenRes.access_token) {
        throw new Error("Unable to generate Amazon access token");
      }
      const accessToken = tokenRes.access_token;
      const payload = {
        channelDetails: { channelType: "EXTERNAL" },
        labelSpecifications: {
          dpi: 300,
          format: "PDF",
          needFileJoining: false,
          pageLayout: "DEFAULT",
          requestedDocumentTypes: ["LABEL"],
          size: { length: 6, width: 4, unit: "INCH" }
        },
        packages: [
          {
            dimensions: {
              length: packageDetails.length,
              width: packageDetails.width || packageDetails.breadth,
              height: packageDetails.height,
              unit: "CENTIMETER"
            },
            insuredValue: {
              value: Math.max(1, Number(data.orderAmount || 1)),
              unit: "INR"
            },
            isHazmat: false,
            items: [
              {
                itemValue: { value: 0.01, unit: "INR" },
                description: "Item",
                itemIdentifier,
                quantity: 1,
                weight: {
                  unit: "GRAM",
                  value: packageDetails.weight
                },
                isHazmat: false
              }
            ],
            packageClientReferenceId: orderId,
            weight: { unit: "GRAM", value: packageDetails.weight }
          }
        ],
        serviceSelection: {
          serviceId: ["SWA-IN-OA"]
        },
        shipTo,
        shipFrom
      };
      console.log("[AMAZON CREATE SHIPMENT PAYLOAD]");
      console.log(JSON.stringify(payload, null, 2));
      const response = await axios.post(
        ATS_CREATE_SHIPMENT_FORWARD,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-amz-access-token": accessToken,
            "x-amzn-shipping-business-id": "AmazonShipping_IN",
            Authorization: `Bearer ${accessToken}`
          },
          timeout: 20000
        }
      );
      console.log("[AMAZON CREATE SHIPMENT RESPONSE]");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[AMAZON CREATE SHIPMENT ERROR]",
        error?.response?.data || error.message
      );
      return false;
    }
  }
}

const atsProvider = new ATSProvider();
export default atsProvider;