import TokenHandler from "../middlewares/tokenHandler.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import NotificationService from "./email.service.mjs";
import redisClient from "../configurations/redis.config.mjs";
import CourierService from "./courier.service.mjs";
import UserCourierService from "./userCourier.service.mjs";
import { Op } from "sequelize";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("user");
    this.otpRepository = FactoryRepository.getRepository("otp");
  }

  async save1(data) {
    try {
      const existingUser =
        (await this.repository.findOne({
          phone: data.phone,
        })) ||
        (await this.repository.findOne({
          email: data.email,
        }));

      if (existingUser) {
        const error = new Error(
          "User with this email or phone number already exists."
        );
        error.status = 422;
        throw error;
      }
      await this.otpRepository.deleteMany({
        "user.email": data.email,
        "user.phone": data.phone,
      });

      const otpData = await this.otpRepository.save({
        phone: data.phone,
        phone_otp: Math.floor(100000 + Math.random() * 900000).toString(),
        email: data.email,
        email_otp: Math.floor(100000 + Math.random() * 900000).toString(),
        user: {
          ...data,
          password: await bcrypt.hash(data.password, await bcrypt.genSalt(10)),
          companyDetails: {
            companyName: data.companyName,
            companyAddress: data.companyAddress,
            companyCity: data.companyCity,
            companyState: data.companyState,
            companyPincode: data.companyPincode,
          },
        },
      });

      await NotificationService.sendEmail({ otpData });
      return {
        status: 201,
        data: {
          message: `OTP sent to ${data.phone} and ${data.email} successfully.`,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async save2(data) {
    try {
      const { type, to, otp } = data;
      let query = {};
      if (type == "phone") query = { phone: to };
      if (type == "email") query = { email: to };

      let otpInstance = await this.otpRepository.findOne(query);

      if (!otpInstance) {
        const error = new Error("Invalid OTP");
        error.status = 400;
        throw error;
      }

      //const user = JSON.parse(JSON.stringify(otpInstance.user));

      const user =
        typeof otpInstance.user === "string"
          ? JSON.parse(otpInstance.user)
          : otpInstance.user;

      if (type == "email") {
        user.isEmailVerified = true;
      }
      if (type == "phone") user.isPhoneVerified = true;

      otpInstance = { ...otpInstance, user };

      if (
        otpInstance?.user?.isEmailVerified &&
        otpInstance?.user?.isPhoneVerified
      ) {
        const newUser = await this.repository.save({
          ...JSON.parse(JSON.stringify(otpInstance.user)),
          fname:
            otpInstance.user.fname?.[0].toUpperCase() +
            otpInstance.user.fname?.slice(1).toLowerCase(),
          lname:
            otpInstance.user.lname?.[0].toUpperCase() +
            otpInstance.user.lname?.slice(1).toLowerCase(),
        });

        await this.otpRepository.deleteMany({
          phone: otpInstance?.user?.phone,
          email: otpInstance?.user?.email,
        });

        if (!newUser.id) {
          return {
            status: 500,
            data: {
              message:
                "User verified successfullly. Account created. Please login",
            },
          };
        }

        // Assign Default Couriers to the user.
        const courierList = (await CourierService.repository.find())
          ?.map((e) => {
            const { id, status, show_to_users } = e.dataValues;
            if (status == "1" && show_to_users == "1") return id;
            return null;
          })
          .filter(Boolean);

        if (courierList && courierList.length > 0) {
          await UserCourierService.create({
            data: {
              userId: newUser.id,
              assigned_courier_ids: courierList.join(", "),
            },
          });
        }

        // Generate Token

        const token = TokenHandler.generateToken({
          id: newUser?.id,
        });
        const authCode = crypto.randomBytes(32).toString("hex");
        const hashedAuthCode = crypto
          .createHash("sha256")
          .update(authCode)
          .digest("hex");

        await redisClient.redis.set(
          `authCode:${hashedAuthCode}`,
          token,
          "EX",
          600
        );

        return {
          status: 200,
          data: {
            message: "User verified successfullly. Account created.",
            authCode,
          },
        };
      } else {
        await this.otpRepository.findOneAndUpdate(
          { phone: otpInstance.phone },
          { ...otpInstance, user }
        );

        return {
          status: 200,
          data: {
            message:
              type == "email"
                ? `Email verified successfully.`
                : `Phone verified successfully.`,
          },
        };
      }
    } catch (error) {
      this.error = error;
      console.error(error);
      return false;
    }
  }

  async resendOTP(data) {
    try {
      const { type, to } = data;

      let query = {};
      if (type == "phone") query = { "phone.to": to };
      if (type == "email") query = { "email.to": to };

      const otpInstance = await this.otpRepository.findOne(query);
      if (!otpInstance) {
        const error = new Error("Invalid details");
        error.status = 400;
        throw error;
      }

      if (type == "phone")
        query = {
          phone: {
            to,
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
          },
        };
      if (type == "email")
        query = {
          email: {
            to,
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
          },
        };

      const updatedOtpInstance = await this.otpRepository.findOneAndUpdate(
        {
          id: otpInstance.id,
        },
        query
      );

      await NotificationService.sendEmail({ updatedOtpInstance });
      return {
        status: 201,
        data: {
          message: `OTP sent to ${to} successfully.`,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async login(data) {
    try {
      const { phone, password } = data;
      const existingUser = await this.repository.findOne({
        phone,
      });
      if (!existingUser) {
        const error = new Error("Invalid Credentials.");
        error.status = 400;
        throw error;
      }
      const isCompare = await bcrypt.compare(password, existingUser.password);
      if (!isCompare) {
        const error = new Error("Invalid Credentials.");
        error.status = 400;
        throw error;
      }
      const token = TokenHandler.generateToken({
        id: existingUser.id,
        role: existingUser.role,
      });

      const authCode = crypto.randomBytes(32).toString("hex");
      const hashedAuthCode = crypto
        .createHash("sha256")
        .update(authCode)
        .digest("hex");

      await redisClient.redis.set(
        `authCode:${hashedAuthCode}`,
        token,
        "EX",
        600
      );

      return {
        data: {
          authCode,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async forgotPassword(req) {
    const { body: data, baseUrl, host } = req;
    try {
      const existingUser = await this.repository.findOne({
        phone: data.phone,
      });

      if (!existingUser) {
        const error = new Error("User does not exist.");
        error.status = 404;
        throw error;
      }
      const rawToken = crypto.randomBytes(32).toString("hex");
      existingUser.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      await this.repository.findOneAndUpdate(existingUser.id, existingUser);

      const resetLink =
        req.protocol + "://" + "<frontend_url>" + "/reset-password/" + rawToken;

      // http://localhost:3001/api/v1/users/reset-password/359ed5a0fe214b10b5aac129da98ec453b7049de9c70a50315a1942d3b18976e

      await NotificationService.sendEmail(resetLink);
      return resetLink;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async resetPassword(params, data) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(params?.token)
        .digest("hex");
      const existingUser = await this.repository.findOneAndUpdate(
        {
          resetPasswordToken: hashedToken,
        },
        {
          password: await bcrypt.hash(data.password, await bcrypt.genSalt(10)),
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      );

      if (!existingUser) {
        const error = new Error("User does not exist or invalid url.");
        error.status = 404;
        throw error;
      }

      const token = TokenHandler.generateToken({ _id: existingUser._id });

      return { token };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async handleTokenCallback(data) {
    try {
      const hashedAuthCode = crypto
        .createHash("sha256")
        .update(data.authCode)
        .digest("hex");

      const result = await redisClient.redis.get(`authCode:${hashedAuthCode}`);

      if (!result) {
        const error = new Error("Invalid auth code.");
        error.status = 404;
        throw error;
      }

      await redisClient.redis.del(`authCode:${hashedAuthCode}`);

      return result;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      let existingUser;
      if (
        params.id &&
        typeof params.id == "object" &&
        Array.isArray(params.id)
      ) {
        existingUser = await this.repository.find(params);
      } else existingUser = await this.repository.findOne(params);
      if (!existingUser) {
        const error = new Error("User does not exists.");
        error.status = 422;
        throw error;
      }

      return existingUser;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update(params, data) {
    try {
      const payload = {};

      if (data.wallet_balance) {
        payload.wallet_balance = data.wallet_balance;
      }

      if (data.label_settings) {
        payload.label_settings = data.label_settings;
      }

      const existingUser = await this.repository.findOneAndUpdate(
        {
          ...params,
        },
        payload
      );

      if (!existingUser) {
        const error = new Error("User does not exist.");
        error.status = 404;
        throw error;
      }

      // const token = TokenHandler.generateToken({ _id: existingUser._id });
      return { ...existingUser };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async readList(params) {
    const { page = 1, limit = 50, id } = params;

    const whereClause = { [Op.and]: [] };
    if (id) whereClause[Op.and].push({ id });

    if (!whereClause[Op.and].length) delete whereClause[Op.and];

    let result;
    let totalCount;

    if (id) {
      result = await this.repository.find(whereClause);
      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }
      totalCount = result.length;
    } else {
      result = await this.repository.find(whereClause, { page, limit });
      totalCount = await this.repository.countDocuments(whereClause);

      if (!result || result.length === 0) {
        result = [];
      }
    }
    const userData = result?.map((e) => {
      const modifiedUserData = {
        id: e.id,
        fname: e.fname,
        lname: e.lname,
        email: e.email,
        isVerified: e.isVerified,
        isPhoneVerified: e.isPhoneVerified,
        isEmailVerified: e.isEmailVerified,
        pricingPlanId: e.pricingPlanId,

        token: TokenHandler.generateToken({
          id: e.id,
          role: e.role,
        }),
      };

      return modifiedUserData;
    });

    result = userData;

    return { data: { total: totalCount, result } };
  }
}

const UserService = new Service();
export default UserService;
