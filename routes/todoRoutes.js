const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

/* ================= CREATE TODO ================= */
router.post("/", async (req, res) => {
  try {
    const { title, note, status, owner } = req.body;

    const todo = new Todo({
      title,
      note,
      status,
      owner,
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= GET TODOS ================= */
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= UPDATE TODO ================= */
router.put("/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= DELETE TODO ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
