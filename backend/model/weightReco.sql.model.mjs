import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const WeightRecoModel = sqlDB.sequelize.define(
  "weight_reco",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    weight_applied_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    awb_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    dead_weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    length: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    breadth: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    height: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    charged_slab: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    volumetric_weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    applied_slab: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    forward: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    charged_to_wallet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    courier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "weight_reco",
  }
);

export default WeightRecoModel;
