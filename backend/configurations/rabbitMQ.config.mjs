import amqp from "amqplib";
import { RABBITMQ_URI } from "./base.config.mjs";

class RabbitMQClient {
  constructor(uri) {
    if (!uri) throw new Error("RabbitMQ URI is required");
    this.uri = uri;
    this.connection = null;
    this.channels = new Map(); // cache channels per purpose
  }

  async connect(attempt = 1) {

    if (this.connection) return this.connection;
    
    if (attempt > 5) {
      throw new Error(
        `Failed to connect to RabbitMQ after ${attempt - 1} attempts`
      );
    }

    try {
      this.connection = await amqp.connect(this.uri);
      console.info("✅ Connected to rabbitMQ");

      // Reconnect on connection loss
      this.connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
        this.connection = null;
        this.channels.clear();
        setTimeout(() => this.connect(), 2000);
      });

      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });
    } catch (err) {
      console.error(`❌ Connection attempt ${attempt} failed:`, err.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return this.connect(attempt + 1);
    }
  }

  async getChannel(name = "default") {
    if (!this.connection) {
      // console.warn("No RabbitMQ connection. Connecting...");
      await this.connect();
    }

    if (!this.channels.has(name)) {
      const channel = await this.connection.createChannel();
      this.channels.set(name, channel);
    }

    return this.channels.get(name);
  }

  async publish(exchange, routingKey, message, options = { mandatory: true }) {
    const channel = await this.getChannel("publisher");
    await channel.assertExchange(exchange, "direct", { durable: true });
    const msgBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(exchange, routingKey, msgBuffer, options);
  }

  async consume(queue, handler, { exchange, routingKey, prefetch = 1 } = {}) {
    const channel = await this.getChannel(`consumer:${queue}`);

    if (exchange) {
      await channel.assertExchange(exchange, "direct", { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, routingKey);
    } else {
      await channel.assertQueue(queue, { durable: true });
    }

    await channel.prefetch(prefetch);

    channel.on("return", (msg) => {
      console.error("Message returned — queue binding not ready!", msg);
    });

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          channel.ack(msg);
        } catch (err) {
          console.error(`❌ Error processing message from ${queue}:`, err);
          channel.nack(msg, false, false);
        }
      }
    });

    
  }
}

const rabbitMQ = new RabbitMQClient(RABBITMQ_URI);
export default rabbitMQ;
