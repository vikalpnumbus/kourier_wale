import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";
import EscalationConversationsModel from "./escalationsConversations.sql.mode.mjs";

const EscalationModel = sqlDB.sequelize.define(
  "escalations",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    query: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    attachments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    awb_numbers: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:null,
      comment: "The user id of the assignee",
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
      comment: "The status of the escalation",
    },
  },
  {
    timestamps: true,
    tableName: "escalations",
    freezeTableName: true,
  }
);

export default EscalationModel;
