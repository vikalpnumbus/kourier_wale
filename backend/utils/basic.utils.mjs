import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { stringify } from "csv-stringify/sync";
import { Readable } from "stream";
import FactoryRepository from "../repositories/factory.repository.mjs";
import redisClient from "../configurations/redis.config.mjs";

/**
 * readCsvAsArray is a function which is used to read data from a csv file.
 * @output Array
 */
export function readCsvAsArray(filesBuffer) {
  if (!filesBuffer) return false;
  return new Promise((resolve, reject) => {
    const results = [];

    Readable.from(filesBuffer)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

/**
 * createCsvFromArray is a function which is used to create csv file from a data array of objects.
 * @output CSV File
 */
export const createCsvFromArray = async ({ userId, data, dir = "others" }) => {
  const csvRepository = FactoryRepository.getRepository("csvLogs");
  const headers = Object.keys(data[0]);

  const csv = stringify(data, {
    header: true,
    columns: headers,
  });

  const uploadPath = path.join("uploads", dir);
  fs.mkdirSync(uploadPath, { recursive: true });

  const filePath = uploadPath + "/" + new Date().getTime() + ".csv";
  await csvRepository.save({
    userId,
    path: filePath,
  });
  fs.promises
    .writeFile(filePath, csv)
    .then(() => console.info("CSV saved!"))
    .catch(console.error);

  return csv;
};

export const formatDate_DD_MM_YYYY_HH_MM = (date_input) => {
  const date = new Date(date_input);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
  return formatted;
};

export const formatDate_YYYY_MM_DD = (date_input) => {
  const date = new Date(date_input);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formatted = `${year}-${month}-${day}`;
  return formatted;
};

export const formatDate_YYYY_MM_DD_HH_MM_SS = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
};

export const capitialiseFirstLetter = (input) => {
  if (!input) throw new Error("No text provided.");
  const text = input.toString();
  return text[0].toUpperCase() + text.slice(1);
};

export const withCache = async ({ key, ttl, fetcher }) => {
  const cached = await redisClient.redis.get(key);
  // if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redisClient.redis.set(key, JSON.stringify(data), "EX", ttl);

  return data;
};

export const redisScanKeys = async (pattern = "*") => {
  let cursor = "0";
  const keys = [];

  do {
    const [nextCursor, batch] = await redisClient.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);

    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  console.log("keys: ", keys);
  return keys;
};

class CustomMathClass {
  roundOff = (digit) => {
    try {
      return Math.floor(Number(digit).toFixed(2) * 100) / 100.0;
    } catch (error) {
      throw error;
    }
  };
}

const CustomMath = new CustomMathClass();
export default CustomMath;
