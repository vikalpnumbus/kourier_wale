import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const WalletHistoryModel = sqlDB.sequelize.define(
  "wallet_history",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    payment_type: {
      type: DataTypes.ENUM("DEBIT", "CREDIT"),
      allowNull: false,
    },

    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logs: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "wallet_history",
  }
);

export default WalletHistoryModel;
