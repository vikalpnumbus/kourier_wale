import { col, fn, literal, Op, where } from "sequelize";
import FactoryRepository from "../../../repositories/factory.repository.mjs";
import ProductsService from "../../products.service.mjs";
import ChannelService from "../../channel.service.mjs";
import sqlDB, { mysqlConnection } from "../../../configurations/sql.config.mjs";
import { stringify } from "csv-stringify";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { Transform } from "stream";

const queryGenerator = sqlDB.sequelize.getQueryInterface().queryGenerator;

class Service {
  constructor() {
    this.MAX_PRODUCTS = 5;
    this.BATCH_SIZE = 50;
    this.exportJobRepository = FactoryRepository.getRepository("exportJobs");
    this.error = null;
  }

  async getData({ filters, exportJobId }) {
    try {
      const sql =
        "SELECT `remittance_batch`.*, `remittances`.`id` AS `remittances.id`, `remittances`.`userId` AS `remittances.userId`, `remittances`.`awb_number` AS `remittances.awb_number`, `remittances`.`collectable_amount` AS `remittances.collectable_amount`, `remittances`.`batch_id` AS `remittances.batch_id`, `remittances`.`createdAt` AS `remittances.createdAt`, `remittances`.`updatedAt` AS `remittances.updatedAt`, `remittances->user`.`id` AS `remittances.user.id`, `remittances->user`.`seller_remit_cycle` AS `remittances.user.seller_remit_cycle`, `remittances->user`.`wallet_balance` AS `remittances.user.wallet_balance`, `remittances->user`.`companyName` AS `remittances.user.companyName` FROM (SELECT `remittance_batch`.`id`, `remittance_batch`.`remittance_amount`, `remittance_batch`.`recieved_from_courier`, `remittance_batch`.`remittance_status`, `remittance_batch`.`remarks`, `remittance_batch`.`createdAt`, `remittance_batch`.`updatedAt` FROM `remittance_batch` AS `remittance_batch` LIMIT 0, 50) AS `remittance_batch` LEFT OUTER JOIN `remittance` AS `remittances` ON `remittance_batch`.`id` = `remittances`.`batch_id` LEFT OUTER JOIN `users` AS `remittances->user` ON `remittances`.`userId` = `remittances->user`.`id`";
      const countQuery = `SELECT count(*) FROM remittance_batch`;
      const [rows] = await mysqlConnection.promise().query(countQuery);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "processing", total_count: rows?.[0]?.["count(*)"] });

      let columns = [
        "id",
        "remittance_amount",
        "recieved_from_courier",
        "remittance_status",
        "remarks",
        "createdAt",
        "updatedAt",
        "remittances.id",
        "remittances.userId",
        "remittances.awb_number",
        "remittances.collectable_amount",
        "remittances.batch_id",
        "remittances.createdAt",
        "remittances.updatedAt",
        "remittances.user.id",
        "remittances.user.seller_remit_cycle",
        "remittances.user.wallet_balance",
        "remittances.user.companyName",
      ];

      const csvStream = stringify({
        header: true,
        columns,
      });

      const dbStream = mysqlConnection.query(sql).stream({ highWaterMark: 1000 });
      dbStream.on("data", (row) => console.log(row));
      let processed_count = 0;
      const transformStream = new Transform({
        objectMode: true,
        async transform(e, _, callback) {
          ++processed_count;
          if (processed_count % AdminRemittanceExportsHandler.BATCH_SIZE === 0) {
            await AdminRemittanceExportsHandler.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count });
          }

          let row = {
            id: e["id"],
            remittance_amount: e["remittance_amount"],
            recieved_from_courier: e["recieved_from_courier"],
            remittance_status: e["remittance_status"],
            remarks: e["remarks"],
            createdAt: e["createdAt"],
            updatedAt: e["updatedAt"],
            "remittances.id": e["remittances.id"],
            "remittances.userId": e["remittances.userId"],
            "remittances.awb_number": e["remittances.awb_number"],
            "remittances.collectable_amount": e["remittances.collectable_amount"],
            "remittances.batch_id": e["remittances.batch_id"],
            "remittances.createdAt": e["remittances.createdAt"],
            "remittances.updatedAt": e["remittances.updatedAt"],
            "remittances.user.id": e["remittances.user.id"],
            "remittances.user.seller_remit_cycle": e["remittances.user.seller_remit_cycle"],
            "remittances.user.wallet_balance": e["remittances.user.wallet_balance"],
            "remittances.user.companyName": e["remittances.user.companyName"],
          };

          callback(null, row);
        },
      });

      const dir = path.join("uploads", "exports", "remittance");
      fs.mkdirSync(dir, { recursive: true });

      const uploadPath = path.join(dir, `${Date.now()}.remittance.csv`);

      const fileStream = fs.createWriteStream(uploadPath);

      await pipeline(dbStream, transformStream, csvStream, fileStream);

      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { processed_count, status: "completed", file_url: uploadPath });

      return dbStream;
    } catch (error) {
      await this.exportJobRepository.findOneAndUpdate({ id: exportJobId }, { status: "failed", error: error?.message || "Some error occured" });
      throw error;
    }
  }
}

const AdminRemittanceExportsHandler = new Service();
export default AdminRemittanceExportsHandler;
