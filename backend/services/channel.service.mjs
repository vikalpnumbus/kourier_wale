import ShopifyProvider from "../providers/couriers/shopify.provider.mjs";
import OrdersProducer from "../queue/producers/orders.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import OrdersService from "./orders.service.mjs";
import ProductsService from "./products.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("channel");
  }

  async create({ data }) {
    try {
      const result = await this.repository.save(data);

      return {
        status: 201,
        data: {
          message: "Record has been created successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ data }) {
    try {
      const existingRecordId = data.id;

      delete data.id;

      let payload = { ...data };

      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        payload
      );

      return {
        status: 201,
        data: {
          message: "Record has been updated successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const { page = 1, limit = 50, id, userId, channel } = params;

      // Build where condition
      let where = {};

      if (id) {
        where.id = id;
      }

      if (userId) {
        where.userId = userId;
      }

      if (channel) {
        where.channel = channel;
      }

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(where);
        if (!result) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = result.length;
      } else {
        result = await this.repository.find(where, { page, limit });
        totalCount = await this.repository.countDocuments(where);

        if (!result || result.length === 0) {
          const error = new Error("No records found.");
          error.status = 404;
          throw error;
        }
      }

      return { data: { total: totalCount, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async remove(params) {
    try {
      const result = await this.repository.findOneAndDelete(params);

      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      return { data: { message: "Deleted successfully." } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async fetch(params) {
    try {
      const { channel, userId } = params;
      const channelsRes = await this.read({ userId, channel });
      const channels = channelsRes?.data?.result || null;
      if (!channels) {
        const error = new Error("No channel found.");
        error.status = 400;
        throw error;
      }
      if (channel == "shopify") {
        const result = await Promise.all(
          channels.map(async (curr) => {
            try {
              const orders = await ShopifyProvider.fetchShopifyOrders({
                shopDomain: curr.channel_host,
                accessToken: curr.access_token,
                // status: null,
              });

              return orders.map((o) => ({ ...o, channel_id: curr.id }));
            } catch (error) {
              return [];
            }
          })
        );

        const allOrders = result.flat();
        if (!allOrders.length) return { data: [] };

        const existingOrders =
          (
            await OrdersService.read({
              order_source: channel,
              channel_order_id: allOrders.map((o) => o.id),
            })
          )?.data?.result || [];

        const existingProducts =
          (await ProductsService.read({
            channel_name: channel,
            channel_product_ids: allOrders.flatMap((o) =>
              o.line_items.map((p) => p.id)
            ),
          })) || [];

        const productMap = new Map(
          existingProducts.map((p) => [p.channel_product_id, p])
        );

        const ordersPayload = (
          await Promise.all(
            allOrders.map(async (order) => {
              if (existingOrders.some((o) => o.channel_order_id == order.id)) {
                return null;
              }

              const products = await Promise.all(
                order.line_items.map(async (item) => {
                  let prod = productMap.get(item.id);
                  if (!prod) {
                    prod = await ProductsService.create({
                      data: {
                        userId,
                        category: "other",
                        name: item.name,
                        sku: item.sku || "",
                        price: item.price,
                        channel_name: channel,
                        channel_product_id: item.id,
                      },
                    });
                    prod = prod?.data;
                    productMap.set(item.id, prod);
                  }
                  return { id: prod?.id, qty: item.quantity };
                })
              );

              return {
                userId,
                orderId: `Shopify-${order.id}`,
                channel_order_id: order.id,
                channel_id: order.channel_id,
                orderAmount: order.total_price,
                collectableAmount: order.total_price,
                order_source: "shopify",
                paymentType: (() => {
                  const gateways = order.payment_gateway_names || [];
                  const status = order.financial_status?.toLowerCase() || "";
                  const hasRefund =
                    Array.isArray(order.refunds) && order.refunds.length > 0;
                  if (hasRefund) return "reverse";
                  if (
                    gateways.some((g) => g.toLowerCase().includes("cash")) ||
                    status === "pending"
                  )
                    return "cod";
                  if (status === "paid") return "prepaid";
                  return "Unknown";
                })(),
                products,
                shippingDetails: order.customer?.default_address
                  ? {
                      fname: order.customer.first_name,
                      lname: order.customer.last_name,
                      address: order.customer.default_address.address1,
                      city: order.customer.default_address.city,
                      state: order.customer.default_address.province,
                      phone:
                        order.customer.default_address.phone
                          ?.split(" ")
                          .slice(1)
                          .join("") || " ",
                      pincode: order.customer.default_address.zip,
                    }
                  : {
                      fname: "0",
                      lname: "0",
                      address: "0",
                      city: "0",
                      state: "0",
                      phone: "0",
                      pincode: "000000",
                    },
                packageDetails: {
                  weight: "0",
                  length: "0",
                  height: "0",
                  breadth: "0",
                  volumetricWeight: "0",
                },
                charges: {
                  shipping: "0",
                  cod: "0",
                  tax_amount: "0",
                  discount: "0",
                },
                warehouse_id: null,
                rto_warehouse_id: null,
                shipping_status:
                  order.cancel_reason && order.cancelled_at
                    ? "cancelled"
                    : order.fulfillment_status == null
                    ? "new"
                    : order.fulfillment_status,
              };
            })
          )
        )?.filter(Boolean);
        await OrdersProducer.publishCreateOrder(ordersPayload);
      }

      return {
        data: {
          message:
            "Fetching your orders from the request channel. Remember, only new orders will be fetched.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const ChannelService = new Service();
export default ChannelService;
