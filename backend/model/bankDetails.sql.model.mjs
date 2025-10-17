import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const BankDetailsModel = sqlDB.sequelize.define(
  "BankDetails",
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

    accountType: {
      type: DataTypes.ENUM("savings", "current", "salary", "other"),
      allowNull: false,
    },

    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [9, 18], // typical bank account length
      },
    },

    ifscCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Z]{4}0[A-Z0-9]{6}$/, // IFSC regex
      },
    },

    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bankBranch: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cancelledChequeImage: {
      type: DataTypes.JSON, // array of strings (URLs)
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "bank_details",
    hooks: {
      beforeCreate: (bank) => {
        sanitizeDoc(bank);
        bank.status = "pending"; // default
      },
      beforeUpdate: async (bank, options) => {
        sanitizeDoc(bank);

        if (
          bank._previousDataValues.status === "approved" &&
          !bank._adminOverride
        ) {
          throw new Error(
            "Approved Bank Details cannot be modified without override"
          );
        }

        delete bank.dataValues._adminOverride;
      },
    },
  }
);

function sanitizeDoc(doc) {
  if (doc.accountHolderName) {
    doc.accountHolderName = doc.accountHolderName
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }
  if (doc.bankName) {
    doc.bankName = doc.bankName
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }
  if (doc.branchName) {
    doc.branchName = doc.branchName
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }
  if (doc.ifscCode) {
    doc.ifscCode = doc.ifscCode.toUpperCase();
  }
}

export default BankDetailsModel;
