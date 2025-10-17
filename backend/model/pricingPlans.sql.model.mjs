import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const pricingPlansModel = sqlDB.sequelize.define(
  "pricing_plans",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "pricing_plans",
  }
);

const PricingPlansModel = pricingPlansModel;
export default PricingPlansModel;
