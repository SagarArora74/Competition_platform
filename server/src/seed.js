require("dotenv").config();

const mongoose = require("mongoose");
const Competition = require("./models/Competition");

const createCompetition = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const competition = await Competition.create({
      title: "Feedants Classical Dance",
      status: "REGISTRATION_OPEN",
      prizePool: 1500,
      entryFee: 99,
      maxParticipants: 20,
      registeredCount: 0,
      description:
        "A classical dance competition where participants can showcase their talent.",
        judge: {
        name: "Manju Dubey",
        title: "Professional Kathak Dancer",
        experience: "12+ Years of Experience",
        image: "https://via.placeholder.com/150",
        videoUrl: "https://example.com/judge-video",
        },
      dates: {
        registrationDeadline: new Date("2026-09-30T23:59:59"),
        submissionStart: new Date("2026-10-01T00:00:00"),
        submissionDeadline: new Date("2026-10-05T23:59:59"),
        resultDate: new Date("2026-10-10T18:00:00"),
      },
      rewards: [
          {
            position: 1,
            amount: 550,
          },
          {
            position: 2,
            amount: 300,
          },
          {
            position: 3,
            amount: 240,
          },
          {
            position: 4,
            amount: 200,
          },
          {
            position: 5,
            amount: 130,
          },
          {
            position: 6,
            amount: 80,
          },
        ],
    });

    console.log("Competition created:");
    console.log(competition);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

createCompetition();