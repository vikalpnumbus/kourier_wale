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
const weightInGrams = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 500;
  if (n < 1) return Math.round(n * 1000);
  return Math.round(n);
  };

/**
 * Convert state name → code (IMPORTANT)
 */
function normalizeCity(city) {
  if (!city) return "Delhi";
  const map = {
    "north west delhi": "Delhi",
    "south delhi": "Delhi",
    "west delhi": "Delhi",
    "gurgaon": "Gurugram"
  };
  const key = city.toLowerCase().trim();
  return map[key] || city;
}
const getStateCode = (state) => stateMap[state] || state || "UP";
const formatAddress = (address = "", maxLength = 60) => {
  if (!address) return "";
  return address
    .replace(/[^a-zA-Z0-9\s,.-]/g, "") // remove weird chars
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};
class ATSProvider {
  constructor() {
    if (!ATS_GENERATE_TOKEN_URL) throw new Error("ATS_GENERATE_TOKEN_URL missing");
    if (!ATS_REFRESH_TOKEN) throw new Error("ATS_REFRESH_TOKEN missing");
    if (!ATS_CLIENT_IDENTIFIER) throw new Error("ATS_CLIENT_IDENTIFIER missing");
    if (!ATS_CLIENT_SECRET) throw new Error("ATS_CLIENT_SECRET missing");
    if (!AWS_ACCESS_KEY) throw new Error("AWS_ACCESS_KEY missing");
    if (!AWS_SECRET_KEY) throw new Error("AWS_SECRET_KEY missing");

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

    aws4.sign(opts, {
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
    });

    const response = await axios({
      method,
      url,
      headers: opts.headers,
      data: payload,
    });

    return response.data;
  }

  async createShipment(data) {
    try {
      const { orderId, items, packageDetails, shippingDetails, warehouses } = data;
      const itemsList = Array.isArray(items) ? items : (data.products || []);
      const wh = warehouses?.[0]?.dataValues || {};
      const cityFixed = normalizeCity(shippingDetails?.city);
      const payload = {
        channelDetails: {
          channelType: "EXTERNAL"
        },
        serviceSelection: {
          serviceId: ["SWA-IN-OA"]
        },
        labelSpecifications: {
          format: "PNG",
          size: { length: 6, width: 4, unit: "INCH" }
        },
        shipTo: {
          name: `${shippingDetails?.fname} ${shippingDetails?.lname}`,
          addressLine1: formatAddress(shippingDetails?.address),
          city: cityFixed,
          stateOrRegion: getStateCode(shippingDetails?.state),
          postalCode: shippingDetails?.pincode,
          countryCode: "IN",
          phoneNumber: shippingDetails?.phone,
          email: shippingDetails?.email || "customer@veygo.in"
        },
        shipFrom: {
          name: wh?.name,
          addressLine1: formatAddress(wh?.address),
          city: wh?.city,
          stateOrRegion: getStateCode(wh?.state),
          postalCode: wh?.pincode,
          countryCode: "IN",
          phoneNumber: wh?.contactPhone,
          email: wh?.email || "warehouse@veygo.in"
        },
        returnTo: {
          name: wh?.name,
          addressLine1: formatAddress(wh?.address),
          city: wh?.city,
          stateOrRegion: getStateCode(wh?.state),
          postalCode: wh?.pincode,
          countryCode: "IN",
          phoneNumber: wh?.contactPhone,
          email: wh?.email || "warehouse@veygo.in"
        },
        packages: [
          {
            dimensions: {
              unit: "CENTIMETER",
              length: num(packageDetails?.length, 10),
              width: num(packageDetails?.breadth, 10),
              height: num(packageDetails?.height, 10)
            },
            weight: {
              unit: "GRAM",
              value: weightInGrams(packageDetails?.weight)
            },
            isHazmat: false,
            sellerDisplayName: wh?.name || "Default Seller",
            charges: [
              {
                amount: {
                  value: num(data?.orderAmount),
                  unit: "INR"
                }
              }
            ],
            packageClientReferenceId: orderId,
            items: itemsList.map((item, i) => ({
              description: item.name || "Item",
              quantity: num(item.qty || 1),
              itemValue: {
                value: num(data?.orderAmount),
                unit: "INR"
              },
              weight: {
                unit: "GRAM",
                value: weightInGrams(packageDetails?.weight)
              }
            }))
          }
        ]
      };
      console.log("✅ FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
      return await this.signedRequest("POST", ATS_CREATE_SHIPMENT_FORWARD, payload);
    } catch (err) {
      console.error("❌ FULL ERROR:", err?.response?.data || err);
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