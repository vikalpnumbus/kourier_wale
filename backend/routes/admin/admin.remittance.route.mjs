import express from "express";
import { read } from "../../controllers/admin/admin.remittance.controller.mjs";
const AdminRemittanceRouter = express.Router();

AdminRemittanceRouter.get("/", read);

export default AdminRemittanceRouter;
