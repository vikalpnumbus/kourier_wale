import express from "express";
import { createRemittance, readAdminRemittance } from "../../controllers/admin/admin.remittance.controller.mjs";
const AdminRemittanceRouter = express.Router();

AdminRemittanceRouter.post("/", createRemittance);
AdminRemittanceRouter.get("/", readAdminRemittance);

export default AdminRemittanceRouter;
