import express from "express";
import { userList } from "../../controllers/admin/admin.user.controller.mjs";
const AdminUserRouter = express.Router();

// ADMIN ROUTES
AdminUserRouter.get("/list", userList);
AdminUserRouter.get("/list/:id", userList);

export default AdminUserRouter;
