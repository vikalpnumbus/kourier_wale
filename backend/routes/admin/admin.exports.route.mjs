import express from "express";
import { create, read } from "../../controllers/admin/admin.exports.controller.mjs";
const AdminExportRouter = express.Router();

AdminExportRouter.post("/", create);
AdminExportRouter.get("/:id", read);
AdminExportRouter.get("/", read);

export default AdminExportRouter;
