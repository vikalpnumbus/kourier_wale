import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const ServiceablePincodeModel = sqlDB.sequelize.define(
  "ServiceablePincode",
  {
    pincode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: { notEmpty: true },
    },
    courier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },

    state: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },

    state_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },

    cod: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: false,
    },

    prepaid: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: false,
    },

    pickup: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: false,
    },

    is_reverse_pickup: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "serviceable_pincodes",
  }
);

export default ServiceablePincodeModel;
