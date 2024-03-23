import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

export const redis = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
      host: process.env.REDIS_HOSTNAME,
      port: Number(process.env.REDIS_PORT)
  }
});

redis.connect();