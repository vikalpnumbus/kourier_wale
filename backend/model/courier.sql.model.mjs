import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const courierModel = sqlDB.sequelize.define(
  "courier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      allowNull: false,
      type: DataTypes.ENUM("0", "1"),
      default: 0,
    },

    show_to_users: {
      allowNull: false,
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
    },
    volumetric_divisor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    additional_weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    courier_type: {
      type: DataTypes.STRING,
      defaultValue: "ecom",
    },
  },
  {
    timestamps: true,
    tableName: "courier",
  }
);

const CourierModel = courierModel;
export default CourierModel;
