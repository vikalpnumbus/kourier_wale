import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const ProductsModel = sqlDB.sequelize.define(
  "Products",
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

    category: {
      type: DataTypes.ENUM(
        "appliances",
        "mobile",
        "electronics",
        "fashion",
        "home_and_kitchen",
        "grocery",
        "books",
        "beauty",
        "sports",
        "automotive",
        "toys",
        "furniture",
        "baby",
        "computers",
        "other"
      ),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    productImage: {
      type: DataTypes.JSON, // array of strings
      defaultValue: [],
    },

    channel_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    channel_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "products",
    hooks: {
      beforeCreate: (product) => {
        sanitizeDoc(product);
      },
      beforeUpdate: (product) => {
        sanitizeDoc(product);
      },
    },
  }
);

function sanitizeDoc(doc) {
  for (const key in doc) {
    if (typeof doc[key] === "string") {
      doc[key] = doc[key].trim();
    }
  }

  if (doc.name) {
    doc.name = doc.name
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }
}

export default ProductsModel;
