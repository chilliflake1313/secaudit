require('dotenv').config();
const mongoose = require('mongoose');
const { Worker } = require("bullmq");
const { connection } = require("../queue/scan.queue");
const { runScan } = require("../services/scan.service");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 5 });
  } catch (err) {
    console.error('Worker Mongo connect error', err);
    process.exit(1);
  }

  new Worker(
    "scan",
    async (job) => {
      await runScan(job.data.scanId);
    },
    { connection }
  );
})();
