const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

/* CREATE */
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const saved = await notification.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET ALL */
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* MARK AS READ */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE ALL */
router.delete("/", async (req, res) => {
  try {
    await Notification.deleteMany();
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
