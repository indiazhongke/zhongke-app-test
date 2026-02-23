const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

router.get("/overview", async (req, res) => {
  try {
    const pending = await Task.countDocuments({ status: "Pending" });
    const progress = await Task.countDocuments({ status: "In Progress" });
    const completed = await Task.countDocuments({ status: "Completed" });

    // Calculate overdue (tasks with dueDate in the past and not completed)
    const overdue = await Task.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $exists: true, $ne: "" },
      dueDate: { $lt: new Date().toISOString().split('T')[0] }
    });

    res.json({
      pending,
      progress,
      completed,
      overdue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
