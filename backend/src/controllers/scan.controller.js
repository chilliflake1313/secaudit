const Scan = require("../models/Scan");
const { scanQueue } = require("../queue/scan.queue");

exports.createScan = async (req, res) => {
  const { target } = req.body;

  const scan = await Scan.create({
    target,
    status: "pending"
  });

  await scanQueue.add("scan", { scanId: scan._id });

  res.json({ id: scan._id });
};

exports.getScan = async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  res.json(scan);
};
