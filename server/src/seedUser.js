require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.create({
      name: "Test User",
      email: "testuser@feedants.com",
    });

    console.log("User created:");
    console.log(user);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

createUser();