import express from "express";
import UserRouter from "./user.route.mjs";
import CompanyDetailsRouter from "./companyDetails.router.mjs";
import KYCRouter from "./kyc.route.mjs";
import PincodeRouter from "./pincode.route.mjs";
import BankDetailsRouter from "./bankDetails.router.mjs";
import ProductsRouter from "./products.router.mjs";
import WarehouseRouter from "./warehouse.router.mjs";
import OrdersRouter from "./orders.router.mjs";
import ImageRouter from "./image.route.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import CourierRouter from "./courier.router.mjs";
import PricingPlansRouter from "./pricingPlans.router.mjs";
import PricingCardRouter from "./pricingCard.router.mjs";
import UserCourierRouter from "./userCourier.router.mjs";
import CourierPricingCardRouter from "./courierPricingCard.router.mjs";
import ServiceablePincodesRouter from "../controllers/serviceablePincodes.router.mjs";
import ShippingRouter from "./shipping.router.mjs";
import CourierAWBListRouter from "./courierAWBList.router.mjs";
import LabelSettingsRouter from "./labelSettings.router.mjs";
import ChannelRouter from "./channel.router.mjs";
import PaymentRouter from "./payment.router.mjs";
import AdminUserRouter from "./admin/admin.user.router.mjs";
import AdminKYCRouter from "./admin/admin.kyc.route.mjs";
import WebhookRouter from "./webhook.router.mjs";
import EscalationRouter from "./escalation.router.mjs";

const globalRouter = express.Router();

globalRouter.use("/users", UserRouter);
globalRouter.use("/kyc", KYCRouter);
globalRouter.use("/company-details", CompanyDetailsRouter);
globalRouter.use("/pincode", PincodeRouter);
globalRouter.use("/bank-details", BankDetailsRouter);
globalRouter.use("/products", ProductsRouter);
globalRouter.use("/orders", OrdersRouter);
globalRouter.use("/warehouse", WarehouseRouter);
globalRouter.use("/courier", CourierRouter);
globalRouter.use("/pricing-plans", PricingPlansRouter);
globalRouter.use("/pricing-card", PricingCardRouter);
globalRouter.use("/pricing-card-courier", CourierPricingCardRouter);
globalRouter.use("/user-courier", UserCourierRouter);
globalRouter.use("/serviceable-pincodes", ServiceablePincodesRouter);
globalRouter.use("/shipping", ShippingRouter);
globalRouter.use("/label-settings", LabelSettingsRouter);
globalRouter.use("/channel", ChannelRouter);
globalRouter.use("/payments", PaymentRouter);
globalRouter.use("/webhooks", WebhookRouter);
globalRouter.use("/escalations", EscalationRouter);

// Admin Routes
globalRouter.use("/admin/courier-awb-list", CourierAWBListRouter);
globalRouter.use("/admin/users", AdminUserRouter);
globalRouter.use("/admin/kyc", AdminKYCRouter);

globalRouter.use("/uploads", ImageRouter);
globalRouter.get(
  "/exports",
  TokenHandler.authenticateToken,
  async (req, res) => {
    const csvRepository = FactoryRepository.getRepository("csvLogs");

    const list = await csvRepository.findOne({ userId: req.user.id });
    if (!list) {
      return res.status(400).json({
        status: 400,
        message: "No record found.",
      });
    }
    res.status(200).json({
      status: 200,
      data: list,
    });
  }
);

export default globalRouter;
