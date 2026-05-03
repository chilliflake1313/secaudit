const Scan = require("../models/Scan");
const { runScan } = require("../services/scan.service");

exports.createScan = async (req, res) => {
  const { target } = req.body;

  const scan = await Scan.create({
    target,
    status: "pending"
  });

  runScan(scan._id);

  res.json({ id: scan._id });
};

exports.getScan = async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  res.json(scan);
};
