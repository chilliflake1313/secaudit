const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL);

const scanQueue = new Queue("scan", { connection });

module.exports = { scanQueue, connection };
