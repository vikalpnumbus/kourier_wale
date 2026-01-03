import express from "express";
import * as config from "./configurations/base.config.mjs";
import cors from "cors";
import sqlDB from "./configurations/sql.config.mjs";
import rabbitMQ from "./configurations/rabbitMQ.config.mjs";
import globalRouter from "./routes/index.mjs";
import { Worker } from "node:worker_threads";
import redisClient from "./configurations/redis.config.mjs";
import path from "path";
import { fileURLToPath } from "url";

const { PORT } = config;
const app = express();
await redisClient.connect();
await sqlDB.connect();
await rabbitMQ.connect();

// const workers = [
//   new Worker("./workers/common.worker.mjs"),
//   new Worker("./workers/orders.worker.mjs"),
//   new Worker("./workers/shipping.worker.mjs"),
//   new Worker("./workers/products.worker.mjs"),
//   new Worker("./workers/warehouse.worker.mjs"),
// ];

// // Wait for workers to signal they are ready
// await Promise.all(
//   workers.map(
//     (w) =>
//       new Promise((resolve) => {
//         w.once("message", (msg) => {
//           if (msg === "ready") resolve();
//         });
//       })
//   )
// );

console.info("All consumers are ready. Starting API...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.success = ({ data, status = 200 }) => {
  if(config.NODE_ENV == 'production')
    console.info("OUTGOING RESPONSE:",JSON.stringify( {
      status,
      data: data || "",
    }), null, 2);
    return res.status(status).json({
      status,
      data: data || "",
    });
  };
  next();
});

app.use("/api/v1", globalRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// All other requests should return React's index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.use((error, req, res, next) => {
  const errorConfig = {
    url: req.originalUrl,
    status: error.status || undefined,
    message: error.message,
  };

  // console.error(errorConfig);

  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || "Some error occured.",
  });
});

app.listen(PORT || 8001, () => {
  const configuration = {
    ENVIRONMENT: process.env.NODE_ENV,
    ...config,
  };

  if (config.NODE_ENV === "production") {
    console.info("App configurations:");
    console.table(
      Object.keys(configuration)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
          acc[key] = configuration[key];
          return acc;
        }, {})
    );
  }
});

