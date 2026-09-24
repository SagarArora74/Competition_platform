const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Competition",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"],
      default: "SUBMITTED",
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index(
  {
    userId: 1,
    competitionId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Submission",
  submissionSchema
);