const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true }, // task or todo
    tasks: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
