import express from "express";
import validate from "../../middlewares/validator.mjs";
import {
  conversation_create,
  conversation_read,
  create,
  read,
  update,
} from "../../controllers/admin/admin.escalation.controller.mjs";
import upload from "../../middlewares/multer.mjs";
import ImageValidator from "../../validators/image.validator.mjs";
import EscalationValidations from "../../validators/escalation.validator.mjs";
const AdminEscalationRouter = express.Router();

AdminEscalationRouter.post(
  "/",
  upload.any(),
  ImageValidator.validate,
  validate(EscalationValidations.create()),
  create
);
AdminEscalationRouter.post("/conversations", upload.any(), conversation_create);
AdminEscalationRouter.get("/conversations", conversation_read);
AdminEscalationRouter.get("/conversations/:id", conversation_read);

AdminEscalationRouter.get("/", read);
AdminEscalationRouter.get("/:id", read);

AdminEscalationRouter.put("/:id", update);

export default AdminEscalationRouter;
