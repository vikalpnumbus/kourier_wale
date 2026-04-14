import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const OrderStatusLog = sqlDB.sequelize.define(
  "order_status_logs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    awb_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    courier_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ship_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    raw_payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "order_status_logs",
    timestamps: true,
  }
);

export default OrderStatusLog;