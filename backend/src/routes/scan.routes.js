const express = require("express");
const {
  createScan,
  getScan
} = require("../controllers/scan.controller");

const router = express.Router();

router.post("/", createScan);
router.get("/:id", getScan);

module.exports = router;
