import express from "express";
import ChannelValidations from "../validators/channel.validator.mjs";
import validate from "../middlewares/validator.mjs";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import {
  create,
  read,
  update,
  remove,
  fetch,
} from "../controllers/channel.controller.mjs";
const ChannelRouter = express.Router();

ChannelRouter.post(
  "/",
  TokenHandler.authenticateToken,
  validate(ChannelValidations.create()),
  create
);

ChannelRouter.patch(
  "/:id",
  TokenHandler.authenticateToken,
  validate(ChannelValidations.update()),
  update
);

ChannelRouter.get("/", TokenHandler.authenticateToken, read);
ChannelRouter.get("/:id", TokenHandler.authenticateToken, read);
ChannelRouter.delete("/:id", TokenHandler.authenticateToken, remove);

ChannelRouter.post(
  "/fetch",
  validate(ChannelValidations.fetch()),
  TokenHandler.authenticateToken,
  fetch
);

export default ChannelRouter;
