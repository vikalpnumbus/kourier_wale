import {
  MYSQL_DATABASE_NAME,
  MYSQL_HOST,
  MYSQL_PASSWORD,
  MYSQL_PORT,
  MYSQL_USERNAME,
} from "./base.config.mjs";
import { Sequelize } from "sequelize";

class Class {
  constructor() {
    this.sequelize = new Sequelize(
      MYSQL_DATABASE_NAME,
      MYSQL_USERNAME,
      MYSQL_PASSWORD,
      {
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        dialect: "mysql",
        logging: false,
        pool: {
          max: 100,
          min: 2,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }
  async connect(attempt = 1) {
    if (attempt > 5) {
      throw new Error(
        "Failed to connect to sqlDB after " + (attempt - 1) + " attempts"
      );
    }

    try {
      await this.sequelize.authenticate();
      console.info("✅ Connected to sqlDB.");
      // await this.sequelize.sync({ alter: true });
    } catch (err) {
      console.error(err.message);
      await new Promise((r) => setTimeout(r, 2000));
      console.error(`Attempt ${attempt}: Reconnecting to sqlDB...`);
      return this.connect(++attempt);
    }
  }
}

const sqlDB = new Class();
export default sqlDB;
