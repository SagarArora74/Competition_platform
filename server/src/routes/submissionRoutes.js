const express = require("express");

const {
  createSubmission,
  getMySubmission,
} = require("../controllers/submissionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:competitionId/submit",
  authMiddleware,
  createSubmission
);

router.get(
  "/:competitionId/submission",
  authMiddleware,
  getMySubmission
);

module.exports = router;