import express from "express";
import TokenHandler from "../middlewares/tokenHandler.mjs";
import ImageService from "../services/image.service.mjs";

const ImageRouter = express.Router();
ImageRouter.get(
  "/:folder/:filename",
  // TokenHandler.authenticateToken,
  (req, res, next) => {
    try {
      const { folder, filename } = req.params;

      const filePath = ImageService.view({ folder, filename });
      if (!filePath) {
        throw ImageService.error;
      }

      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
);

export default ImageRouter;
