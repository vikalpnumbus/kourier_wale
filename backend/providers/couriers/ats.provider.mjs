import axios from "axios";
import qs from "qs";
import {
  ATS_GENERATE_TOKEN_URL,
  ATS_REFRESH_TOKEN,
  ATS_CLIENT_IDENTIFIER,
  ATS_CLIENT_SECRET,
  ATS_CREATE_SHIPMENT_FORWARD,
} from "../../configurations/base.config.mjs";

/**
 * Helper – Amazon ATS STRICT number requirement
 */
const num = (v, fallback = 1) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.round(n);
};

class ATSProvider {
  constructor() {
    if (!ATS_GENERATE_TOKEN_URL) throw new Error("ATS_GENERATE_TOKEN_URL missing");
    if (!ATS_REFRESH_TOKEN) throw new Error("ATS_REFRESH_TOKEN missing");
    if (!ATS_CLIENT_IDENTIFIER) throw new Error("ATS_CLIENT_IDENTIFIER missing");
    if (!ATS_CLIENT_SECRET) throw new Error("ATS_CLIENT_SECRET missing");
  }

  /**
   * Generate Amazon LWA Access Token
   */
  async generateATSToken() {
    try {
      const payload = qs.stringify({
        grant_type: "refresh_token",
        refresh_token: ATS_REFRESH_TOKEN,
        client_id: ATS_CLIENT_IDENTIFIER,
        client_secret: ATS_CLIENT_SECRET,
      });

      const res = await axios.post(ATS_GENERATE_TOKEN_URL, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      });

      return res.data; // { access_token }
    } catch (err) {
      console.error(
        "[ATS TOKEN ERROR]",
        err?.response?.data || err.message
      );
      return false;
    }
  }

  /**
   * Create Amazon Shipment (ONE CLICK SHIPMENT)
   */
  async createShipment(data) {
    try {
      const {
        orderId,
        itemIdentifier,
        packageDetails,
        shipTo,
        shipFrom,
      } = data;

      // 1️⃣ Generate token
      const tokenRes = await this.generateATSToken();
      if (!tokenRes || !tokenRes.access_token) {
        throw new Error("Amazon token generate failed");
      }

      const accessToken = tokenRes.access_token;

      // 2️⃣ Build payload (MATCHING CURL)
      const payload = {
        channelDetails: {
          channelType: "EXTERNAL",
        },

        labelSpecifications: {
          dpi: 300,
          format: "PNG",
          needFileJoining: false,
          pageLayout: "DEFAULT",
          requestedDocumentTypes: ["LABEL"],
          size: {
            length: 6,
            width: 4,
            unit: "INCH",
          },
        },

        packages: [
          {
            dimensions: {
              length: num(packageDetails.length),
              width: num(packageDetails.width || packageDetails.breadth),
              height: num(packageDetails.height),
              unit: "CENTIMETER",
            },

            insuredValue: {
              value: 1, // IMPORTANT: never 0 / decimal
              unit: "INR",
            },

            isHazmat: false,

            items: [
              {
                itemValue: {
                  value: 1,
                  unit: "INR",
                },
                description: "Item",
                itemIdentifier: itemIdentifier,
                quantity: 1,
                weight: {
                  unit: "GRAM",
                  value: num(packageDetails.weight),
                },
                isHazmat: false,
              },
            ],

            packageClientReferenceId: orderId,

            weight: {
              unit: "GRAM",
              value: num(packageDetails.weight),
            },
          },
        ],

        serviceSelection: {
          serviceId: ["SWA-IN-OA"],
        },

        shipTo: {
          name: shipTo.name,
          addressLine1: shipTo.addressLine1,
          addressLine2: shipTo.addressLine2 || "",
          addressLine3: "",
          city: shipTo.city,
          stateOrRegion: shipTo.stateOrRegion,
          postalCode: shipTo.postalCode,
          countryCode: "IN",
          phoneNumber: shipTo.phoneNumber,
          email: shipTo.email,
        },

        shipFrom: {
          name: shipFrom.name,
          addressLine1: shipFrom.addressLine1,
          addressLine2: shipFrom.addressLine2 || "",
          addressLine3: "",
          city: shipFrom.city,
          stateOrRegion: shipFrom.stateOrRegion,
          postalCode: shipFrom.postalCode,
          countryCode: "IN",
          phoneNumber: shipFrom.phoneNumber,
          email: shipFrom.email,
        },
      };

      console.log("✅ AMAZON PAYLOAD");
      console.log(JSON.stringify(payload, null, 2));

      // 3️⃣ API Call
      const response = await axios.post(
        ATS_CREATE_SHIPMENT_FORWARD,
        payload,
        {
          headers: {
            "Content-Type": "application/json",

            // 🔑 ONLY THIS TOKEN (VERY IMPORTANT)
            "x-amz-access-token": accessToken,

            "x-amzn-shipping-business-id": "AmazonShipping_IN",
          },
          timeout: 20000,
        }
      );

      console.log("✅ AMAZON RESPONSE");
      console.log(JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (err) {
      console.error(
        "[AMAZON CREATE SHIPMENT ERROR]",
        err?.response?.data || err.message
      );
      return false;
    }
  }
}

export default new ATSProvider();