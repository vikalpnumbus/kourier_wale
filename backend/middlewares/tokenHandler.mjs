import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configurations/base.config.mjs";
import { decrypt, encrypt } from "../utils/encryptionDecryption.mjs";
import UserService from "../services/user.service.mjs";

class Class {
  generateToken(data) {
    return encrypt(jwt.sign(data, JWT_SECRET_KEY, { expiresIn: "3h" }));
  }

  async authenticateToken(req, res, next) {
    try {
      const authorizationHeaders = req?.headers?.authorization;
      const token = authorizationHeaders?.split(" ")[1];

      if (!token) {
        const error = new Error("Invalid or no token provided.");
        error.status = 400;
        throw error;
      }
      let data;
      try {
        data = jwt.verify(decrypt(token), JWT_SECRET_KEY);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          err.status = 401; // Unauthorized
          err.message = "Token has expired.";
        } else if (err.name === "JsonWebTokenError") {
          err.status = 401; // Unauthorized
          err.message = "Invalid token.";
        }
        throw err;
      }

      // console.log('data: ', data);
      const existingUser = await UserService.read({
        id: data.id,
      });

      // console.log('existingUser: ', existingUser);
      if (!existingUser) {
        const error = new Error("User does not exist.");
        error.status = 400;
        throw error;
      }
      // console.log("existingUser: ", existingUser);
      if (existingUser?.isActive !== true) {
        const error = new Error("User is forbidden from accessing this resource.");
        error.status = 401;
        throw error;
      }

      // console.info("req.originalUrl: ", req.originalUrl);
      // console.info("existingUser.role: ", existingUser.role);

      req.user = data;
      next();
    } catch (error) {
      console.error("error: ", error);
      next(error);
    }
  }
}

const TokenHandler = new Class();
export default TokenHandler;
