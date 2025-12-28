import { MYSQL_DATABASE_NAME, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USERNAME } from "./base.config.mjs";
import { Sequelize } from "sequelize";
import mysql from "mysql2";

export const mysqlConnection = mysql
  .createPool({
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  })
  .on("error", (err) => {
    console.error("MySQL Streaming Pool Error =>", err);
  });

class Class {
  constructor() {
    this.sequelize = new Sequelize(MYSQL_DATABASE_NAME, MYSQL_USERNAME, MYSQL_PASSWORD, {
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      dialect: "mysql",
      timezone: "+05:30",
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }
  async connect(attempt = 1) {
    if (attempt > 5) {
      throw new Error("Failed to connect to sqlDB after " + (attempt - 1) + " attempts");
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
