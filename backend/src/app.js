const express = require("express");
const cors = require("cors");

const scanRoutes = require("./routes/scan.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/scans", scanRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
