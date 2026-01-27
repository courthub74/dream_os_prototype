const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL);

const aiQueue = new Queue("ai", { connection });

module.exports = { aiQueue, connection };
