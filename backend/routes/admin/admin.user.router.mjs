import express from "express";
import { userList } from "../../controllers/admin/admin.user.controller.mjs";
import TokenHandler from "../../middlewares/tokenHandler.mjs";
const AdminUserRouter = express.Router();

// ADMIN ROUTES
AdminUserRouter.get("/list", TokenHandler.authenticateToken, userList);
AdminUserRouter.get("/list/:id", TokenHandler.authenticateToken, userList);

export default AdminUserRouter;
