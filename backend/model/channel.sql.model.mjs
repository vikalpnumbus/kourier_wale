import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const ChannelModel = sqlDB.sequelize.define(
  "channel",
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

    channel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    channel_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    channel_host: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    api_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    api_secret: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "channel",
  }
);

export default ChannelModel;
