import axios from "axios";
import qs from "qs";
import aws4 from "aws4";
import {
  ATS_GENERATE_TOKEN_URL,
  ATS_REFRESH_TOKEN,
  ATS_CLIENT_IDENTIFIER,
  ATS_CLIENT_SECRET,
  ATS_CREATE_SHIPMENT_FORWARD,
  ATS_CANCEL_SHIPMENT_FORWARD,
  ATS_LABEL_DOWNLOAD_FORWARD,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
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
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async generateATSToken() {
    try {
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const payload = qs.stringify({
        grant_type: "refresh_token",
        refresh_token: ATS_REFRESH_TOKEN,
        client_id: ATS_CLIENT_IDENTIFIER,
        client_secret: ATS_CLIENT_SECRET,
      });

      const res = await axios.post(ATS_GENERATE_TOKEN_URL, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      this.accessToken = res.data.access_token;
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      return this.accessToken;
    } catch (err) {
      console.error("[ATS TOKEN ERROR]", err?.response?.data || err.message);
      return null;
    }
  }

  /**
   * ✅ COMMON SIGNED REQUEST
   */
  async signedRequest(method, url, payload = null) {
    const token = await this.generateATSToken();
    if (!token) throw new Error("Token failed");

    const parsedUrl = new URL(url);

    const opts = {
      host: parsedUrl.host,
      path: parsedUrl.pathname + (parsedUrl.search || ""),
      service: "execute-api",
      region: "eu-west-1",
      method,
      headers: {
        "Content-Type": "application/json",
        "x-amz-access-token": token,
        "x-amzn-shipping-business-id": "AmazonShipping_IN",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    };

    // ✅ SIGN REQUEST
    aws4.sign(opts, {
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
    });

    // DEBUG (optional)
    // console.log("SIGNED HEADERS:", opts.headers);

    const response = await axios({
      method,
      url,
      headers: opts.headers,
      data: payload,
    });

    return response.data;
  }

  async createShipment(data) {
    console.log("payloads:", data);
    try {
      const {
        orderId,
        items,
        packageDetails,
        shippingDetails,
        warehouses
      } = data;

      const itemsList = Array.isArray(items)
        ? items
        : (data.products || []);

      const shipTo = {
        name: `${shippingDetails?.fname || ""} ${shippingDetails?.lname || ""}`,
        address1: shippingDetails?.address,
        address2: "",
        city: shippingDetails?.city,
        state: shippingDetails?.state,
        pincode: shippingDetails?.pincode,
        phone: shippingDetails?.phone,
        email: "test@gmail.com"
      };

      const wh = warehouses?.[0]?.dataValues || {};

      const shipFrom = {
        name: wh?.name || "Warehouse",
        address1: wh?.address || "Default Address",
        city: wh?.city,
        state: wh?.state,
        pincode: wh?.pincode,
        phone: wh?.phone,
        email: wh?.email || "warehouse@test.com"
      };

      const payload = {
        channelDetails: { channelType: "EXTERNAL" },
        labelSpecifications: {
          dpi: 300,
          format: "PDF",
          pageLayout: "DEFAULT",
          needFileJoining: false,
          requestedDocumentTypes: ["LABEL"],
          size: {
            length: 6,
            width: 4,
            unit: "INCH"
          }
        },
        packages: [
          {
            dimensions: {
              length: num(packageDetails?.length, 10),
              width: num(packageDetails?.breadth, 10),
              height: num(packageDetails?.height, 10),
              unit: "CENTIMETER"
            },
            weight: {
              unit: "GRAM",
              value: num(packageDetails?.weight, 500)
            },
            insuredValue: {
              value: num(packageDetails?.price, 1),
              unit: "INR"
            },
            items: itemsList.map((item, i) => ({
              description: item.name || "Item",
              itemIdentifier: item.sku || item.id || `SKU_${i}`,
              quantity: num(item.qty || item.quantity, 1),
              itemValue: {
                value: num(item.price, 1),
                unit: "INR"
              },
              weight: {
                unit: "GRAM",
                value: num(item.weight, 200)
              }
            })),
            packageClientReferenceId: orderId
          }
        ],
        serviceSelection: {
          serviceId: ["SWA-IN-OA"]
        },
        taxDetails: {
          gstId: "09ABCDE1234F1Z5"
        },
        shipTo: {
          name: shipTo.name,
          addressLine1: shipTo.address1,
          addressLine2: shipTo.address2,
          city: shipTo.city,
          stateOrRegion: shipTo.state,
          postalCode: shipTo.pincode,
          countryCode: "IN",
          phoneNumber: shipTo.phone,
          email: shipTo.email
        },
        shipFrom: {
          name: shipFrom.name,
          addressLine1: shipFrom.address1,
          city: shipFrom.city,
          stateOrRegion: shipFrom.state,
          postalCode: shipFrom.pincode,
          countryCode: "IN",
          phoneNumber: shipFrom.phone,
          email: shipFrom.email
        }
      };

      return await this.signedRequest(
        "POST",
        ATS_CREATE_SHIPMENT_FORWARD,
        payload
      );

    } catch (err) {
      console.log("full error:", err);
      console.error("[CREATE SHIPMENT ERROR]", err?.response?.data || err);
      return false;
    }
  }

  async cancelShipment({ amazon_shipment_id }) {
    try {
      const url = `${ATS_CANCEL_SHIPMENT_FORWARD}/${amazon_shipment_id}/cancel`;

      return await this.signedRequest("PUT", url);

    } catch (err) {
      console.error("[CANCEL ERROR]", err?.response?.data || err);
      return false;
    }
  }

  async downloadShipmentLabel({ amazon_shipment_id }) {
    try {
      const url = `${ATS_LABEL_DOWNLOAD_FORWARD}/${amazon_shipment_id}/documents`;

      const res = await this.signedRequest("GET", url);

      const doc = res?.payload?.packageDocumentDetail?.packageDocuments
        ?.find(d => d.type === "LABEL");

      if (!doc) throw new Error("Label not found");

      return {
        buffer: Buffer.from(doc.contents, "base64"),
        format: doc.format,
        fileName: `amazon_${amazon_shipment_id}.${doc.format.toLowerCase()}`
      };

    } catch (err) {
      console.error("[LABEL ERROR]", err?.response?.data || err);
      return false;
    }
  }
}

export default new ATSProvider();