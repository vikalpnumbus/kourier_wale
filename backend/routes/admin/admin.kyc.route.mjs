import express from "express";
import validate from "../../middlewares/validator.mjs";
import { verify } from "../../controllers/admin/admin.kyc.controller.mjs";
import KYCValidations from "../../validators/admin/admin.kyc.validator.mjs";
const AdminKYCRouter = express.Router();

AdminKYCRouter.post(
  "/verify",
  validate(KYCValidations.verify()),
  verify
);

export default AdminKYCRouter;
