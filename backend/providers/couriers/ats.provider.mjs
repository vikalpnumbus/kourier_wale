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

const stateMap = {
  "Uttar Pradesh": "UP",
  "Delhi": "DL",
  "Maharashtra": "MH",
  "Karnataka": "KA",
  "Tamil Nadu": "TN",
  "Haryana": "HR"
};

function normalizeCity(city) {
  if (!city) return "Delhi";

  const map = {
    "north west delhi": "Delhi",
    "south delhi": "Delhi",
    "west delhi": "Delhi",
    "gurgaon": "Gurugram"
  };

  return map[city.toLowerCase().trim()] || city;
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

function formatATSDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    ":" +
    pad(date.getUTCMinutes()) +
    ":" +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}
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

      const totalAmount = Number(data?.orderAmount) || 0;
      const weight = weightInGrams(packageDetails?.weight);

      const payload = {
        channelDetails: {
          channelType: "EXTERNAL"
        },
        serviceSelection: {
          serviceId: ["SWA-IN-OA"]
        },
        labelSpecifications: {
          format: "PNG",
          size: { length: 6, width: 4, unit: "INCH" },
          dpi: 300,
          pageLayout: "DEFAULT",
          needFileJoining: false,
          requestedDocumentTypes: ["LABEL"],
          requestedLabelCustomization: {
            requestAttributes: [
              "PACKAGE_CLIENT_REFERENCE_ID",
              "COLLECT_ON_DELIVERY_AMOUNT"
            ]
          }
        },
        shipTo: {
          name: `${shippingDetails?.fname} ${shippingDetails?.lname}`,
          addressLine1: formatAddress(shippingDetails?.address),
          addressLine2: formatAddress(shippingDetails?.address2 || shippingDetails?.city),
          city: normalizeCity(shippingDetails?.city),
          stateOrRegion: getStateCode(shippingDetails?.state),
          postalCode: shippingDetails?.pincode,
          countryCode: "IN",
          phoneNumber: shippingDetails?.phone,
          email: shippingDetails?.email || "customer@veygo.in"
        },
        shipFrom: {
          name: wh?.name,
          addressLine1: formatAddress(wh?.address),
          addressLine2: formatAddress(wh?.address2 || wh?.city),
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
          addressLine2: formatAddress(wh?.address2 || wh?.city),
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
              value: weight
            },
            insuredValue: {   // 🔥 FIX
              value: totalAmount,
              unit: "INR"
            },
            isHazmat: false,
            sellerDisplayName: wh?.name || "Default Seller",
            charges: [
              {
                amount: {
                  value: totalAmount,
                  unit: "INR"
                },
                chargeType: "TAX"   // 🔥 FIX
              }
            ],
            packageClientReferenceId: orderId,
            items: itemsList.map((item) => ({
              description: item.name || item.sku || "Item",
              itemIdentifier: item.sku || "SKU",
              quantity: 1,
              itemValue: {
                value: Number(item.price || totalAmount),
                unit: "INR"
              },
              weight: {
                unit: "GRAM",
                value: weight
              },
              isHazmat: false,
              productType: item.name || "Product",
              invoiceDetails: {   // 🔥 FIX
                invoiceNumber: orderId,
                invoiceDate: formatATSDate()
              }
            }))
          }
        ],
        taxDetails: [   // 🔥 FIX
          {
            taxType: "GST",
            taxRegistrationNumber: wh?.gst || "ABCDE1234F1Z5"
          }
        ]
      };
      if (data?.paymentMethod !== "prepaid") {
        payload.valueAddedServiceDetails = [
          {
            id: "CollectOnDelivery",
            amount: {
              unit: "INR",
              value: totalAmount
            }
          }
        ];
      }
      console.log("✅ FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
      return await this.signedRequest("POST", ATS_CREATE_SHIPMENT_FORWARD, payload);
    } catch (err) {
      console.error("❌ FULL ERROR:", err?.response?.data || err);
      return false;
    }
  }

  async cancelShipment({ amazon_shipment_id, awb })
  {
    try {
      const url = `${ATS_CANCEL_SHIPMENT_FORWARD}/${amazon_shipment_id}/cancel`;
      const payload = {
        reason: "Customer cancelled order",
        packages: [
          {
            trackingId: awb
          }
        ]
      };
      return await this.signedRequest("PUT", url, payload);
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