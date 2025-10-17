import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const WarehouseModel = sqlDB.sequelize.define(
  "Warehouse",
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    labelDetails: {
      type: DataTypes.JSON, // nested object
      defaultValue: {
        support_email: null,
        support_phone: null,
        hide_end_customer_contact_number: false,
        hide_warehouse_mobile_number: false,
        hide_warehouse_address: false,
        hide_product_details: false,
      },
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "warehouse",
    hooks: {
      beforeCreate: (warehouse) => {
        sanitizeDoc(warehouse);
      },
      beforeUpdate: (warehouse) => {
        sanitizeDoc(warehouse);
      },
    },
  }
);

function sanitizeDoc(doc) {
  const sanitizeString = (val) =>
    val
      ? val
          .trim()
          .split(" ")
          .map(
            (e) =>
              e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()
          )
          .join(" ")
      : val;

  if (doc.name) doc.name = sanitizeString(doc.name);
  if (doc.contactName) doc.contactName = sanitizeString(doc.contactName);

  if (doc.contactPhone) doc.contactPhone = doc.contactPhone.trim();
  if (doc.address) doc.address = doc.address.trim();
  if (doc.city) doc.city = doc.city?.trim() || null;
  if (doc.state) doc.state = doc.state?.trim() || null;
}

export default WarehouseModel;
