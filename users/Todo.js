const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    note: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    owner: { type: String, required: true },
  },
  { timestamps: true },
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
