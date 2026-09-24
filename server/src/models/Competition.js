const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "SUBMISSION_OPEN",
        "SUBMISSION_CLOSED",
        "JUDGING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    prizePool: {
      type: Number,
      required: true,
      min: 0,
    },

    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    judge: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      title: {
        type: String,
        trim: true,
      },

      experience: {
        type: String,
        trim: true,
      },

      image: {
        type: String,
        trim: true,
      },

      videoUrl: {
        type: String,
        trim: true,
      },
    },

    dates: {
      registrationDeadline: {
        type: Date,
        required: true,
      },

      submissionStart: {
        type: Date,
        required: true,
      },

      submissionDeadline: {
        type: Date,
        required: true,
      },

      resultDate: {
        type: Date,
        required: true,
      },
    },

    rewards: [
      {
        position: {
          type: Number,
          required: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Useful for competition listing/filtering.
competitionSchema.index({ status: 1 });

// Useful for date-based competition queries.
competitionSchema.index({
  "dates.registrationDeadline": 1,
  "dates.submissionStart": 1,
  "dates.submissionDeadline": 1,
});

module.exports = mongoose.model(
  "Competition",
  competitionSchema
);