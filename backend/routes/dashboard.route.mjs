import express from "express";
import { cityWiseStats, courierWiseStats, dashboardStats, paymentModeWiseStats } from "../controllers/dashboard.controller.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
const DashboardRouter = express.Router();

DashboardRouter.get("/stats", TokenHandler.authenticateToken, dashboardStats);
DashboardRouter.get("/stats/courier-wise", TokenHandler.authenticateToken, courierWiseStats);
DashboardRouter.get("/stats/payment-mode-wise", TokenHandler.authenticateToken, paymentModeWiseStats);
DashboardRouter.get("/stats/city-wise", TokenHandler.authenticateToken, cityWiseStats);

export default DashboardRouter;
