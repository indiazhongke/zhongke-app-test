const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    priority: String,
    dueDate: String,
    assignedUser: String,
    team: String,
    status: {
      type: String,
      default: "Pending",
    },
    note: String,
    fileName: String,
    fileData: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
