import express from "express";
import { read } from "../controllers/pincode.controller.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
const PincodeRouter = express.Router();

PincodeRouter.get("/:pincode", TokenHandler.authenticateToken, read);

export default PincodeRouter;
