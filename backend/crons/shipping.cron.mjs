import cron from "node-cron";
import ShippingService from "../services/shipping.service.mjs";
import UserService from "../services/user.service.mjs";
import ShippingProducer from "../queue/producers/shipping.producer.mjs";

import pLimit from "p-limit";
import RemittanceService from "../services/admin/admin.remmitance.service.mjs";
const limit = pLimit(10);

/**
 * Run this cron every minute to check wallet balance and re-try shipping.
 */

export const shippingCron = cron.schedule("* * * * *", async () => {
  try {
    console.info("⏰ Cron job running every minute:", new Date().toLocaleString());

    const shipments = (
      await ShippingService.read({
        shipping_error: "Wallet balance is low",
        shipping_status: "new",
      })
    )?.data?.result;

    const userData = {};

    const uniqueUserIds = [...new Set(shipments.map((shipment) => shipment.userId))];

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

export const remittanceCron = cron.schedule("* * * * *", async () => {
  try {
    console.info("⏰ Remittance Cron job running every minute:", new Date().toLocaleString());

    await RemittanceService.calculateRemittance();
  } catch (error) {
    console.error(error);
  }
});

