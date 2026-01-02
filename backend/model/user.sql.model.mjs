import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const UserModel = sqlDB.sequelize.define(
  "User",
  {
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    lname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [8] },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyPincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyLogo: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    shippingVolume: {
      type: DataTypes.ENUM("0-100", "100-1000", "1000 or above"),
      allowNull: false,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },

    pricingPlanId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    wallet_balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    credit_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    label_settings: {
      type: DataTypes.JSON,
      defaultValue: {
        paper_size: "thermal",
      },
    },

    seller_remit_cycle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "7",
    },
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

export default UserModel;
