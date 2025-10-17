import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const CourierAWBListModel = sqlDB.sequelize.define(
  "courier_awb_list",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    courier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    awb_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },

    mode: {
      type: DataTypes.ENUM("forward", "reverse"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "courier_awb_list",
  }
);

export default CourierAWBListModel;
