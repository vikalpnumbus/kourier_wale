import express from "express";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import { create, read, update, generate } from "../controllers/invoiceSettings.controller.mjs";
const InvoiceSettingsRouter = express.Router();

InvoiceSettingsRouter.post("/", TokenHandler.authenticateToken, create);
InvoiceSettingsRouter.get("/", TokenHandler.authenticateToken, read);
InvoiceSettingsRouter.patch("/", TokenHandler.authenticateToken, update);
InvoiceSettingsRouter.post("/generate", TokenHandler.authenticateToken, generate);

export default InvoiceSettingsRouter;
