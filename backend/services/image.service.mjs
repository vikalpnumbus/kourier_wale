import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";

class ServiceClass {
  async processImage({ image, dir = "", width, height, imageName }) {

    try {
      if (!image?.buffer) throw new Error("No image buffer provided.");

      // Constants
      const fileExtension = "webp";
      const uniqueHash = crypto.randomBytes(16).toString("hex");
      const safeName = imageName ? imageName + "-" : "";
      const fileName = `${safeName}${uniqueHash}`;

      // Paths
      const uploadPath = path.join("uploads", dir);
      fs.mkdirSync(uploadPath, { recursive: true });

      const sizes = [
        // { suffix: "480", width: 480 },
        // { suffix: "768", width: 768 },
        { suffix: "1024", width: 1024 },
        // { suffix: "1440", width: 1440 },
      ];

      const saveImage = async (buffer, filePath, resizeOptions) => {
        // When you send data via RabbitMQ, JSON serialization turns a Node Buffer into { type: 'Buffer', data: [...] }.
        // When you consume it, you have to manually turn it back into a real Buffer with Buffer.from(data).

        const realBuffer = Buffer.isBuffer(buffer)
          ? buffer
          : Buffer.from(buffer.data);

        await sharp(realBuffer)
          .resize(resizeOptions)
          .toFormat(fileExtension)
          .toFile(filePath);
      };

      if (width || height) {
        // Resize to specific dimensions
        const outputPath = path.join(
          uploadPath,
          fileName + "." + fileExtension
        );

        await saveImage(image.buffer, outputPath, {
          width: width ? Math.min(width, 1080) : undefined,
          height: height ? Math.min(height, 1080) : undefined,
        });
        return {
          fieldname: image.fieldname || null,
          path: `/uploads/${dir}/${fileName + "." + fileExtension}`,
        };
      } else {
        // Generate multiple sizes
        const filePaths = await Promise.all(
          sizes.map(async ({ suffix, width }) => {
            const resizedName = `${fileName}-${suffix}.${fileExtension}`;
            const resizedPath = path.join(uploadPath, resizedName);
            await saveImage(
              Buffer.isBuffer(image.buffer)
                ? image.buffer
                : Buffer.from(image.buffer),
              resizedPath,
              { width }
            );
            return `/uploads/${dir}/${resizedName}`;
          })
        );

        return {
          fieldname: image.fieldname || null,
          path: filePaths, // return array of generated paths
        };
      }
    } catch (error) {
      console.error("Image processing failed:", error);
      return null;
    }
  }

  view({ folder, filename }) {
    try {
      const filePath = path.join("uploads", folder, filename);

      if (!fs.existsSync(filePath)) {
        const error = new Error("File not found");
        error.status = 404;
        throw error;
      }

      return path.resolve(filePath);
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const ImageService = new ServiceClass();
export default ImageService;
