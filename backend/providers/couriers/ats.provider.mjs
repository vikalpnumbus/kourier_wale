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
    if (!ATS_GENERATE_TOKEN_URL) throw new Error("ATS_GENERATE_TOKEN_URL missing");
    if (!ATS_REFRESH_TOKEN) throw new Error("ATS_REFRESH_TOKEN missing");
    if (!ATS_CLIENT_IDENTIFIER) throw new Error("ATS_CLIENT_IDENTIFIER missing");
    if (!ATS_CLIENT_SECRET) throw new Error("ATS_CLIENT_SECRET missing");
    // 🔐 Token cache
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.isRefreshing = false;
  }

  /* =========================
     🔐 TOKEN GENERATION
  ========================== */
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
        "[ATS TOKEN ERROR]",
        error?.response?.data || error.message
      );
      return null;
    }
  }

  /* =========================
     ✅ VALID TOKEN GETTER
  ========================== */
  async getValidToken() {
    // Token valid hai
    if (
      this.cachedToken &&
      this.tokenExpiry &&
      new Date() < this.tokenExpiry
    ) {
      return this.cachedToken;
    }

    // Parallel refresh avoid
    if (this.isRefreshing) {
      await new Promise((r) => setTimeout(r, 500));
      return this.cachedToken;
    }

    this.isRefreshing = true;
    console.log("🔁 Generating new Amazon ATS token");

    const tokenRes = await this.generateATSToken();
    if (!tokenRes?.access_token) {
      this.isRefreshing = false;
      throw new Error("Amazon ATS token generation failed");
    }

    this.cachedToken = tokenRes.access_token;

    const expiresIn = tokenRes.expires_in || 3600;
    this.tokenExpiry = new Date(
      Date.now() + (expiresIn - 60) * 1000 // 60 sec buffer
    );

    this.isRefreshing = false;
    return this.cachedToken;
  }

  /* =========================
     📦 CREATE SHIPMENT
  ========================== */
  async createShipment(data) {
    try {
      const {
        itemIdentifier,
        orderId,
        orderAmount,
        packageDetails,
        shipTo,
        shipFrom,
      } = data;

      /* ---------- BASIC VALIDATION ---------- */
      if (!shipFrom?.addressLine1 || !shipFrom?.phoneNumber) {
        throw new Error("Invalid shipFrom address");
      }
      if (!shipTo?.addressLine1 || !shipTo?.phoneNumber) {
        throw new Error("Invalid shipTo address");
      }

      const accessToken = await this.getValidToken();

      const payload = {
        channelDetails: {
          channelType: "EXTERNAL",
        },
        labelSpecifications: {
          dpi: 300,
          format: "PDF",
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
              length: Number(packageDetails.length),
              width: Number(packageDetails.width || packageDetails.breadth),
              height: Number(packageDetails.height),
              unit: "CENTIMETER",
            },
            insuredValue: {
              value: Math.max(1, Number(orderAmount || 1)),
              unit: "INR",
            },
            isHazmat: false,
            items: [
              {
                itemValue: {
                  value: Math.max(1, Number(orderAmount || 1)),
                  unit: "INR",
                },
                description: "Item",
                itemIdentifier,
                quantity: 1,
                weight: {
                  unit: "GRAM",
                  value: Number(packageDetails.weight),
                },
                isHazmat: false,
              },
            ],
            packageClientReferenceId: orderId,
            weight: {
              unit: "GRAM",
              value: Number(packageDetails.weight),
            },
          },
        ],
        serviceSelection: {
          serviceId: ["SWA-IN-OA"],
        },
        shipTo,
        shipFrom,
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
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 20000,
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