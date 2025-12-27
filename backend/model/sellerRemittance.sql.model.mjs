import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const RemittanceSellerModel = sqlDB.sequelize.define(
  "remittance_seller",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },

    remittance_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    remittance_status: {
      type: DataTypes.ENUM("pending", "paid"),
      allowNull: false,
      defaultValue: "pending",
    },

    awb_numbers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    utr_uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },

    utr_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    remittance_paid_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "remittance_seller",
  }
);

export default RemittanceSellerModel;
