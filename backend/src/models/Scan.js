const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema(
  {
    target: String,
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending"
    },
    score: Number,
    confidence: String,
    coverage_percent: Number,
    issues: Array,
    warnings: Array,
    metadata: Object,
    error: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", ScanSchema);
