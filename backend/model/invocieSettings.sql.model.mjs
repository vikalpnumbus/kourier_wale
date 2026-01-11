import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const InvoiceSettingsModel = sqlDB.sequelize.define(
  "invoice_setting",
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
    hide_company_name: {
      type: DataTypes.BOOLEAN,
    },
    hide_company_address: {
      type: DataTypes.BOOLEAN,
    },
    invoice_prefix: {
      type: DataTypes.STRING(10),
    },
    invoice_banner: {
      type: DataTypes.STRING,
    },
    invoice_signature: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

export default InvoiceSettingsModel;
