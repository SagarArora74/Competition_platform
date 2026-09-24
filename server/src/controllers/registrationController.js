const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Competition = require("../models/Competition");
const { getCompetitionPhase } = require("../utils/competitionLifecycle");

// Register user for competition
const registerForCompetition = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { competitionId } = req.params;
    const userId = req.user.id;

    let registration;

    await session.withTransaction(async () => {
      const now = new Date();

      /*
       * Registration is allowed only when:
       * 1. Competition exists
       * 2. Competition is in registration phase
       * 3. Registration deadline has not passed
       * 4. Competition is not full
       */
      const competition = await Competition.findOne({
        _id: competitionId,
      }).session(session);

      if (!competition) {
        throw new Error("COMPETITION_NOT_FOUND");
      }

      const currentPhase = getCompetitionPhase(
        competition,
        now
      );

      if (currentPhase !== "REGISTRATION_OPEN") {
        throw new Error("REGISTRATION_UNAVAILABLE");
      }

      /*
       * Atomic participant count increment.
       *
       * This prevents two simultaneous requests from
       * registering users beyond maxParticipants.
       */
      const updatedCompetition =
        await Competition.findOneAndUpdate(
          {
            _id: competitionId,

            "dates.registrationDeadline": {
              $gt: now,
            },

            $expr: {
              $lt: [
                "$registeredCount",
                "$maxParticipants",
              ],
            },
          },
          {
            $inc: {
              registeredCount: 1,
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedCompetition) {
        throw new Error("REGISTRATION_UNAVAILABLE");
      }

      const registrations =
        await Registration.create(
          [
            {
              userId,
              competitionId,
              status: "REGISTERED",
            },
          ],
          { session }
        );

      registration = registrations[0];
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered",
      registration,
    });
  } catch (error) {
    if (
      error.message ===
      "COMPETITION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    if (
      error.message ===
      "REGISTRATION_UNAVAILABLE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration is closed, expired, or competition is full",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    await session.endSession();
  }
};

// Get current user's registration status
const getRegistrationStatus = async (
  req,
  res
) => {
  try {
    const { competitionId } = req.params;
    const userId = req.user.id;

    const registration =
      await Registration.findOne({
        userId,
        competitionId,
        status: "REGISTERED",
      });

    return res.status(200).json({
      success: true,
      isRegistered: !!registration,
    });
  } catch (error) {
    console.error(
      "Registration status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch registration status",
    });
  }
};

// Cancel registration
const cancelRegistration = async (
  req,
  res
) => {
  const session = await mongoose.startSession();

  try {
    const { competitionId } = req.params;
    const userId = req.user.id;

    await session.withTransaction(
      async () => {
        const now = new Date();

        const competition =
          await Competition.findById(
            competitionId
          ).session(session);

        if (!competition) {
          throw new Error(
            "COMPETITION_NOT_FOUND"
          );
        }

        /*
         * A user can cancel only while registration
         * is still open.
         */
        const currentPhase =
          getCompetitionPhase(
            competition,
            now
          );

        if (
          currentPhase !==
          "REGISTRATION_OPEN"
        ) {
          throw new Error(
            "CANCELLATION_CLOSED"
          );
        }

        const registration =
          await Registration.findOneAndUpdate(
            {
              userId,
              competitionId,
              status: "REGISTERED",
            },
            {
              $set: {
                status: "CANCELLED",
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!registration) {
          throw new Error(
            "REGISTRATION_NOT_FOUND"
          );
        }

        const updatedCompetition =
          await Competition.findOneAndUpdate(
            {
              _id: competitionId,
              registeredCount: {
                $gt: 0,
              },
            },
            {
              $inc: {
                registeredCount: -1,
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!updatedCompetition) {
          throw new Error(
            "COMPETITION_COUNT_ERROR"
          );
        }
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Registration cancelled successfully",
    });
  } catch (error) {
    if (
      error.message ===
      "COMPETITION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    if (
      error.message ===
      "CANCELLATION_CLOSED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration cancellation is no longer available",
      });
    }

    if (
      error.message ===
      "REGISTRATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Active registration not found",
      });
    }

    console.error(
      "Cancellation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel registration",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  registerForCompetition,
  getRegistrationStatus,
  cancelRegistration,
};