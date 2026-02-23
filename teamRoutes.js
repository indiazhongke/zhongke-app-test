const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

/* CREATE TEAM */
router.post("/", async (req, res) => {
  try {
    const team = new Team(req.body);
    const savedTeam = await team.save();

    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET ALL TEAMS */
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE TEAM */
router.delete("/:id", async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Team deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
