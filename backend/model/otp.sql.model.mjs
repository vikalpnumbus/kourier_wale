import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const OTPModel = sqlDB.sequelize.define(
  "OTP",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone_otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email_otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    user: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 4 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    tableName: "otps",
  }
);

export default OTPModel;
