import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const RemittanceBatchModel = sqlDB.sequelize.define(
  "remittance_batch",
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

    hold_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    recieved_from_courier: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    remittance_status: {
      type: DataTypes.ENUM("pending", "paid", "hold"),
      allowNull: false,
      defaultValue: "pending",
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    awb_numbers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "remittance_batch",
  }
);

export default RemittanceBatchModel;
