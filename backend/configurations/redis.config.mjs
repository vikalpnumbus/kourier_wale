import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./base.config.mjs";

class RedisClient {
  constructor() {
    this.redis = null;
  }

  async connect(attempt = 1) {
    const MAX_ATTEMPTS = 5;

    try {
      this.redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy: () => null,
      });

      this.redis.on("connect", () => {
        console.info("✅ Redis connected");
      });

      this.redis.on("error", (err) => {
        console.error(`🟡 ${new Date()} Redis error (attempt ${attempt}):`, err.message);
      });

      this.redis.on("end", () => {
        console.warn("🟡 Redis connection closed. Retrying...");

        setTimeout(() => {
          this.connect(attempt + 1);
        }, attempt * 1000);
      });
    } catch (error) {
      console.error(
        `❌ Redis connection failed (attempt ${attempt}):`,
        err.message
      );
      if (attempt < MAX_ATTEMPTS) {
        console.info(`🟡 Retrying in ${attempt} seconds...`);
        setTimeout(() => this.connect(attempt + 1), attempt * 1000);
      } else {
        console.error("❌ Max retry attempts reached. Redis unavailable.");
      }
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
