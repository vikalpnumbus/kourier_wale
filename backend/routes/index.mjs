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
import WeightRecoRouter from "./weightReco.router.mjs";
import AdminEscalationRouter from "./admin/admin.escalation.router.mjs";
import UserService from "../services/user.service.mjs";
import AdminOrdersRouter from "./admin/admin.orders.route.mjs";
import AdminShippingRouter from "./admin/admin.shipping.route.mjs";
import AdminRemittanceRouter from "./admin/admin.remittance.route.mjs";
import AdminExportRouter from "./admin/admin.exports.route.mjs";
import AdminImportRouter from "./admin/admin.imports.route.mjs";
import RemittanceRouter from "./remittance.route.mjs";
import DashboardRouter from "./dashboard.route.mjs";
import InvoiceSettingsRouter from "./InvoiceSettings.router.mjs";

const globalRouter = express.Router();

globalRouter.use("/dashboard", DashboardRouter);
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
globalRouter.use("/invoice-settings", InvoiceSettingsRouter);
globalRouter.use("/channel", ChannelRouter);
globalRouter.use("/payments", PaymentRouter);
globalRouter.use("/webhooks", WebhookRouter);
globalRouter.use("/escalations", EscalationRouter);
globalRouter.use("/weight-reco", WeightRecoRouter);
globalRouter.use("/remittance", RemittanceRouter);

const checkIfUserIsAdmin = async (req, res, next) => {
  const userId = req.user.id;
  const user = await UserService.read({ id: userId });
  if (user && user.role === "admin") {
    next();
  } else {
    const error = new Error("Forbidden");
    error.status = 403;
    next(error);
  }
};
// Admin Routes
globalRouter.use(
  "/admin/courier-awb-list",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  CourierAWBListRouter
);
globalRouter.use(
  "/admin/users",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminUserRouter
);
globalRouter.use(
  "/admin/kyc",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminKYCRouter
);
globalRouter.use(
  "/admin/escalations",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminEscalationRouter
);
globalRouter.use(
  "/admin/orders",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminOrdersRouter
);
globalRouter.use(
  "/admin/shipping",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminShippingRouter
);
globalRouter.use(
  "/admin/remittance",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminRemittanceRouter
);
globalRouter.use(
  "/admin/exports",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminExportRouter
);
globalRouter.use(
  "/admin/imports",
  TokenHandler.authenticateToken,
  checkIfUserIsAdmin,
  AdminImportRouter
);

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
