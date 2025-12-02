import express from "express";
import TokenHandler from "../../middlewares/tokenHandler.mjs";
import {
  read,
} from "../../controllers/admin/admin.orders.controller.mjs";
const AdminOrdersRouter = express.Router();

AdminOrdersRouter.get("/", TokenHandler.authenticateToken, read);
AdminOrdersRouter.get("/:id", TokenHandler.authenticateToken, read);

export default AdminOrdersRouter;
