import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const ExportJobs = sqlDB.sequelize.define(
  "export_jobs",
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

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },

    filters: {
      type: DataTypes.JSON, // store array of strings
      allowNull: true,
      defaultValue: {},
    },

    format: {
      type: DataTypes.ENUM("csv"),
      allowNull: false,
      defaultValue: "csv",
    },

    file_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    processed_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "export_jobs",
  }
);

export default ExportJobs;
