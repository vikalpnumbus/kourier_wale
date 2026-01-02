import { DataTypes } from "sequelize";
import sqlDB from "../configurations/sql.config.mjs";

const KycModel = sqlDB.sequelize.define(
  "KYC",
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
    
    kycType: {
      type: DataTypes.ENUM(
        "sole proprietorship",
        "partnership",
        "limited liability partnership",
        "public limited company",
        "private limited company"
      ),
      allowNull: false,
    },
    
    panCardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN regex
      },
    },
    
    nameOnPanCard: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    panCardImage: {
      type: DataTypes.JSON, // store array of strings
      defaultValue: [],
    },
    
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    documentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    nameOnDocument: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    documentFrontImage: {
      type: DataTypes.JSON, // store array of strings
      defaultValue: [],
    },

    documentBackImage: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    
    partnershipDeedImage: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    
    coiNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    gstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    gstImage: {
      type: DataTypes.JSON,
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

    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    timestamps: true,
    tableName: "kyc",
    hooks: {
      beforeCreate: (kyc) => {
        sanitizeKyc(kyc);
        kyc.status = "pending"; // default
      },
      beforeUpdate: async (kyc, options) => {
        sanitizeKyc(kyc);
        
        if (kyc._previousDataValues.status === "approved" && !kyc._adminOverride) {
          throw new Error("Approved KYC cannot be modified without override");
        }
        
        delete kyc.dataValues._adminOverride;
      },
    },
  }
);

function sanitizeKyc(doc) {
  if (doc.kycType) doc.kycType = doc.kycType.toLowerCase();
  if (doc.panCardNumber) doc.panCardNumber = doc.panCardNumber.toUpperCase();

  if (doc.nameOnPanCard) {
    doc.nameOnPanCard = doc.nameOnPanCard
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }

  if (doc.documentType) {
    doc.documentType = doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1).toLowerCase();
  }

  if (doc.nameOnDocument) {
    doc.nameOnDocument = doc.nameOnDocument
      .split(" ")
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
      .join(" ");
  }
}

export default KycModel;
