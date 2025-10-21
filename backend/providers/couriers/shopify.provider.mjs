import axios from "axios";

class Provider {
  constructor() {
    this.error = null;
  }

  async fetchShopifyOrders({ shopDomain, accessToken, status = "any" }) {
    try {
      const url = `https://${shopDomain}/admin/api/2025-01/orders.json?status=${status}`;
      const res = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      return res.data.orders;
    } catch (error) {
      console.error("Error: ", error);
      return false;
    }
  }

  async fulfillOrder(shopDomain, accessToken, orderId) {
    try {
      const url = `https://${shopDomain}/admin/api/2025-01/orders/${orderId}/fulfillments.json`;

      const payload = {
        fulfillment: {
          message: "Order Shipped with {courier_id}",
          notify_customer: false,
          tracking_info: {
            number: "9999999999",
            url: "https://www.google.com",
            company: "courier_name",
          },
        },
      };

      const res = await axios.post(url, payload, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      console.error("error: ", error.response);
      return false;
    }
  }

  async cancelOrder(shopDomain, accessToken, orderId) {
    const url = `https://${shopDomain}/admin/api/2025-01/orders/${orderId}/cancel.json`;

    const res = await axios.post(
      url,
      {},
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  }
}

const ShopifyProvider = new Provider();
export default ShopifyProvider;
