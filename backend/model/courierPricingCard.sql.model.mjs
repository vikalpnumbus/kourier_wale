import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const courierPricingCardModel = sqlDB.sequelize.define(
  "pricing_card_courier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    courier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zone1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zone2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zone3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zone4: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zone5: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cod: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cod_percentage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "pricing_card_courier",
  }
);

const CourierPricingCardModel = courierPricingCardModel;
export default CourierPricingCardModel;
