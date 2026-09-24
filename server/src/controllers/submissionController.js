const Submission = require("../models/Submission");
const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const {
  getCompetitionPhase,
} = require("../utils/competitionLifecycle");

const createSubmission = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const userId = req.user.id;

    const {
      title,
      description,
      videoUrl,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !videoUrl?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, and video URL are required",
      });
    }

    // Validate URL
    let parsedUrl;

    try {
      parsedUrl = new URL(videoUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid video URL",
      });
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return res.status(400).json({
        success: false,
        message: "Video URL must use http or https",
      });
    }

    // Find competition
    const competition =
      await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    const now = new Date();

    const currentPhase =
      getCompetitionPhase(
        competition,
        now
      );

    /*
      Submission is allowed in two situations:

      1. Competition has officially entered SUBMISSION_OPEN
      2. Registration is still open, but the user has
         already successfully registered.

      This allows a participant to submit immediately
      after registering.
    */

    const registration =
      await Registration.findOne({
        userId,
        competitionId,
        status: "REGISTERED",
      });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message:
          "You must be registered to submit",
      });
    }

    const submissionWindowOpen =
      currentPhase === "SUBMISSION_OPEN";

    const immediateSubmissionAllowed =
      currentPhase === "REGISTRATION_OPEN";

    if (
      !submissionWindowOpen &&
      !immediateSubmissionAllowed
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Submissions are currently closed",
      });
    }

    // Create submission
    const submission =
      await Submission.create({
        userId,
        competitionId,
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
      });

    return res.status(201).json({
      success: true,
      message: "Submission successful",
      submission,
    });
  } catch (error) {
    // Prevent duplicate submissions
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted for this competition",
      });
    }

    console.error(
      "Submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
};

// Get current user's submission
const getMySubmission = async (
  req,
  res
) => {
  try {
    const { competitionId } = req.params;
    const userId = req.user.id;

    const submission =
      await Submission.findOne({
        userId,
        competitionId,
      });

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error(
      "Submission fetch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch submission",
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmission,
};