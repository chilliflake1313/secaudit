const { Worker } = require("bullmq");
const { connection } = require("../queue/scan.queue");
const { runScan } = require("../services/scan.service");

new Worker(
  "scan",
  async (job) => {
    await runScan(job.data.scanId);
  },
  { connection }
);
