import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const usercourierModel = sqlDB.sequelize.define(
  "user_courier",
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

    assigned_courier_ids: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_courier",
  }
);

const UserCourierModel = usercourierModel;
export default UserCourierModel;
