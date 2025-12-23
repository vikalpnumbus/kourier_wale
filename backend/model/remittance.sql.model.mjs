import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const RemittanceModel = sqlDB.sequelize.define(
  "remittance",
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

    awb_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "remittance_batch", key: "id" },
    },
  },
  {
    timestamps: true,
    tableName: "remittance",
  }
);

export default RemittanceModel;
