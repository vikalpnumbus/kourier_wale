// models/orders.sql.model.mjs
import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const OrdersModel = sqlDB.sequelize.define(
  "orders",
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

    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    collectableAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    order_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    paymentType: {
      type: DataTypes.ENUM("cod", "prepaid", "reverse"),
      allowNull: false,
    },

    products: {
      type: DataTypes.JSON, // array of JSON objects
      validate: {
        hasRequiredFields(value) {
          if (!Array.isArray(value)) {
            throw new Error("Products must be an array");
          }
          for (const product of value) {
            if (!product.id || !product.qty) {
              throw new Error(`Each product must have id and qty`);
            }
          }
        },
      },
    },
    // Shipping Details (nested → JSON)
    shippingDetails: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = [
            "fname",
            "lname",
            "address",
            "city",
            "state",
            "phone",
            "pincode",
          ];
          for (let field of required) {
            if (!value[field]) {
              throw new Error(`Missing field ${field} in shippingDetails`);
            }
          }
        },
      },
    },

    // Package Details (nested → JSON)
    packageDetails: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = [
            "weight",
            "length",
            "height",
            "breadth",
            "volumetricWeight",
          ];
          for (let field of required) {
            if (!value[field]) {
              throw new Error(`Missing field ${field} in packageDetails`);
            }
          }
        },
      },
    },

    charges: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = ["shipping", "cod", "tax_amount", "discount"];
          for (let field of required) {
            if (!value[field]) {
              throw new Error(`Missing field ${field} in charges`);
            }
          }
        },
      },
    },

    warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rto_warehouse_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shipping_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "new",
    },

    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    channel_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "orders",
    hooks: {
      beforeCreate: (order) => {
        sanitizeDoc(order);
      },
      beforeUpdate: (order) => {
        sanitizeDoc(order);
      },
    },
  }
);

function sanitizeDoc(doc) {
  // Trim & Capitalize shipping names
  if (doc.shippingDetails) {
    let ship = doc.shippingDetails;
    if (ship.fname) {
      ship.fname = capitalizeWords(ship.fname);
    }
    if (ship.lname) {
      ship.lname = capitalizeWords(ship.lname);
    }
  }

  // Trim order source
  if (doc.order_source) {
    doc.order_source = doc.order_source.trim();
  }
}

function capitalizeWords(str) {
  return str
    .split(" ")
    .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
    .join(" ");
}

export default OrdersModel;
