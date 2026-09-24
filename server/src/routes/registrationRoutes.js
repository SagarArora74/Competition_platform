const express = require("express");

const {
  registerForCompetition,
  getRegistrationStatus,
  cancelRegistration,
} = require("../controllers/registrationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:competitionId/register",
  authMiddleware,
  registerForCompetition
);

router.get(
  "/:competitionId/registration-status",
  authMiddleware,
  getRegistrationStatus
);

router.delete(
  "/:competitionId/register",
  authMiddleware,
  cancelRegistration
);

module.exports = router;