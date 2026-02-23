const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

/* ================= CREATE TASK ================= */

router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= GET ALL TASKS ================= */

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= UPDATE TASK ================= */

router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,

      req.body,
      { new: true },
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= UPDATE TASK STATUS ================= */

router.put("/:id/status", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= DELETE TASK ================= */

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
