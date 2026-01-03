import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const AdminUserMapModel = sqlDB.sequelize.define(
  "AdminUserMap",
  {
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_user_map",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["adminId", "userId"],
      },
    ],
  }
);

export default AdminUserMapModel;
