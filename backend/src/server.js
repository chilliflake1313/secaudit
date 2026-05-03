const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB error", err);
  });
