import express from "express";
import { createRemittance, readAdminRemittance, readSellerRemittance } from "../../controllers/admin/admin.remittance.controller.mjs";
const AdminRemittanceRouter = express.Router();

AdminRemittanceRouter.post("/", createRemittance);
AdminRemittanceRouter.get("/admin", readAdminRemittance);
AdminRemittanceRouter.get("/seller", readSellerRemittance);

export default AdminRemittanceRouter;
