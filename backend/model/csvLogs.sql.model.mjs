import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const CSVModel = sqlDB.sequelize.define(
  "csvLogs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "csvLogs",
  }
);

export default CSVModel;
