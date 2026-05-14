import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";
const ShipmentTrackingModel = sqlDB.sequelize.define(
  "shipment_tracking",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    shipment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    awb_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "shipment_tracking",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["awb_number", "status", "datetime"], // 🔥 duplicate avoid
      },
      {
        fields: ["awb_number"], // 🔍 fast tracking lookup
      },
      {
        fields: ["shipment_id"], // 🔍 join with shipping
      },
      {
        fields: ["status"], // 🔍 filter by status
      },
      {
        fields: ["datetime"], // 🔍 sorting timeline
      },
    ],
  }
);

export default ShipmentTrackingModel;