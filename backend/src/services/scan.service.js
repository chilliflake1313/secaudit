const Scan = require("../models/Scan");
const { calculateScore } = require("../utils/scoring");

async function runScan(scanId) {
  const scan = await Scan.findById(scanId);
  if (!scan) return;

  scan.status = "running";
  await scan.save();

  try {
    const issues = await runChecks(scan.target);

    const score = calculateScore(issues);

    scan.status = "completed";
    scan.issues = issues;
    scan.score = score;
    scan.confidence = "medium";
    scan.coverage_percent = 65;
    scan.warnings = [];

    await scan.save();
  } catch (err) {
    scan.status = "failed";
    scan.error = err.message;
    await scan.save();
  }
}

async function runChecks(target) {
  return [
    {
      title: "Outdated dependency",
      severity: "high",
      description: "Package vulnerable",
      fix: "Upgrade package"
    }
  ];
}

module.exports = {
  runScan
};
