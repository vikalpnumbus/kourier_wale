import express from "express";
import { update, userList } from "../../controllers/admin/admin.user.controller.mjs";
const AdminUserRouter = express.Router();

// ADMIN ROUTES
AdminUserRouter.patch("/:id", update);
AdminUserRouter.get("/list", userList);
AdminUserRouter.get("/list/:id", userList);

export default AdminUserRouter;
