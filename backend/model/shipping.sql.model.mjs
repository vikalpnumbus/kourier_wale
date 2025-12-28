// models/orders.sql.model.mjs
import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const ShippingModel = sqlDB.sequelize.define(
  "shipping",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },

    order_db_id: {
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
          const required = ["fname", "lname", "address", "city", "state", "phone", "pincode"];
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
          const required = ["weight", "length", "height", "breadth", "volumetricWeight"];
          for (let field of required) {
            if (!value[field]) {
              throw new Error(`Missing field ${field} in packageDetails`);
            }
          }
        },
      },
    },

    channel_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    channel_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Courier Package Details (nested → JSON)
    courierPackageDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        hasRequiredFields(value) {
          if (!value) return true;
          const required = ["courier_billed_weight", "courier_billed_length", "courier_billed_height", "courier_billed_breadth"];
          for (let field of required) {
            if (!value[field].toString()) {
              throw new Error(`Missing field ${field} in courierPackageDetails`);
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
      allowNull: false,
    },

    rto_warehouse_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    awb_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shipping_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amazon_shipment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shipment_error: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    courier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    freight_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    cod_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // total_price: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   allowNull: false,
    // },

    zone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    edd: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    delivered_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    remittance_status: {
      type: DataTypes.ENUM("pending", "paid", "hold"),
      allowNull: true,
    },

    remittance_batch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "remittance_batch", key: "id" },
    },
  },
  {
    timestamps: true,
    tableName: "shipping",
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

export default ShippingModel;
