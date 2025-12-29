import express from "express";
import { readSellerRemittance } from "../controllers/remittance.controller.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
const RemittanceRouter = express.Router();

RemittanceRouter.get("/seller", TokenHandler.authenticateToken, readSellerRemittance);

export default RemittanceRouter;
