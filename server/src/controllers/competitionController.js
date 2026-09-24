const Competition = require("../models/Competition");
const { getCompetitionPhase } = require("../utils/competitionLifecycle");

const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(
      req.params.id
    );

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    const currentPhase = getCompetitionPhase(
      competition
    );

    const remainingSpots = Math.max(
      0,
      competition.maxParticipants -
        competition.registeredCount
    );

    res.status(200).json({
      success: true,
      competition,
      currentPhase,
      remainingSpots,
    });
  } catch (error) {
    console.error(
      "Competition fetch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch competition",
    });
  }
};

module.exports = {
  getCompetitionById,
};