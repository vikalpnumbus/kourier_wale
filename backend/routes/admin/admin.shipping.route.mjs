import express from "express";
import TokenHandler from "../../middlewares/tokenHandler.mjs";
import {
  read,
} from "../../controllers/admin/admin.shipping.controller.mjs";
const AdminShippingRouter = express.Router();

AdminShippingRouter.get("/", TokenHandler.authenticateToken, read);
AdminShippingRouter.get("/:id", TokenHandler.authenticateToken, read);

export default AdminShippingRouter;
