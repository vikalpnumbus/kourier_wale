import express from "express";
import { adminUserHandling, update, userList } from "../../controllers/admin/admin.user.controller.mjs";
const AdminUserRouter = express.Router();

// ADMIN ROUTES
AdminUserRouter.patch("/:id", update);
AdminUserRouter.get("/list", userList);
AdminUserRouter.get("/list/:id", userList);
AdminUserRouter.post("/admin-user-handling", adminUserHandling);

export default AdminUserRouter;
