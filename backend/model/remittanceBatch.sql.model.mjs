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

    remittance_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
  },
  {
    timestamps: true,
    tableName: "remittance_batch",
  }
);

export default RemittanceBatchModel;
