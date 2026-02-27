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
  async createShipment(data)
  {
    try 
    {
      const { orderId, itemIdentifier, packageDetails, shipTo, shipFrom } = data;
      const tokenRes = await this.generateATSToken();
      if (!tokenRes?.access_token) {
        throw new Error("Amazon token generate failed");
      }
      const payload = {
        "channelDetails": {
          "channelType": "EXTERNAL"
        },
        "labelSpecifications": {
          "dpi": 300,
          "format": "PNG",
          "needFileJoining": false,
          "pageLayout": "DEFAULT",
          "requestedDocumentTypes": ["LABEL"],
          "size": {
            "length": 6,
            "width": 4,
            "unit": "INCH"
          }
        },

        "packages": [
          {
            "dimensions": {
              "length": 15,
              "width": 10,
              "height": 10,
              "unit": "CENTIMETER"
            },

            "weight": {
              "unit": "GRAM",
              "value": 190
            },

            "insuredValue": {
              "value": 1,
              "unit": "INR"
            },

            "items": [
              {
                "description": "Item",
                "itemIdentifier": "STATIC_ITEM_001",
                "quantity": 1,
                "itemValue": {
                  "value": 1,
                  "unit": "INR"
                },
                "weight": {
                  "unit": "GRAM",
                  "value": 190
                }
              }
            ],

            "packageClientReferenceId": "STATIC_ORDER_001"
          }
        ],

        "serviceSelection": {
          "serviceId": ["SWA-IN-OA"]
        },

        "shipTo": {
          "name": "Test Customer",
          "addressLine1": "Test Address Line 1",
          "addressLine2": "Test Area",
          "city": "Chennai",
          "stateOrRegion": "Tamil Nadu",
          "postalCode": "600028",
          "countryCode": "IN",
          "phoneNumber": "9999999999",
          "email": "customer@test.com"
        },

        "shipFrom": {
          "name": "Test Warehouse",
          "addressLine1": "Warehouse Address Line 1",
          "city": "Chennai",
          "stateOrRegion": "Tamil Nadu",
          "postalCode": "600002",
          "countryCode": "IN",
          "phoneNumber": "9999999999",
          "email": "warehouse@test.com"
        }
      }
      console.log("Final Payload of shipments", payload);
      console.log("create shipment url", "https://sandbox.sellingpartnerapi-eu.amazon.com/shipping/v2/oneClickShipment");
      const response = await axios.post(
        "https://sandbox.sellingpartnerapi-eu.amazon.com/shipping/v2/oneClickShipment",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-amz-access-token": "Atza|IwEBIIWC-YF9jnPsBVAL5JYGsMda_m_bAEWbgzRYfERQVsmmKeDr0BTzcrSsN1VHUAzMQvfXAFWz2pxLAfbIUxDMuYMdHCoqBQfC17hiBW6rN37XuD4yYqFEvORX6lSQBwOuiW3wOcayhPW7hLmydVDeEbjSCn0WOGKVHOiqBlSoVvsdl20ROwmMJ07GT024OrSl9YjrX2q2BIj52ic5hpKZddZntKLUvCm0zwMsrgZL-21OOv2rspZO_pBQ_LFIdpoaGZgAE1tU6SdMpw87UQ2d4hKNG-7CqE1yyIF_Rrrw1XEq6l4ENKgac7SKI-lY3hD-QvA9FgVmtG2i0WZO2kkQVwvD",
            "Authorization": `Bearer Atzr|IwEBIBm3jY2qR73uSTWGXVyiP4KsQwNH84phOaIkAUDsUXBWIHz4O7O9HThrj9CENk_CwEaxRhIjFkhxnx7O9q0fl6c4XKXQkZ_zRJyORjWMJdd9rp8DqNlNST-gyNVqdhLdaLFxRobcdAuvApZ-Q3xPM7xt0ENSwxhKPUxjBm77k7cUce4AqZvvNwpPWCHDXR-OslJCPrZs7lZX-JcjXUWVsO2XB3B-HQHtVMOGtiFiO2lxeejZIvkMt_qxt-w1Cg6mVDjJiy4foE5D0e9U2IdtnBoFScQ03LnpybmIsQt5zGhq1YkJvduJ6v09SSnGwG0qduU`,
            "x-amzn-shipping-business-id": "AmazonShipping_IN",
          },
          timeout: 20000,
        }
      );
      return response.data;
    }
    catch (err)
    {
      console.error("[AMAZON CREATE SHIPMENT ERROR]",err?.response?.data || err.message);
      return false;
    }
  }

  async cancelShipment(data)
  {
    console.log("while cancel shipment", data);
  }
}

export default new ATSProvider();