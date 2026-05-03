const Scan = require("../models/Scan");

exports.createScan = async (req, res) => {
  const { target } = req.body;

  const scan = await Scan.create({
    target,
    status: "pending"
  });

  simulateScan(scan._id);

  res.json({ id: scan._id });
};

exports.getScan = async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  res.json(scan);
};

async function simulateScan(id) {
  const scan = await Scan.findById(id);

  if (!scan) return;

  scan.status = "running";
  await scan.save();

  setTimeout(async () => {
    scan.status = "completed";
    scan.score = 78;
    scan.confidence = "medium";
    scan.coverage_percent = 65;
    scan.issues = [
      {
        title: "Outdated dependency",
        severity: "high",
        description: "Package vulnerable",
        fix: "Upgrade package"
      }
    ];
    scan.warnings = ["Partial scan – some checks failed"];
    await scan.save();
  }, 4000);
}
