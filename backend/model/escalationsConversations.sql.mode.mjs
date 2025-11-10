import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";
import EscalationModel from "./escalation.sql.model.mjs";

const EscalationConversationsModel = sqlDB.sequelize.define(
  "escalations_conversations",
  {
    escalation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    attachments: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    tableName: "escalations_conversations",
    freezeTableName: true,
  }
);

export default EscalationConversationsModel;
