const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ================= CREATE USER ================= */
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error); // VERY IMPORTANT FOR DEBUG
    res.status(500).json({ error: error.message });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= DELETE USER ================= */
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
