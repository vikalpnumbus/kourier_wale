import express from "express";
import { update, read } from "../../controllers/admin/admin.remittance.controller.mjs";
const AdminRemittanceRouter = express.Router();

AdminRemittanceRouter.get("/", read);
AdminRemittanceRouter.patch('/:id', update)

export default AdminRemittanceRouter;
