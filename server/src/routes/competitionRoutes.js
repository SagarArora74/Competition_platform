const express = require("express");

const {
  getCompetitionById,
} = require("../controllers/competitionController");

const router = express.Router();

router.get("/:id", getCompetitionById);

module.exports = router;