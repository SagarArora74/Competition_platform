const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["REGISTERED", "CANCELLED"],
      default: "REGISTERED",
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  {
    userId: 1,
    competitionId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);