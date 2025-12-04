import cron from "node-cron";
import ShippingService from "../services/shipping.service.mjs";
import UserService from "../services/user.service.mjs";
import ShippingProducer from "../queue/producers/shipping.producer.mjs";

import pLimit from "p-limit";
const limit = pLimit(10);

/**
 * Run this cron every 5 minutes to check wallet balance and re-try shipping.
 */

const shippingCron = cron.schedule("* * * * *", async () => {
  
  try {
    console.info(
      "⏰ Cron job running every hour:",
      new Date().toLocaleString()
    );

    const shipments = (
      await ShippingService.read({
        shipping_error: "Wallet balance is low kndkndkdnkdn",
        shipping_status: "new",
      })
    )?.data?.result;

    const userData = {};

    const uniqueUserIds = [
      ...new Set(shipments.map((shipment) => shipment.userId)),
    ];

    const uniqueUsers = await UserService.read({ id: uniqueUserIds });

    if (!uniqueUsers) {
      throw new Error("Error fetching unique users.");
    }

    uniqueUsers.forEach((element) => (userData[element.id] = element));

    shipments.forEach((shipment) =>
      limit(async () => {
        const userId = shipment.userId;
        const wallet_balance = userData[userId].wallet_balance;

        if (wallet_balance >= shipment.total_price) {
          ShippingProducer.publishShipmentRetryData(shipment);
        }
      })
    );
  } catch (error) {
    console.error(error);
  }
});

export default shippingCron;
