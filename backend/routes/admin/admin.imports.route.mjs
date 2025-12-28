import express from "express";
import { create, read } from "../../controllers/admin/admin.imports.controller.mjs";
import upload from "../../middlewares/multer.mjs";
import FileValidator from "../../validators/file.validator.mjs";
const AdminImportRouter = express.Router();

AdminImportRouter.post("/",upload.any(), FileValidator.validate, create);
AdminImportRouter.get("/:id", read);
AdminImportRouter.get("/", read);

export default AdminImportRouter;
