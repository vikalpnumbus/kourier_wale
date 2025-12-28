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

import csv from "csv-parser";
import { Readable } from "stream";
import { formatDate_YYYY_MM_DD_HH_MM_SS } from "../../../utils/basic.utils.mjs";

class Service {
  constructor() {
    this.BATCH_SIZE = 50;
    this.exportJobRepository = FactoryRepository.getRepository("exportJobs");
    this.remittanceSellerRepository = FactoryRepository.getRepository("remittanceSeller");
    this.error = null;
  }

  async createData({ file, importJobId }) {
    try {
      const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer.data);
      console.log("buffer: ", buffer);
      let updateBatch = [];
      const csvString = buffer.toString("utf-8");
      let total_count = csvString.split(/\r?\n/).filter((line) => line.trim() !== "").length - 1;
      let errorsOccurred = false;
      let processed_count = 0;
      await this.exportJobRepository.findOneAndUpdate({ id: importJobId }, { status: "processing", total_count });

      const csvStream = stringify({
        header: true,
        columns: ["remittanceId", "error"],
      });

      const dir = path.join("uploads", "imports", "remittances");
      fs.mkdirSync(dir, { recursive: true });

      const uploadPath = path.join(dir, `${Date.now()}.utrErrors.csv`);

      const fileStream = fs.createWriteStream(uploadPath);
      csvStream.pipe(fileStream);
      await pipeline(
        Readable.from(buffer),
        csv(),
        new Transform({
          objectMode: true,
          async transform(row, _, cb) {
            try {
              ++processed_count;
              if (processed_count % AdminUTRImportsHandler.BATCH_SIZE == 0)
                await AdminUTRImportsHandler.exportJobRepository.findOneAndUpdate({ id: importJobId }, { processed_count });
              const remittanceId = row["Remittance ID"];
              const utr = row["UTR Number"];
              const paidAmount = row["Remittance Paid"];

              // 1️⃣ VALIDATION
              const missingFields = [];
              if (!remittanceId) missingFields.push("Remittance ID");
              if (!utr) missingFields.push("UTR Number");
              if (!paidAmount) missingFields.push("Remittance Paid");

              if (missingFields.length) {
                errorsOccurred = true;
                csvStream.write({
                  remittanceId,
                  error: `Missing fields: ${missingFields.join(", ")}`,
                });

                return cb();
              }

              // 2️⃣ CHECK IF REMITTANCE EXISTS
              const remittance = await AdminUTRImportsHandler.remittanceSellerRepository.findOne({
                where: { id: remittanceId },
              });

              if (!remittance) {
                errorsOccurred = true;
                csvStream.write({
                  remittanceId,
                  error: "Remittance does not exist in DB",
                });
                return cb();
              }

              // 3️⃣ UPDATE STATUS
              updateBatch.push({
                id: remittanceId,
                utr_number: utr,
                remittance_paid_date: formatDate_YYYY_MM_DD_HH_MM_SS(),
                remittance_status: "paid",
              });

              if (updateBatch.length >= AdminUTRImportsHandler.BATCH_SIZE) {
                const ids = updateBatch.map((u) => Number(u.id));
                const utrCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.utr_number}'`).join(" ");
                const paidCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.remittance_paid_date}'`).join(" ");
                const statusCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.remittance_status}'`).join(" ");

                await sqlDB.sequelize.query(
                  `UPDATE remittance_seller SET remittance_status = CASE id ${statusCase} END, utr_number = CASE id ${utrCase} END,remittance_paid_date = CASE id ${paidCase} END WHERE id IN (${ids.join(
                    ","
                  )})`
                );

                updateBatch = [];
              }
              cb();
            } catch (err) {
              cb(err);
            }
          },
          async flush(cb) {
            if (updateBatch.length) {
              const ids = updateBatch.map((u) => Number(u.id));
              const utrCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.utr_number}'`).join(" ");
              const paidCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.remittance_paid_date}'`).join(" ");
              const statusCase = updateBatch.map((u) => `WHEN ${u.id} THEN '${u.remittance_status}'`).join(" ");

              await sqlDB.sequelize.query(
                `UPDATE remittance_seller SET remittance_status = CASE id ${statusCase} END, utr_number = CASE id ${utrCase} END, remittance_paid_date = CASE id ${paidCase} END 
                WHERE id IN (${ids.join(",")})`
              );
              await AdminUTRImportsHandler.exportJobRepository.findOneAndUpdate(
                { id: importJobId },
                {
                  processed_count,
                  status: !errorsOccurred ? "completed" : "failed",
                  file_url: !errorsOccurred ? "" : uploadPath,
                }
              );
            }
            csvStream.end();
            fileStream.end();
            cb();
          },
        })
      );
    } catch (error) {
      await this.exportJobRepository.findOneAndUpdate({ id: importJobId }, { status: "failed", error: error?.message || "Some error occured" });
      throw error;
    }
  }

  async validateHeaders(headers) {
    try {
      const allowedHeaders = ["UTR Number", "Remittance Paid", "Remittance ID"].sort();

      const missing = allowedHeaders.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        const error = new Error(`Missing required headers: ${missing.join(", ")}`);
        error.status = 400;
        throw error;
      }

      const invalid = headers.filter((h) => !allowedHeaders.includes(h));
      if (invalid.length > 0) {
        const error = new Error(`Invalid headers found: ${invalid.join(", ")}`);
        error.status = 400;
        throw error;
      }
      return true;
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const AdminUTRImportsHandler = new Service();
export default AdminUTRImportsHandler;
