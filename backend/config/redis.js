import Redis from "redis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {},
});

redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("error", (error) => console.error("Redis Error:", error));

export default redisClient;
