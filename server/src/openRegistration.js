require("dotenv").config();

const mongoose = require("mongoose");
const Competition = require("./models/Competition");

const competitionId = "6ab40cac6a7fcdf6f1a72790";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const now = new Date();

    // Registration closes 30 days from now
    const registrationDeadline = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Submission officially starts when registration closes
    const submissionStart = new Date(
      registrationDeadline
    );

    // Submission closes 32 days from now
    const submissionDeadline = new Date(
      now.getTime() + 32 * 24 * 60 * 60 * 1000
    );

    await Competition.findByIdAndUpdate(
      competitionId,
      {
        $set: {
          status: "REGISTRATION_OPEN",
          "dates.registrationDeadline": registrationDeadline,
          "dates.submissionStart": submissionStart,
          "dates.submissionDeadline": submissionDeadline,
        },
      }
    );

    console.log("Competition dates updated successfully.");
    console.log(
      "Registration deadline:",
      registrationDeadline.toString()
    );
    console.log(
      "Submission starts:",
      submissionStart.toString()
    );
    console.log(
      "Submission deadline:",
      submissionDeadline.toString()
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();